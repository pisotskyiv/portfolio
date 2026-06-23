import { ChatWidget } from "@/components/ui/ChatWidget";
import { AuthProvider } from "@/components/ui/AuthProvider";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthProvider>
      <ChatWidget />
      {children}
    </AuthProvider>
  );
}
