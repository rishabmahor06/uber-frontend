"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useNavigate } from "@/lib/router";
import { FiMail, FiLock, FiUser, FiArrowRight, FiHash, FiDroplet, FiUsers } from "react-icons/fi";
import axios from "../utils/axios";
import AuthLayout from "../components/auth/AuthLayout";
import Field, { FormAlert, SubmitButton } from "../components/auth/Field";
import { rules, validate } from "../lib/validate";
import { apiError, VEHICLES } from "../lib/maps";

const DEFAULT_CAPACITY = { motorcycle: 1, auto: 3, car: 4 };

const SectionTitle = ({ n, children }) => (
  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-xs text-white">
      {n}
    </span>
    {children}
  </h2>
);

const CaptainSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    vehicleType: "car",
    color: "",
    plate: "",
    capacity: "4",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const pickType = (type) =>
    setForm((f) => ({ ...f, vehicleType: type, capacity: String(DEFAULT_CAPACITY[type]) }));

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    const errs = validate(form, {
      firstname: rules.firstname,
      lastname: rules.lastname,
      email: rules.email,
      password: rules.password,
      color: rules.color,
      plate: rules.plate,
      capacity: rules.capacity,
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await axios.post("/captain/register", {
        fullname: {
          firstname: form.firstname.trim(),
          ...(form.lastname.trim() && { lastname: form.lastname.trim() }),
        },
        email: form.email.trim(),
        password: form.password,
        vehicle: {
          color: form.color.trim(),
          plate: form.plate.trim().toUpperCase(),
          capacity: Number(form.capacity),
          vehicleType: form.vehicleType,
        },
      });

      const res = await signIn("captain-credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });
      navigate(res?.ok ? "/captain-home" : "/captainlogin");
      return;
    } catch (err) {
      setFormError(apiError(err, "Registration failed. Please try again."));
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      role="captain"
      title="Become a captain"
      subtitle="Create your account and register your vehicle to start earning."
      footer={
        <>
          Already a captain?{" "}
          <Link to="/captainlogin" className="font-semibold text-black underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FormAlert>{formError}</FormAlert>

        <SectionTitle n="1">Your details</SectionTitle>
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="First name"
              icon={FiUser}
              autoComplete="given-name"
              placeholder="Ravi"
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
            placeholder="captain@example.com"
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
          />
        </div>

        <div className="mt-8">
          <SectionTitle n="2">Your vehicle</SectionTitle>
          <p className="mb-2 text-sm font-semibold text-gray-800">Vehicle type</p>
          <div className="grid grid-cols-3 gap-3">
            {VEHICLES.map((v) => {
              const active = form.vehicleType === v.type;
              return (
                <button
                  key={v.type}
                  type="button"
                  onClick={() => pickType(v.type)}
                  aria-pressed={active}
                  className={`rounded-xl border-2 px-2 py-3 text-center transition ${
                    active
                      ? "border-brand-navy bg-brand-mint"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <span className="block text-3xl">{v.icon}</span>
                  <span className="mt-1 block text-sm font-semibold">{v.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Vehicle colour"
                icon={FiDroplet}
                placeholder="White"
                value={form.color}
                onChange={set("color")}
                error={errors.color}
              />
              <Field
                label="Number plate"
                icon={FiHash}
                placeholder="DL 01 AB 1234"
                value={form.plate}
                onChange={set("plate")}
                error={errors.plate}
                className="[&_input]:uppercase"
              />
            </div>
            <Field
              label="Seating capacity"
              icon={FiUsers}
              type="number"
              min="1"
              max="10"
              inputMode="numeric"
              value={form.capacity}
              onChange={set("capacity")}
              error={errors.capacity}
            />
          </div>
        </div>

        <div className="mt-8">
          <SubmitButton role="captain" loading={loading} loadingText="Creating account…">
            Create captain account <FiArrowRight />
          </SubmitButton>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          By continuing you agree to Speed's Terms of Service and Captain Policy.
        </p>
      </form>
    </AuthLayout>
  );
};

export default CaptainSignup;
