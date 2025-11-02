import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { CharacterList } from './CharacterList';
import { QuestList } from './QuestList';

export const AppSidebar = () => {
  return (
    <Sidebar className="border-r border-border h-screen flex flex-col"> {}
      <SidebarContent className="p-4 flex flex-col flex-1"> {}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-2 mb-4">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-lg font-bold text-foreground">QuestHelper</h1>
          </div>
        </div>

        <SidebarGroup className="flex flex-col flex-1">
          <SidebarGroupContent className="space-y-6 overflow-y-auto flex-1">
            <CharacterList />
            <QuestList />
          </SidebarGroupContent>

          <SidebarGroupLabel className="px-2 mt-auto">Made by Pamplemom</SidebarGroupLabel>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

