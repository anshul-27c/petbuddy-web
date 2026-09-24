/** Base URL of the PetBuddy API, without a trailing slash. */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"
).replace(/\/+$/, "");
