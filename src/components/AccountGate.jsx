"use client";
import React from "react";
import useVerifiedAccount from "../hooks/useVerifiedAccount";

// Renders children only after the account was confirmed against the database.
const AccountGate = ({ role, children }) => {
  const { state, retry } = useVerifiedAccount(role);

  if (state === "ok") return children;

  if (state === "error") {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-brand-navy">
          Couldn't verify your account
        </p>
        <p className="max-w-sm text-sm text-gray-500">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="rounded-xl bg-brand-navy px-6 py-3 font-semibold text-white hover:bg-black"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-brand-navy" />
    </div>
  );
};

export default AccountGate;
