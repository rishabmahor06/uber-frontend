"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useNavigate } from "@/lib/router";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import axios from "../utils/axios";
import AuthLayout from "../components/auth/AuthLayout";
import Field, { FormAlert, SubmitButton } from "../components/auth/Field";
import { rules, validate } from "../lib/validate";
import { apiError } from "../lib/maps";

const UserSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "" });
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
      firstname: rules.firstname,
      lastname: rules.lastname,
      email: rules.email,
      password: rules.password,
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await axios.post("/users/register", {
        fullname: {
          firstname: form.firstname.trim(),
          ...(form.lastname.trim() && { lastname: form.lastname.trim() }),
        },
        email: form.email.trim(),
        password: form.password,
      });

      // account created -> start the session
      const res = await signIn("user-credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });
      if (res?.ok) {
        navigate("/home");
        return;
      }
      navigate("/userlogin");
      return;
    } catch (err) {
      setFormError(apiError(err, "Registration failed. Please try again."));
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      role="user"
      title="Create your account"
      subtitle="Sign up in a minute and book your first ride."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/userlogin" className="font-semibold text-black underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FormAlert>{formError}</FormAlert>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="First name"
              icon={FiUser}
              autoComplete="given-name"
              placeholder="Rishab"
              value={form.firstname}
              onChange={set("firstname")}
              error={errors.firstname}
            />
            <Field
              label="Last name"
              autoComplete="family-name"
              placeholder="Kumar (optional)"
              value={form.lastname}
              onChange={set("lastname")}
              error={errors.lastname}
            />
          </div>
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            hint="Use 6 or more characters."
          />
        </div>
        <div className="mt-7">
          <SubmitButton loading={loading} loadingText="Creating account…">
            Create account <FiArrowRight />
          </SubmitButton>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          By continuing you agree to Speed's Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
};

export default UserSignup;
