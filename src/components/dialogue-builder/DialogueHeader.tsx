import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';
import { Quest } from '@/types/dialogue';

interface DialogueHeaderProps {
  quest: Quest;
  onUpdateQuest: (id: string, updates: Partial<Quest>) => void;
  onExport: () => void;
}

export const DialogueHeader = ({ quest, onUpdateQuest, onExport }: DialogueHeaderProps) => (
  <div
    className="flex items-center justify-between p-4 border-b border-border bg-card"
  >
    <Input
      value={quest.title}
      onChange={(e) => onUpdateQuest(quest.id, { title: e.target.value })}
      className="text-lg font-semibold max-w-md border-none shadow-none px-0 focus-visible:ring-0"
    />
    <Button
      size="sm"
      variant="outline"
      onClick={onExport}
    >
      <Download
        className="h-4 w-4 mr-2"
      />
      Export Quest
    </Button>
  </div>
);
