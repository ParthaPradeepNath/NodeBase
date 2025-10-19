import { SidebarTrigger } from "./ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="flex items-center gap-2 border-b h-14 shrink-0 px-4 bg-background">
      <SidebarTrigger />
    </header>
  );
};
