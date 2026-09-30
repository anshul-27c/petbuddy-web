import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bookingNotes,
  decimalInput,
  digitsOnly,
  EMAIL_PATTERN,
  hasErrors,
  LIMITS,
  maxLengthError,
  messageError,
  normalisePhone,
  notesLimit,
  otpError,
  parseDecimal,
  parseWhole,
  phoneError,
  validateAddress,
  validateBookingNotes,
  validatePet,
  validateProfile,
  validateReview,
} from "./validation.ts";

describe("phone", () => {
  it("keeps the ten-digit national number from pasted formats", () => {
    assert.equal(normalisePhone("+91 98765 43210"), "9876543210");
    assert.equal(normalisePhone("09876543210"), "9876543210");
    assert.equal(normalisePhone("98765-43210 ext"), "9876543210");
    assert.equal(normalisePhone("12345678901234"), "1234567890");
  });

  it("explains what is wrong with a number", () => {
    assert.equal(phoneError(""), "Enter your mobile number.");
    assert.match(phoneError("98765") ?? "", /all 10 digits/);
    assert.match(phoneError("5876543210") ?? "", /start with 6, 7, 8 or 9/);
    assert.equal(phoneError("6000000000"), undefined);
    assert.equal(phoneError("9876543210"), undefined);
  });

  it("wants all six code digits", () => {
    assert.ok(otpError("12345"));
    assert.ok(otpError("12345a"));
    assert.equal(otpError("123456"), undefined);
  });
});

describe("number inputs", () => {
  it("parses decimals typed by a person", () => {
    assert.equal(parseDecimal(" 12.5 "), 12.5);
    assert.equal(parseDecimal("7,5"), 7.5);
    assert.equal(parseDecimal(".5"), 0.5);
    assert.equal(parseDecimal(""), null);
    assert.equal(parseDecimal("."), null);
    assert.equal(parseDecimal("1.2.3"), null);
    assert.equal(parseDecimal("12kg"), null);
  });

  it("parses whole numbers only", () => {
    assert.equal(parseWhole("07"), 7);
    assert.equal(parseWhole("1.5"), null);
    assert.equal(parseWhole("-1"), null);
  });

  it("filters decimal typing to one point and one decimal", () => {
    assert.equal(decimalInput("12.55"), "12.5");
    assert.equal(decimalInput("1.2.3"), "1.2");
    assert.equal(decimalInput("7,5"), "7.5");
    assert.equal(decimalInput("12345"), "123");
    assert.equal(decimalInput("abc4"), "4");
    assert.equal(decimalInput("."), ".");
  });

  it("keeps digits only, capped", () => {
    assert.equal(digitsOnly("24a80 01", 6), "248001");
    assert.equal(digitsOnly("1234567", 6), "123456");
  });
});

describe("profile", () => {
  it("accepts an empty profile and a complete one", () => {
    assert.deepEqual(validateProfile({ name: "", email: "" }), {});
    assert.deepEqual(validateProfile({ name: "Gaurav", email: "blockngoal@gmail.com" }), {});
  });

  it("caps the name at 80 characters and wants letters", () => {
    assert.ok(validateProfile({ name: "a".repeat(81), email: "" }).name);
    assert.equal(validateProfile({ name: ` ${"a".repeat(80)} `, email: "" }).name, undefined);
    assert.ok(validateProfile({ name: "1234", email: "" }).name);
    assert.equal(validateProfile({ name: "गौरव", email: "" }).name, undefined);
  });

  it("wants a complete email address", () => {
    for (const bad of ["a@b", "a@b.c", "a b@c.com", "@x.com", "name@", "name@.com"]) {
      assert.ok(validateProfile({ name: "", email: bad }).email, bad);
    }
    for (const good of ["a@b.co", "first.last@mail.example.in"]) {
      assert.ok(EMAIL_PATTERN.test(good), good);
    }
    assert.ok(validateProfile({ name: "", email: `${"a".repeat(250)}@b.co` }).email);
  });
});

describe("pet", () => {
  const base = {
    name: "Bruno",
    breed: "Labrador",
    years: "2",
    months: "3",
    weight: "28",
    temperament: [],
    vaccinationNote: "",
    vetName: "",
  };

  it("turns a good draft into age in months and weight", () => {
    const result = validatePet(base);
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.numbers, { ageMonths: 27, weightKg: 28 });
  });

  it("needs a name of 1 to 40 characters", () => {
    assert.ok(validatePet({ ...base, name: "  " }).errors.name);
    assert.ok(validatePet({ ...base, name: "x".repeat(41) }).errors.name);
    assert.equal(validatePet({ ...base, name: "x".repeat(40) }).errors.name, undefined);
  });

  it("caps breed, vet and vaccination note", () => {
    assert.ok(validatePet({ ...base, breed: "x".repeat(61) }).errors.breed);
    assert.ok(validatePet({ ...base, vetName: "x".repeat(121) }).errors.vetName);
    assert.ok(validatePet({ ...base, vaccinationNote: "x".repeat(201) }).errors.vaccinationNote);
  });

  it("checks age: whole numbers, 0 to 11 months, at most 30 years", () => {
    assert.ok(validatePet({ ...base, years: "", months: "" }).errors.age);
    assert.equal(validatePet({ ...base, years: "0", months: "4" }).numbers?.ageMonths, 4);
    assert.equal(validatePet({ ...base, years: "", months: "4" }).numbers?.ageMonths, 4);
    assert.ok(validatePet({ ...base, months: "12" }).errors.age);
    assert.ok(validatePet({ ...base, years: "30", months: "1" }).errors.age);
    assert.equal(validatePet({ ...base, years: "30", months: "0" }).numbers?.ageMonths, 360);
    assert.ok(validatePet({ ...base, years: "1.5" }).errors.age);
  });

  it("checks weight between 0.1 and 120 kg, to one decimal", () => {
    assert.ok(validatePet({ ...base, weight: "" }).errors.weightKg);
    assert.ok(validatePet({ ...base, weight: "0" }).errors.weightKg);
    assert.ok(validatePet({ ...base, weight: "0.04" }).errors.weightKg);
    assert.ok(validatePet({ ...base, weight: "120.1" }).errors.weightKg);
    assert.ok(validatePet({ ...base, weight: "1.2.3" }).errors.weightKg);
    assert.equal(validatePet({ ...base, weight: "0.1" }).numbers?.weightKg, 0.1);
    assert.equal(validatePet({ ...base, weight: "12.46" }).numbers?.weightKg, 12.5);
    assert.equal(validatePet({ ...base, weight: "120" }).numbers?.weightKg, 120);
  });

  it("allows up to five temperament traits", () => {
    assert.ok(validatePet({ ...base, temperament: ["a", "b", "c", "d", "e", "f"] }).errors.temperament);
    assert.equal(validatePet({ ...base, temperament: ["a", "b", "c", "d", "e"] }).errors.temperament, undefined);
  });
});

describe("address", () => {
  const base = {
    label: "Home",
    line1: "12 Rajpur Road",
    line2: "",
    area: "Dalanwala",
    city: "Dehradun",
    pincode: "248001",
    landmark: "",
    gateCode: "",
  };

  it("accepts a complete address", () => {
    assert.deepEqual(validateAddress(base), {});
  });

  it("needs label, first line, area and city", () => {
    const errors = validateAddress({ ...base, label: " ", line1: "", area: "", city: "" });
    assert.deepEqual(Object.keys(errors).sort(), ["area", "city", "label", "line1"]);
  });

  it("caps every field at the API's length", () => {
    const long = (n: number) => "x".repeat(n + 1);
    const errors = validateAddress({
      ...base,
      label: long(LIMITS.addressLabel),
      line1: long(LIMITS.line1),
      line2: long(LIMITS.line2),
      area: long(LIMITS.area),
      city: long(LIMITS.city),
      landmark: long(LIMITS.landmark),
      gateCode: long(LIMITS.gateCode),
    });
    assert.deepEqual(Object.keys(errors).sort(), ["area", "city", "gateCode", "label", "landmark", "line1", "line2"]);
  });

  it("wants six digits that do not start with 0", () => {
    assert.ok(validateAddress({ ...base, pincode: "" }).pincode);
    assert.ok(validateAddress({ ...base, pincode: "24800" }).pincode);
    assert.match(validateAddress({ ...base, pincode: "048001" }).pincode ?? "", /start with 0/);
    assert.equal(validateAddress({ ...base, pincode: "110001" }).pincode, undefined);
  });
});

describe("booking notes", () => {
  it("adds the gate code on its own line", () => {
    assert.equal(bookingNotes(" Pulls on the lead ", " 4821 "), "Pulls on the lead\nGate code: 4821");
    assert.equal(bookingNotes("", "4821"), "Gate code: 4821");
    assert.equal(bookingNotes("  ", ""), null);
  });

  it("leaves room for the gate code within 1000 characters", () => {
    assert.equal(notesLimit(""), 1000);
    assert.equal(notesLimit("4821"), 1000 - "Gate code: 4821".length - 1);
    const limit = notesLimit("4821");
    assert.equal(bookingNotes("x".repeat(limit), "4821")?.length, 1000);
    assert.deepEqual(validateBookingNotes("x".repeat(limit), "4821"), {});
    assert.ok(validateBookingNotes("x".repeat(limit + 1), "4821").notes);
    assert.ok(validateBookingNotes("", "x".repeat(21)).gateCode);
  });
});

describe("messages, reviews and notes", () => {
  it("wants 1 to 2000 characters in a message", () => {
    assert.ok(messageError("   "));
    assert.equal(messageError(" hi "), undefined);
    assert.equal(messageError("x".repeat(2000)), undefined);
    assert.match(messageError("x".repeat(2001)) ?? "", /2001/);
  });

  it("wants a 1 to 5 star rating and at most 1000 characters", () => {
    assert.ok(validateReview(0, "").rating);
    assert.ok(validateReview(6, "").rating);
    assert.deepEqual(validateReview(5, "Lovely"), {});
    assert.ok(validateReview(4, "x".repeat(1001)).text);
  });

  it("caps free text", () => {
    assert.equal(maxLengthError("x".repeat(500), 500), undefined);
    assert.ok(maxLengthError("x".repeat(501), 500, "the reason"));
  });

  it("knows when there are errors", () => {
    assert.equal(hasErrors({}), false);
    assert.equal(hasErrors({ name: undefined }), false);
    assert.equal(hasErrors({ name: "Enter a name." }), true);
  });
});
