import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    role?: "student" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "student" | "admin";
  }
}






