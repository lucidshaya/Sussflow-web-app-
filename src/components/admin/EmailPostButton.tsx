import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { newsletterStatus, sendNewsletterBatch } from "@/functions/newsletter";
import { getAccessToken } from "@/lib/auth";
import { readableError } from "@/lib/validation";

type Status = Awaited<ReturnType<typeof newsletterStatus>>;

/** Emails a published article to the email list (Gmail, in batches; resumes where it stopped). */
export function EmailPostButton({ postId, title }: { postId: string; title: string }) {
  const getStatus = useServerFn(newsletterStatus);
  const sendBatch = useServerFn(sendNewsletterBatch);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [sending, setSending] = useState(false);
  const [sentNow, setSentNow] = useState(0);

  const load = async () => {
    setStatus(null);
    try {
      setStatus(await getStatus({ data: { accessToken: await getAccessToken(), postId } }));
    } catch (error) {
      toast.error(readableError(error));
      setOpen(false);
    }
  };

  const send = async () => {
    setSending(true);
    setSentNow(0);
    try {
      for (;;) {
        const result = await sendBatch({ data: { accessToken: await getAccessToken(), postId } });
        setSentNow((n) => n + result.sent);
        if (result.stopped) {
          toast.error(result.stopped);
          break;
        }
        if (result.remaining === 0 || result.sent === 0) {
          toast.success("Article emailed to your list");
          break;
        }
      }
    } catch (error) {
      toast.error(readableError(error));
    } finally {
      setSending(false);
      void load();
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (sending) return;
        setOpen(next);
        if (next) void load();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="small">
          <Mail className="size-4" /> Email to list
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Email this article to your list?</AlertDialogTitle>
          <AlertDialogDescription>“{title}”</AlertDialogDescription>
        </AlertDialogHeader>
        {!status ? (
          <p className="flex items-center gap-2 text-sm text-foreground/60">
            <Loader2 className="size-4 animate-spin" /> Checking your email list…
          </p>
        ) : !status.configured ? (
          <p className="text-sm text-alert">
            Email sending isn't set up yet. Add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel.
          </p>
        ) : (
          <div className="space-y-1 text-sm">
            <p>
              <strong>{status.subscribers}</strong>{" "}
              {status.subscribers === 1 ? "person is" : "people are"} on your email list.
            </p>
            {status.sent > 0 && <p>Already sent to {status.sent} of them.</p>}
            <p>
              Will send to <strong>{status.remaining}</strong>
              {status.remaining > 450 &&
                " — Gmail sends up to about 500 a day, so the rest will need another send tomorrow"}
              .
            </p>
            {sending && (
              <p className="flex items-center gap-2 font-semibold text-brand">
                <Loader2 className="size-4 animate-spin" /> Sent {sentNow} of {status.remaining}…
              </p>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={sending}>Close</AlertDialogCancel>
          <Button
            disabled={sending || !status?.configured || !status.remaining}
            onClick={() => void send()}
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}{" "}
            Send now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
