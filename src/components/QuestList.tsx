import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const QuestList = () => {
  const { data, addQuest, updateQuest, deleteQuest, setActiveQuest } = useDialogue();
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');

  const handleAdd = () => {
    if (newQuestTitle.trim()) {
      addQuest(newQuestTitle);
      setNewQuestTitle('');
      setIsAdding(false);
      toast({ title: 'Quest created' });
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete quest "${title}"?`)) {
      deleteQuest(id);
      toast({ title: 'Quest deleted' });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-foreground">Quests</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsAdding(true)}
          className="h-7 w-7 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="flex gap-2 px-2">
          <Input
            value={newQuestTitle}
            onChange={(e) => setNewQuestTitle(e.target.value)}
            placeholder="Quest title..."
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <Button size="sm" onClick={handleAdd} className="h-8">
            Add
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-1 px-2">
          {data[data.version].quests.map((quest) => (
            <div
              key={quest.id}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                data[data.version].activeQuestId === quest.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setActiveQuest(quest.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FolderOpen className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{quest.title}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(quest.id, quest.title);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
