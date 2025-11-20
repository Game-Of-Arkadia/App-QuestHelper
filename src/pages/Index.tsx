import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DialogueBuilder } from '@/components/DialogueBuilder';
import { DialogueProvider, useDialogue } from '@/contexts/DialogueContext';
import { VersionSelector } from '@/components/VersionSelector';
import { Menu } from 'lucide-react';
import { useEffect } from 'react';

const IndexContent = () => {
  const { data } = useDialogue();

  useEffect(() => {
    document.documentElement.setAttribute('data-version', data.version);
  }, [data.version]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
            <SidebarTrigger className="mr-2">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <VersionSelector />
          </header>
          <main className="flex-1 overflow-hidden">
            <DialogueBuilder />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const Index = () => {
  return (
    <DialogueProvider>
      <IndexContent />
    </DialogueProvider>
  );
};

export default Index;
