import CredentialsProvider from "next-auth/providers/credentials";
import authServiceModule from "../../server/services/auth.service";

// Credentials are checked straight against MongoDB (no HTTP hop to the API).
const authService = () => authServiceModule;

function dbProvider(id, name, role) {
  return CredentialsProvider({
    id,
    name,
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const { token, profile } = await authService().verifyCredentials(
        role,
        credentials?.email,
        credentials?.password
      );
      return {
        id: String(profile._id),
        email: profile.email,
        name: [profile.fullname?.firstname, profile.fullname?.lastname]
          .filter(Boolean)
          .join(" "),
        role,
        accessToken: token,
        profile: JSON.parse(JSON.stringify(profile)),
      };
    },
  });
}

export const authOptions = {
  providers: [
    dbProvider("user-credentials", "User", "user"),
    dbProvider("captain-credentials", "Captain", "captain"),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // matches backend JWT (24h)
  pages: { signIn: "/userlogin" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.profile = user.profile;
      }
      return token;
    },
    async session({ session, token }) {
      session.role = token.role;
      session.accessToken = token.accessToken;
      session.profile = token.profile;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
