"use client";
import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: !!session,
    isLoading: status === "loading",
    user: session?.user || null,
    session,
  };
};
