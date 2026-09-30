import type { ChangeEvent, HTMLInputTypeAttribute, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { FieldError, fieldClass, invalidField } from "./primitives";

interface BaseProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | undefined;
  required?: boolean;
  hint?: ReactNode;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

interface InputProps extends BaseProps {
  as?: "input";
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  maxLength?: number;
}

interface TextareaProps extends BaseProps {
  as: "textarea";
  rows?: number;
  maxLength?: number;
}

/** Labelled input with inline validation message, used by all customer-facing forms. */
export function FormField(props: InputProps | TextareaProps) {
  const {
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    required,
    hint,
    placeholder,
    className,
    inputClassName,
  } = props;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const shared = {
    id: name,
    name,
    value,
    placeholder,
    onBlur,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": cn(error && errorId, hint && hintId) || undefined,
    className: cn(fieldClass, error && invalidField, inputClassName),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };

  return (
    <label className={cn("block", className)} htmlFor={name}>
      <span className="mb-1 block text-xs font-semibold uppercase text-foreground/60">
        {label}
        {required && " *"}
      </span>
      {props.as === "textarea" ? (
        <textarea {...shared} rows={props.rows ?? 3} maxLength={props.maxLength} />
      ) : (
        <input
          {...shared}
          type={props.type ?? "text"}
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          maxLength={props.maxLength}
        />
      )}
      {hint && !error && (
        <span id={hintId} className="mt-1 block text-xs text-foreground/50">
          {hint}
        </span>
      )}
      <FieldError id={errorId} message={error} />
    </label>
  );
}

/** Focus and scroll to the first field with an error. */
export function focusFirstError(errors: Partial<Record<string, string>>) {
  const first = Object.keys(errors)[0];
  if (!first || typeof document === "undefined") return;
  const el = document.getElementById(first);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
  el?.focus({ preventScroll: true });
}
