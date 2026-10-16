"use client";
import React, { useId, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Labelled input with optional leading icon, inline error and password reveal.
const Field = ({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  error,
  hint,
  className = "",
  ...rest
}) => {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-800">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
        )}
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={`w-full rounded-xl border bg-gray-50 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${
            Icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-11" : "pr-4"} ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-brand-navy focus:ring-brand-navy/10"
          }`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-lg text-gray-400 hover:text-gray-700"
          >
            {show ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export const FormAlert = ({ children }) =>
  children ? (
    <div
      role="alert"
      className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {children}
    </div>
  ) : null;

export const SubmitButton = ({ loading, children, loadingText = "Please wait…", role = "user" }) => (
  <button
    type="submit"
    disabled={loading}
    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${
      role === "captain"
        ? "bg-brand-lime text-brand-navy hover:bg-brand-limeDark focus:ring-brand-lime/30"
        : "bg-brand-navy text-white hover:bg-black focus:ring-brand-navy/20"
    }`}
  >
    {loading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {loading ? loadingText : children}
  </button>
);

export default Field;
