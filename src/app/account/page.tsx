"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Trash2, UserRound } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { useSignOutAndLeave } from "@/components/layout/account-menu";
import { Container, PageHeader } from "@/components/layout/container";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ChoiceCard, TextField } from "@/components/ui/field";
import { ErrorNotice } from "@/components/ui/notice";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { api, isApiError } from "@/lib/api";
import { formatPhone } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { LanguageCode, ProfileInput, UserProfile } from "@/lib/types";
import { EMAIL_PATTERN, hasErrors, type FieldErrors } from "@/lib/validation";
import { PageTitle } from "@/components/layout/page-title";

type Field = "name" | "email" | "languageCode";

function ProfileForm({ user }: { user: UserProfile }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const languageName = useId();
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [language, setLanguage] = useState<LanguageCode>(user.languageCode === "hi" ? "hi" : "en");
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const save = useMutation({
    mutationFn: (input: ProfileInput) => api.me.update(input),
    onSuccess: (me) => {
      queryClient.setQueryData(qk.me, me);
      toast({ title: "Profile saved" });
    },
    onError: (error) => {
      if (isApiError(error)) {
        setErrors({
          name: error.fieldErrors.name,
          email: error.fieldErrors.email,
          languageCode: error.fieldErrors.languageCode,
        });
      }
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (save.isPending) return;
    const next: FieldErrors<Field> = {};
    if (name.trim().length > 80) next.name = "Keep your name under 80 characters.";
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) next.email = "Enter a complete email address, with an @ and a domain.";
    setErrors(next);
    if (hasErrors(next)) return;
    save.mutate({ name: name.trim() || null, email: email.trim() || null, languageCode: language });
  };

  const mapped = isApiError(save.error) && hasErrors({ ...save.error.fieldErrors });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <TextField
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        autoComplete="name"
        hint="Carers see this name on your bookings."
      />
      <TextField
        label="Email"
        optional
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        autoComplete="email"
        hint="Carers do not see your email."
      />
      <fieldset>
        <legend className="text-sm font-semibold">Language</legend>
        <p className="text-small text-ink-muted">Used for app screens and messages. This website is in English.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <ChoiceCard
            name={languageName}
            value="en"
            checked={language === "en"}
            onChange={() => setLanguage("en")}
            title="English"
          />
          <ChoiceCard
            name={languageName}
            value="hi"
            checked={language === "hi"}
            onChange={() => setLanguage("hi")}
            title={<span lang="hi">हिन्दी</span>}
            description="Hindi"
          />
        </div>
        {errors.languageCode ? <p className="mt-1.5 text-small font-medium text-alert">{errors.languageCode}</p> : null}
      </fieldset>
      {save.error && !mapped ? <ErrorNotice error={save.error} /> : null}
      <Button type="submit" loading={save.isPending}>
        Save profile
      </Button>
    </form>
  );
}

function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const { endSession } = useAuth();
  const toast = useToast();
  const remove = useMutation({
    mutationFn: api.me.remove,
    onSuccess: () => {
      // The server has already revoked every token for this account.
      endSession("/");
      toast({ title: "Your account has been deleted", tone: "info" });
    },
  });

  return (
    <Card>
      <h2 className="text-title font-semibold">Delete account</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Removes your personal details and signs you out everywhere. You cannot delete it while a booking is
        requested, confirmed or under way.
      </p>
      <Button
        variant="outline"
        className="mt-4 text-alert"
        onClick={() => {
          remove.reset();
          setOpen(true);
        }}
        icon={<Trash2 className="size-4" aria-hidden />}
      >
        Delete my account
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your account?"
        size="sm"
        dismissible={!remove.isPending}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={remove.isPending}>
              Keep my account
            </Button>
            <Button variant="danger" onClick={() => remove.mutate()} loading={remove.isPending}>
              Delete account
            </Button>
          </div>
        }
      >
        <p>
          Your personal details are removed and you are signed out on every device. This cannot be undone.
        </p>
        {remove.error ? <ErrorNotice error={remove.error} className="mt-4" /> : null}
      </Dialog>
    </Card>
  );
}

function Account() {
  const me = useQuery({ queryKey: qk.me, queryFn: api.me.get, staleTime: 5 * 60_000 });
  const signOutAndLeave = useSignOutAndLeave();
  const user = me.data?.user;
  return (
    <Container width="medium">
      <PageHeader title="Your account" />
      <AccountNav />
      <div className="mt-6 space-y-6">
        {me.isError && !user ? (
          <ErrorState error={me.error} onRetry={() => void me.refetch()} retrying={me.isFetching} />
        ) : user ? (
          <>
            <Card>
              <div className="mb-6 flex items-center gap-4">
                <Avatar
                  name={user.name?.trim() || "You"}
                  size="lg"
                  icon={user.name?.trim() ? undefined : <UserRound className="size-6" aria-hidden />}
                />
                <div className="min-w-0">
                  <p className="truncate text-title font-semibold">{user.name?.trim() || "Add your name"}</p>
                  <p className="text-sm text-ink-muted">{formatPhone(user.phone)}</p>
                </div>
              </div>
              <ProfileForm user={user} />
            </Card>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-title font-semibold">Sign out</h2>
                <p className="text-sm text-ink-muted">You can sign back in with a code sent to your phone.</p>
              </div>
              <Button variant="outline" onClick={() => void signOutAndLeave()} icon={<LogOut className="size-4" aria-hidden />}>
                Sign out
              </Button>
            </Card>
            <DeleteAccount />
          </>
        ) : (
          <CardSkeleton lines={4} />
        )}
      </div>
    </Container>
  );
}

export default function AccountPage() {
  return (
    <>
      <PageTitle title={"Your account"} />
      <RequireAuth>
        <Account />
      </RequireAuth>
    </>
  );
}
