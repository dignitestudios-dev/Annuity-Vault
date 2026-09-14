import ReduxProvider from "./redux-provider";
import QueryProvider from "./query-provider";
import AuthRehydrator from "./auth-rehydrator";
import NotificationPermission from "@/components/notification-permission";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <AuthRehydrator>
          <NotificationPermission/>
          {children}
        </AuthRehydrator>
      </QueryProvider>
    </ReduxProvider>
  );
}
