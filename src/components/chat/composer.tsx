"use client";

import { SendHorizontal } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { FieldError } from "@/components/ui/field";
import { ErrorNotice } from "@/components/ui/notice";
import { LIMITS, messageError } from "@/lib/validation";

/**
 * Enter sends, Shift+Enter adds a line. Text is kept if sending fails. The
 * field stops at the API's 2,000 characters; an empty message is refused with
 * a short note rather than a dead button.
 */
export function Composer({
  onSend,
  sending,
  error,
}: {
  onSend: (text: string) => Promise<unknown>;
  sending: boolean;
  error: unknown;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const [problem, setProblem] = useState<string | undefined>();
  const field = useRef<HTMLTextAreaElement>(null);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (sending) return;
    const found = messageError(text);
    setProblem(found);
    if (found) {
      field.current?.focus();
      return;
    }
    try {
      await onSend(text.trim());
      setText("");
    } catch {
      // The error is shown below; the text stays so it can be sent again.
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form onSubmit={submit} className="border-t border-hairline bg-surface p-3">
      {error ? <ErrorNotice error={error} className="mb-3" /> : null}
      <div className="flex items-end gap-2">
        <label htmlFor={id} className="sr-only">
          Message
        </label>
        <textarea
          ref={field}
          id={id}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setProblem(undefined);
          }}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={LIMITS.chatMessage}
          placeholder="Type a message"
          className={`field-sizing-content focus-glow max-h-40 min-h-11 flex-1 resize-none rounded-field border bg-surface px-4 py-2 text-base placeholder:text-ink-muted ${problem ? "border-alert" : "border-hairline"}`}
          aria-invalid={problem ? true : undefined}
          aria-describedby={problem ? `${id}-error` : undefined}
        />
        <button
          type="submit"
          disabled={sending}
          aria-label="Send message"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-field bg-leash-dark text-surface shadow-cta transition duration-150 hover:brightness-90 active:scale-95 disabled:opacity-50 disabled:shadow-none"
        >
          <SendHorizontal className="size-5" aria-hidden />
        </button>
      </div>
      {problem ? (
        <FieldError id={`${id}-error`} className="mt-2">
          {problem}
        </FieldError>
      ) : null}
    </form>
  );
}
