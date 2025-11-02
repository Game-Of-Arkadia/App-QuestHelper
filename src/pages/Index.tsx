import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DialogueBuilder } from '@/components/DialogueBuilder';
import { DialogueProvider } from '@/contexts/DialogueContext';
import { Menu } from 'lucide-react';

const Index = () => {
  return (
    <DialogueProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 border-b border-border bg-card flex items-center px-4">
              <SidebarTrigger className="mr-2">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </header>
            <main className="flex-1 overflow-hidden">
              <DialogueBuilder />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DialogueProvider>
  );
};

export default Index;
