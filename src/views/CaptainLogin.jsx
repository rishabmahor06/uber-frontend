"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useNavigate } from "@/lib/router";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import AuthLayout from "../components/auth/AuthLayout";
import Field, { FormAlert, SubmitButton } from "../components/auth/Field";
import { rules, validate } from "../lib/validate";

const CaptainLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    const errs = validate(form, {
      email: rules.email,
      password: rules.required("Password"),
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await signIn("captain-credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });
      if (res?.ok) {
        navigate("/captain-home");
        return;
      }
      setFormError(res?.error || "Login failed. Please check your credentials.");
      setForm((f) => ({ ...f, password: "" }));
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      role="captain"
      title="Captain login"
      subtitle="Go online and start accepting rides."
      footer={
        <>
          New captain?{" "}
          <Link to="/captainsignup" className="font-semibold text-black underline">
            Register your vehicle
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FormAlert>{formError}</FormAlert>
        <div className="space-y-5">
          <Field
            label="Email address"
            icon={FiMail}
            type="email"
            autoComplete="username"
            placeholder="captain@example.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
          />
          <Field
            label="Password"
            icon={FiLock}
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
          />
        </div>
        <div className="mt-7">
          <SubmitButton role="captain" loading={loading} loadingText="Logging in…">
            Log in as captain <FiArrowRight />
          </SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default CaptainLogin;
