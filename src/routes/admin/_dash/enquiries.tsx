import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  adminCard,
  AdminPageHeader,
  ConfirmDelete,
  ErrorNote,
  Loading,
  Pill,
} from "@/components/admin/ui";
import { formatDate, titleCase } from "@/lib/format";
import { supabase, unwrap } from "@/lib/supabase";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
  type Enquiry,
  type EnquiryStatus,
  type EnquiryType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_dash/enquiries")({
  component: Enquiries,
});

const TYPE_LABEL: Record<EnquiryType, string> = {
  session: "Session booking",
  partnership: "Partnership",
  waitlist: "Email list",
  contact: "Contact",
};
const STATUS_TONE: Record<EnquiryStatus, "brand" | "neutral" | "leaf"> = {
  new: "brand",
  in_progress: "neutral",
  closed: "leaf",
};

function Enquiries() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<EnquiryType | "">("");
  const [open, setOpen] = useState<string | null>(null);

  const enquiries = useQuery({
    queryKey: ["admin", "enquiries", type],
    queryFn: async () => {
      let query = supabase.from("enquiries").select("*").order("created_at", { ascending: false });
      if (type) query = query.eq("type", type);
      return unwrap<Enquiry[]>(await query);
    },
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin"] });

  const setStatus = async (id: string, status: EnquiryStatus) => {
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("enquiries").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Enquiry deleted");
      refresh();
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description="Menstrual health session bookings, partnership requests, email-list sign-ups and contact messages."
      />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["", ...ENQUIRY_TYPES] as const).map((t) => (
          <button
            key={t || "all"}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              type === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-glass-border bg-glass hover:text-brand",
            )}
          >
            {t ? TYPE_LABEL[t] : "All"}
          </button>
        ))}
      </div>
      <ErrorNote error={enquiries.error} />
      {enquiries.isLoading ? (
        <Loading />
      ) : enquiries.data?.length ? (
        <div className="space-y-3">
          {enquiries.data.map((e) => (
            <article key={e.id} className={adminCard}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(open === e.id ? null : e.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 transition-transform",
                      open === e.id && "rotate-180",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {e.name}
                      {e.organisation && (
                        <span className="font-normal text-foreground/60"> · {e.organisation}</span>
                      )}
                    </span>
                    <span className="block text-xs text-foreground/55">
                      {e.email} · {formatDate(e.created_at)}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <Pill>{TYPE_LABEL[e.type]}</Pill>
                  <select
                    value={e.status}
                    onChange={(ev) => void setStatus(e.id, ev.target.value as EnquiryStatus)}
                    className="rounded-full border border-glass-border bg-glass px-3 py-1.5 text-xs font-semibold"
                    aria-label="Status"
                  >
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {titleCase(s)}
                      </option>
                    ))}
                  </select>
                  <Pill tone={STATUS_TONE[e.status]}>{titleCase(e.status)}</Pill>
                  <ConfirmDelete
                    title="Delete this enquiry?"
                    description="This permanently removes the message."
                    onConfirm={() => remove(e.id)}
                  />
                </div>
              </div>
              {open === e.id && (
                <div className="mt-4 grid gap-3 border-t border-foreground/10 pt-4 text-sm sm:grid-cols-2">
                  <Detail
                    label="Email"
                    value={
                      <a href={`mailto:${e.email}`} className="text-brand hover:underline">
                        {e.email}
                      </a>
                    }
                  />
                  <Detail
                    label="Phone"
                    value={
                      e.phone ? (
                        <a href={`tel:${e.phone}`} className="text-brand hover:underline">
                          {e.phone}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <Detail label="Location" value={e.location ?? "—"} />
                  <Detail label="Beneficiaries" value={e.beneficiaries?.toLocaleString() ?? "—"} />
                  <div className="sm:col-span-2">
                    <Detail label="Message" value={e.message ?? "—"} />
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className={adminCard}>
          <p className="text-center text-sm text-foreground/60">
            No enquiries yet. Forms on /education, /store-location and the footer land here.
          </p>
        </div>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-foreground/55">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
