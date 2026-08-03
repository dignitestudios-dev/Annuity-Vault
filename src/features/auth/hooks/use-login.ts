"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/auth.slice";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_REDIRECT } from "@/config/routes";

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(data: LoginCredentials) {
    // Static UI only: fake login to allow navigation past the route guards
    const fakeToken = "static-ui-fake-token";
    const fakeUser = {
      id: 1,
      username: data.username,
      email: "user@example.com",
      firstName: data.username,
      lastName: "User",
    };
    
    localStorage.setItem("auth-token", fakeToken);
    localStorage.setItem("auth-user", JSON.stringify(fakeUser));
    document.cookie = `auth-token=${fakeToken}; path=/; max-age=1800`;
    dispatch(setCredentials({ user: fakeUser, accessToken: fakeToken }));
    router.push(DEFAULT_REDIRECT);
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), isPending: false, error: null as Error | null };
}
