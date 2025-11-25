import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DialogueBuilder } from '@/components/DialogueBuilder';
import { DialogueProvider, useDialogue } from '@/contexts/DialogueContext';
import { VersionSelector } from '@/components/VersionSelector';
import { Menu } from 'lucide-react';
import { useEffect } from 'react';

const hexToHSL = (hex: string): string => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
};

const IndexContent = () => {
  const { data } = useDialogue();

  useEffect(() => {
    const currentVersionData = data.versions[data.currentVersion];
    if (currentVersionData?.color) {
      const hslColor = hexToHSL(currentVersionData.color);
      const hslParts = hslColor.split(' ');
      const h = parseInt(hslParts[0]);
      const s = parseInt(hslParts[1]);
      const l = parseInt(hslParts[2]);

      // Light mode version
      document.documentElement.style.setProperty('--dynamic-accent', hslColor);

      // Dark mode version
      const darkL = Math.min(l + 10, 65); // Slightly lighter for dark mode
      document.documentElement.style.setProperty('--dynamic-accent-dark', `${h} ${s}% ${darkL}%`);
    }
  }, [data.currentVersion, data.versions]);

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
