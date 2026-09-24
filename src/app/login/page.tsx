"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { OtpInput } from "@/components/auth/otp-input";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { ErrorNotice, Notice } from "@/components/ui/notice";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { api, isApiError } from "@/lib/api";
import { formatPhone } from "@/lib/format";
import { useCountdown } from "@/lib/hooks";
import type { OtpSent } from "@/lib/types";
import { safeNext } from "@/lib/utils";
import { isValidPhone, normalisePhone } from "@/lib/validation";
import { PageTitle } from "@/components/layout/page-title";

function PhoneStep({ onSent }: { onSent: (phone: string, sent: OtpSent) => void }) {
  const [phone, setPhone] = useState("");
  const [clientError, setClientError] = useState<string | undefined>();
  const send = useMutation({
    mutationFn: (value: string) => api.auth.sendOtp(value),
    onSuccess: (sent, value) => onSent(value, sent),
  });

  const serverFieldError = isApiError(send.error) ? send.error.fieldErrors.phone : undefined;
  const error = clientError ?? serverFieldError;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (send.isPending) return;
    if (!isValidPhone(phone)) {
      setClientError("Enter a 10-digit mobile number starting with 6, 7, 8 or 9.");
      return;
    }
    setClientError(undefined);
    send.mutate(phone);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h1 className="font-display text-headline font-semibold">What&apos;s your number?</h1>
        <p className="mt-1 text-ink-muted">We&apos;ll send a six-digit code to confirm it&apos;s you.</p>
      </div>
      <TextField
        label="Mobile number"
        leading="+91"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="98765 43210"
        value={phone}
        autoFocus
        onChange={(event) => {
          setPhone(normalisePhone(event.target.value));
          setClientError(undefined);
        }}
        error={error}
      />
      {send.error && !serverFieldError ? <ErrorNotice error={send.error} /> : null}
      <Button type="submit" size="lg" block loading={send.isPending}>
        Send code
      </Button>
    </form>
  );
}

function CodeStep({
  phone,
  sent,
  onResent,
  onChangeNumber,
  onVerified,
}: {
  phone: string;
  sent: OtpSent;
  onResent: (sent: OtpSent) => void;
  onChangeNumber: () => void;
  onVerified: () => void;
}) {
  const { signIn } = useAuth();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [deadline, setDeadline] = useState(() => Date.now() + sent.resendInSeconds * 1000);
  const secondsLeft = useCountdown(deadline);

  const verify = useMutation({
    mutationFn: (value: string) => api.auth.verifyOtp(phone, value),
    onSuccess: (session) => {
      signIn(session);
      onVerified();
    },
    onError: () => setCode(""),
  });

  const resend = useMutation({
    mutationFn: () => api.auth.sendOtp(phone),
    onSuccess: (next) => {
      onResent(next);
      setDeadline(Date.now() + next.resendInSeconds * 1000);
      setCode("");
      verify.reset();
      toast({ title: "New code sent", body: `Check the SMS on ${formatPhone(phone)}.` });
    },
  });

  const codeError = isApiError(verify.error) ? verify.error.fieldErrors.code : undefined;

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === 6 && !verify.isPending) verify.mutate(code);
      }}
    >
      <div>
        <button
          type="button"
          onClick={onChangeNumber}
          className="-ml-1 mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-field px-1 text-sm font-semibold text-leash-dark hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Change number
        </button>
        <h1 className="font-display text-headline font-semibold">Enter the code</h1>
        <p className="mt-1 text-ink-muted">Sent to {formatPhone(phone)}.</p>
      </div>

      {sent.devCode ? (
        <Notice tone="info" title="Test build">
          <span className="inline-flex items-center gap-1.5">
            <FlaskConical className="size-4 text-leash-dark" aria-hidden />
            Your code is <strong className="tabular-nums tracking-widest">{sent.devCode}</strong>
          </span>
        </Notice>
      ) : null}

      <div>
        <OtpInput
          value={code}
          onChange={(value) => {
            setCode(value);
            if (verify.error) verify.reset();
            // Submit as soon as all six digits are in.
            if (value.length === 6 && !verify.isPending && !verify.isSuccess) verify.mutate(value);
          }}
          disabled={verify.isPending || verify.isSuccess}
          invalid={Boolean(codeError)}
          describedBy={codeError ? "otp-error" : undefined}
        />
        {codeError ? (
          <p id="otp-error" className="mt-2 text-small font-medium text-alert">
            {codeError}
          </p>
        ) : null}
      </div>

      {verify.error && !codeError ? <ErrorNotice error={verify.error} /> : null}
      {resend.error ? <ErrorNotice error={resend.error} /> : null}

      <Button type="submit" size="lg" block loading={verify.isPending || verify.isSuccess} disabled={code.length < 6}>
        Verify
      </Button>

      <p className="text-center text-sm text-ink-muted">
        {secondsLeft > 0 ? (
          <span>Resend code in {secondsLeft}s</span>
        ) : (
          <button
            type="button"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            className="min-h-11 rounded-field px-2 font-semibold text-leash-dark hover:underline disabled:opacity-50"
          >
            {resend.isPending ? "Sending…" : "Resend code"}
          </button>
        )}
      </p>
      <p className="text-center text-small text-ink-muted">
        Codes last {Math.max(1, Math.round(sent.expiresInSeconds / 60))} minutes.
      </p>
    </form>
  );
}

function SignIn() {
  const { status } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [step, setStep] = useState<{ phone: string; sent: OtpSent } | null>(null);

  useEffect(() => {
    if (status === "signedIn") router.replace(next);
  }, [status, router, next]);

  // While the token is read, and while leaving after sign-in.
  if (status !== "signedOut") return <PageSkeleton />;

  return (
    <Container width="narrow" className="py-10 sm:py-16">
      <div className="mx-auto max-w-md rounded-card border border-hairline bg-surface p-6 sm:p-8">
        <LogoMark size="lg" />
        <div className="mt-6">
          {step ? (
            <CodeStep
              key={step.phone}
              phone={step.phone}
              sent={step.sent}
              onResent={(sent) => setStep({ phone: step.phone, sent })}
              onChangeNumber={() => setStep(null)}
              onVerified={() => router.replace(next)}
            />
          ) : (
            <PhoneStep onSent={(phone, sent) => setStep({ phone, sent })} />
          )}
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-md text-center text-small text-ink-muted">
        One account works on the website and in the PetBuddy app.
      </p>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <>
      <PageTitle title={"Sign in"} />
      <Suspense fallback={<PageSkeleton />}>
        <SignIn />
      </Suspense>
    </>
  );
}
