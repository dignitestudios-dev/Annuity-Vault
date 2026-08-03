import ReduxProvider from "./redux-provider";
import QueryProvider from "./query-provider";
import AuthRehydrator from "./auth-rehydrator";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <AuthRehydrator>
          {children}
        </AuthRehydrator>
      </QueryProvider>
    </ReduxProvider>
  );
}
