"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { ErrorNotice } from "./notice";

/** A yes/no question before something destructive, with the server's reason if it refuses. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Keep it",
  onConfirm,
  onClose,
  pending,
  error,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  pending: boolean;
  error: unknown;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      dismissible={!pending}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={pending}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="text-body">{body}</div>
      {error ? <ErrorNotice error={error} className="mt-4" /> : null}
    </Dialog>
  );
}
