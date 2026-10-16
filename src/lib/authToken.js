// In-memory copy of the backend API token + role, kept in sync with the
// NextAuth session by <AuthSync />. Used by axios and legacy API calls.
let token = null;
let role = null;

export const setAuth = (nextToken, nextRole) => {
  token = nextToken || null;
  role = nextRole || null;
};
export const getAuthToken = () => token;
export const getAuthRole = () => role;
