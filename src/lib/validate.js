export const isEmail = (v) => /^\S+@\S+\.\S+$/.test((v || "").trim());

// Mirrors the backend rules (express-validator + mongoose) so users see errors before submitting.
export const rules = {
  email: (v) => (isEmail(v) ? "" : "Enter a valid email address"),
  password: (v) =>
    (v || "").length >= 6 ? "" : "Password must be at least 6 characters",
  firstname: (v) =>
    (v || "").trim().length >= 3 ? "" : "First name must be at least 3 characters",
  lastname: (v) =>
    !(v || "").trim() || v.trim().length >= 3
      ? ""
      : "Last name must be at least 3 characters",
  required: (label) => (v) => ((v || "").toString().trim() ? "" : `${label} is required`),
  plate: (v) =>
    (v || "").trim().length >= 3 ? "" : "Enter a valid number plate",
  color: (v) => ((v || "").trim().length >= 3 ? "" : "Colour must be at least 3 letters"),
  capacity: (v) => (Number(v) >= 1 ? "" : "Capacity must be at least 1"),
};

// run { field: rule } against values -> { field: message } (empty messages dropped)
export const validate = (values, schema) =>
  Object.fromEntries(
    Object.entries(schema)
      .map(([k, rule]) => [k, rule(values[k])])
      .filter(([, msg]) => msg)
  );
