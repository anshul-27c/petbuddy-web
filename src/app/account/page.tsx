"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Trash2, UserRound } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { AccountShell } from "@/components/account/account-nav";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { useSignOutAndLeave } from "@/components/layout/account-menu";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ChoiceCard, FieldError, TextField } from "@/components/ui/field";
import { ErrorNotice } from "@/components/ui/notice";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatPhone } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import type { LanguageCode, ProfileInput, UserProfile } from "@/lib/types";
import { useFieldErrors } from "@/lib/use-field-errors";
import { LIMITS, validateProfile } from "@/lib/validation";
import { PageTitle } from "@/components/layout/page-title";

type Field = "name" | "email" | "languageCode";

const SERVER_FIELDS: Record<string, Field> = { name: "name", email: "email", languageCode: "languageCode" };

function ProfileForm({ user }: { user: UserProfile }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const languageName = useId();
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [language, setLanguage] = useState<LanguageCode>(user.languageCode === "hi" ? "hi" : "en");
  const { errors, show, clear, fromServer, ref } = useFieldErrors<Field>();
  // The server's message, when none of its field errors landed on a field here.
  const [unmappedError, setUnmappedError] = useState<unknown>(null);

  const save = useMutation({
    mutationFn: (input: ProfileInput) => api.me.update(input),
    onSuccess: (me) => {
      queryClient.setQueryData(qk.me, me);
      toast({ title: "Profile saved" });
    },
    onError: (error) => {
      if (!fromServer(error, SERVER_FIELDS)) setUnmappedError(error);
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (save.isPending) return;
    setUnmappedError(null);
    if (show(validateProfile({ name, email }))) return;
    save.mutate({ name: name.trim() || null, email: email.trim() || null, languageCode: language });
  };

  return (
    <form ref={ref} onSubmit={submit} noValidate className="space-y-6">
      <TextField
        label="Name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          clear("name");
        }}
        error={errors.name}
        autoComplete="name"
        maxLength={LIMITS.profileName}
        hint="Carers see this name on your bookings."
      />
      <TextField
        label="Email"
        optional
        type="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          clear("email");
        }}
        error={errors.email}
        autoComplete="email"
        maxLength={LIMITS.email}
        hint="Carers do not see your email."
      />
      <fieldset data-invalid={errors.languageCode ? "true" : undefined} tabIndex={-1} className="outline-none">
        <legend className="text-sm font-semibold">Language</legend>
        <p className="mt-1 text-caption text-ink-muted">Used for app screens and messages. This website is in English.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            name={languageName}
            value="en"
            checked={language === "en"}
            onChange={() => {
              setLanguage("en");
              clear("languageCode");
            }}
            title="English"
          />
          <ChoiceCard
            name={languageName}
            value="hi"
            checked={language === "hi"}
            onChange={() => {
              setLanguage("hi");
              clear("languageCode");
            }}
            title={<span lang="hi">हिन्दी</span>}
            description="Hindi"
          />
        </div>
        {errors.languageCode ? <FieldError className="mt-2">{errors.languageCode}</FieldError> : null}
      </fieldset>
      {unmappedError ? <ErrorNotice error={unmappedError} /> : null}
      <div className="flex justify-end border-t border-hairline pt-5">
        <Button type="submit" loading={save.isPending}>
          Save profile
        </Button>
      </div>
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
    <Card className="flex flex-wrap items-center justify-between gap-4 border-alert/20">
      <div className="min-w-0 max-w-xl">
        <CardTitle>Delete account</CardTitle>
        <p className="mt-1 text-sm text-ink-muted">
          Removes your personal details and signs you out everywhere. You cannot delete it while a booking is
          requested, confirmed or under way.
        </p>
      </div>
      <Button
        variant="danger-outline"
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
    <AccountShell title="Your account">
      {me.isError && !user ? (
        <ErrorState fill error={me.error} onRetry={() => void me.refetch()} retrying={me.isFetching} />
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {user ? (
          <>
            <Card>
              <div className="mb-6 flex items-center gap-4 border-b border-hairline pb-6">
                <Avatar
                  name={user.name?.trim() || "You"}
                  size="lg"
                  icon={user.name?.trim() ? undefined : <UserRound className="size-6" aria-hidden />}
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{user.name?.trim() || "Add your name"}</p>
                  <p className="mt-1 text-sm text-ink-muted">{formatPhone(user.phone)}</p>
                </div>
              </div>
              <ProfileForm user={user} />
            </Card>
            <Card className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <CardTitle>Sign out</CardTitle>
                <p className="mt-1 text-sm text-ink-muted">You can sign back in with a code sent to your phone.</p>
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
      )}
    </AccountShell>
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
