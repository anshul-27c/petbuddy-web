"use client";

import { SendHorizontal } from "lucide-react";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { ErrorNotice } from "@/components/ui/notice";

const MAX = 2000;

/** Enter sends, Shift+Enter adds a line. Text is kept if sending fails. */
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
  const trimmed = text.trim();
  const tooLong = trimmed.length > MAX;

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!trimmed || tooLong || sending) return;
    try {
      await onSend(trimmed);
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
          id={id}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Type a message"
          className="field-sizing-content max-h-40 min-h-12 flex-1 resize-none rounded-field border border-hairline bg-surface px-3.5 py-3 text-body placeholder:text-ink-faint focus:border-leash focus:outline-2 focus:outline-offset-0 focus:outline-leash/30"
          aria-invalid={tooLong || undefined}
          aria-describedby={tooLong ? `${id}-long` : undefined}
        />
        <button
          type="submit"
          disabled={!trimmed || tooLong || sending}
          aria-label="Send message"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-field bg-leash text-surface transition-colors hover:bg-leash-dark disabled:opacity-50"
        >
          <SendHorizontal className="size-5" aria-hidden />
        </button>
      </div>
      {tooLong ? (
        <p id={`${id}-long`} className="mt-1.5 text-small font-medium text-alert">
          Messages can be up to {MAX} characters. This one is {trimmed.length}.
        </p>
      ) : null}
    </form>
  );
}
