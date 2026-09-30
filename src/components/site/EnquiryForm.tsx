import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { submitEnquiry } from "@/functions/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { EnquiryType } from "@/lib/types";
import { enquirySchema, readableError, toFieldErrors, type FieldErrors } from "@/lib/validation";

import { focusFirstError, FormField } from "./FormField";
import { fieldClass } from "./primitives";

const TYPE_LABELS: Record<EnquiryType, string> = {
  session: "Book a menstrual health session",
  partnership: "Partnership / CSR programme",
  waitlist: "Join the store waitlist",
  contact: "General question",
};

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  location: "",
  beneficiaries: "",
  message: "",
};
type Values = typeof EMPTY;

export function EnquiryForm({
  types,
  defaultType,
  showOrganisation = true,
}: {
  types: EnquiryType[];
  defaultType?: EnquiryType;
  showOrganisation?: boolean;
}) {
  const send = useServerFn(submitEnquiry);
  const [type, setType] = useState<EnquiryType>(defaultType ?? types[0] ?? "contact");
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const isOrg = type === "session" || type === "partnership";
  const validate = () => enquirySchema.safeParse({ type, ...values });

  const field = (key: keyof Values) => ({
    name: key,
    value: values[key],
    error: errors[key],
    onChange: (value: string) => {
      setValues((v) => ({ ...v, [key]: value }));
      if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    },
    onBlur: () => {
      if (!values[key]) return;
      const result = validate();
      setErrors((e) => ({
        ...e,
        [key]: result.success ? undefined : toFieldErrors(result.error)[key],
      }));
    },
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Supabase is not configured yet.");
      return;
    }
    const result = validate();
    if (!result.success) {
      const fieldErrors = toFieldErrors(result.error);
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }
    setBusy(true);
    try {
      // Send the raw values; the server re-validates with the same schema.
      await send({ data: { type, ...values } });
      setSent(true);
      toast.success("Thank you — our team will be in touch shortly.");
    } catch (error) {
      toast.error(readableError(error));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-glass-border bg-glass-soft p-5 font-semibold text-brand">
        <Check className="size-5" /> Thank you! We've received your message and will reply soon.
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
      {types.length > 1 && (
        <label className="sm:col-span-2" htmlFor="enquiry-type">
          <span className="mb-1 block text-xs font-semibold uppercase text-foreground/60">
            I'd like to
          </span>
          <select
            id="enquiry-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as EnquiryType);
              setErrors({});
            }}
            className={fieldClass}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
      )}
      <FormField
        {...field("name")}
        label="Your name"
        required
        autoComplete="name"
        maxLength={120}
      />
      <FormField
        {...field("email")}
        label="Email"
        required
        type="email"
        inputMode="email"
        autoComplete="email"
        maxLength={254}
      />
      <FormField
        {...field("phone")}
        label="Phone"
        required={isOrg}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={20}
        placeholder="0801 234 5678"
        hint="At least 9 digits"
      />
      {showOrganisation && isOrg && (
        <FormField {...field("organisation")} label="School / organisation" maxLength={160} />
      )}
      <FormField {...field("location")} label="Location (city, state)" maxLength={160} />
      {isOrg && (
        <FormField
          {...field("beneficiaries")}
          label="Number of girls / beneficiaries"
          type="number"
          inputMode="numeric"
        />
      )}
      <FormField
        {...field("message")}
        as="textarea"
        label="Message"
        rows={4}
        maxLength={2000}
        placeholder="Tell us a little about what you need"
        className="sm:col-span-2"
      />
      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  );
}
