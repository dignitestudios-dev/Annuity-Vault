"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/auth.slice";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/features/auth/api/auth.service";
import { DEFAULT_REDIRECT } from "@/config/routes";

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending, error } = useLoginMutation();

  function onSubmit(data: LoginCredentials) {
    mutate(data, {
      onSuccess: (response) => {
        const { token, account } = response;
        localStorage.setItem("auth-token", token);
        localStorage.setItem("auth-user", JSON.stringify(account));
        document.cookie = `auth-token=${token}; path=/; max-age=86400`; // Adjust as needed
        dispatch(setCredentials({ user: account, accessToken: token }));
        router.push(DEFAULT_REDIRECT);
      },
      onError: (err) => {
        // Form error handling can be done here or in the UI
        console.error("Login failed:", err.message);
      },
    });
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), isPending, error };
}
