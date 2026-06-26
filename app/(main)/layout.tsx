import { ChatWidget } from "@/components/ui/ChatWidget";

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Scopes the chat widget to the home and case-study routes. The session
 * provider lives in the root layout (booking under /book needs it too), so
 * this group only adds the chat surface — keeping /book chat-free.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <ChatWidget />
      {children}
    </>
  );
}
