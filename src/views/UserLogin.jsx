"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useNavigate } from "@/lib/router";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import AuthLayout from "../components/auth/AuthLayout";
import Field, { FormAlert, SubmitButton } from "../components/auth/Field";
import { rules, validate } from "../lib/validate";

const UserLogin = () => {
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
      const res = await signIn("user-credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });
      if (res?.ok) {
        navigate("/home");
        return;
      }
      setFormError(res?.error || "Invalid email or password");
      setForm((f) => ({ ...f, password: "" }));
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      role="user"
      title="Welcome back"
      subtitle="Log in to book rides and track your trips."
      footer={
        <>
          New to Speed?{" "}
          <Link to="/usersignup" className="font-semibold text-black underline">
            Create an account
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
            placeholder="you@example.com"
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
          <SubmitButton loading={loading} loadingText="Logging in…">
            Log in <FiArrowRight />
          </SubmitButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default UserLogin;
