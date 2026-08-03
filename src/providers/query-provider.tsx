"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure we only create the queryClient once per session in React 18+ strict mode
  const [client] = useState(() => queryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
