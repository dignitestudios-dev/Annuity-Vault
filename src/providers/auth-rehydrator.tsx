"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/auth.slice";

export default function AuthRehydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth-token");
      const userStr = localStorage.getItem("auth-user");
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch(setCredentials({ user, accessToken: token }));
      }
    } catch (e) {
      console.error("Failed to rehydrate auth", e);
    } finally {
      setIsReady(true);
    }
  }, [dispatch]);

  // Optionally, you can return a loading spinner or nothing until we check local storage
  if (!isReady) return null;

  return <>{children}</>;
}
