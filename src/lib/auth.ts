import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const adminUsername = (process.env.ADMIN_USERNAME as string | undefined) ?? "admin";
const adminPassword = (process.env.ADMIN_PASSWORD as string | undefined) ?? "admin123";

const providers: NextAuthOptions["providers"] = [];

// Enable Google only when env keys are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: (profile.picture as string | undefined) ?? null,
          role: "student" as const,
        };
      },
    })
  );
}

providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "Admin Credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials) return null;
      const { username, password } = credentials as Record<string, string>;

      if (
        adminUsername &&
        adminPassword &&
        username === adminUsername &&
        password === adminPassword
      ) {
        return {
          id: "admin-1",
          name: "Administrator",
          email: "admin@sems.local",
          role: "admin" as const,
        } as any;
      }
      return null;
    },
  })
);

// Student email/password (demo): accepts any non-empty email/password
providers.push(
  CredentialsProvider({
    id: "student-credentials",
    name: "Student Email Login",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const { email, password } = (credentials || {}) as Record<string, string>;
      if (typeof email === "string" && /.+@.+\..+/.test(email) && typeof password === "string" && password.length >= 4) {
        return { id: `student-${email}`, name: email.split("@")[0], email, role: "student" as const } as any;
      }
      return null;
    },
  })
);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      // Set role on first sign in
      if (user && (user as any).role) {
        token.role = (user as any).role;
      }
      // For Google sign-in, ensure role is student
      if (account?.provider === "google" && !token.role) {
        token.role = "student";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).role = (token as any).role ?? "student";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If it's a callback URL, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default redirects based on role
      if (url.includes("callbackUrl")) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const callbackUrl = urlParams.get('callbackUrl');
        if (callbackUrl) {
          return callbackUrl;
        }
      }
      // Default to base URL
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
