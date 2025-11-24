import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FolderOpen, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { Conversation, DialogueLine } from '@/types/dialogue';

export const QuestList = () => {
  const { data, addQuest, updateQuest, deleteQuest, setActiveQuest, addConversation, addDialogueLine } = useDialogue();
  const currentVersionData = data.versions[data.currentVersion];

  if (!currentVersionData)
    return null;

  const [isAdding, setIsAdding] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredQuestId, setHoveredQuestId] = useState<string | null>(null);

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

  const handleImportFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const firstFilePath = files[0].webkitRelativePath;
      const folderName = firstFilePath.split('/')[0];

      const questId = crypto.randomUUID();
      addQuest(folderName);

      const folderMap = new Map<string, File[]>();
      Array.from(files).forEach((file) => {
        const pathParts = file.webkitRelativePath.split('/');
        const conversationPath = pathParts.length > 2
          ? pathParts.slice(1, -1).join('/')
          : 'Root';

        if (!folderMap.has(conversationPath)) {
          folderMap.set(conversationPath, []);
        }
        folderMap.get(conversationPath)!.push(file);
      });

      // Create conversations from folders
      for (const [folderPath, filesInFolder] of folderMap.entries()) {
        const conversationId = crypto.randomUUID();
        addConversation(questId, folderPath);

        // Read each file and create dialogue lines
        for (const file of filesInFolder) {
          const content = await file.text();
          const fileName = file.name;

          addDialogueLine(questId, conversationId, {
            characterId: '',
            text: content,
            answers: [],
          });
        }
      }

      toast({
        title: 'Quest imported successfully',
        description: `${files.length} files from "${folderName}"`
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: 'Could not import folder',
        variant: 'destructive'
      });
    }
  };

  const versionColor = (currentVersionData as any).color as string | undefined;
  const versionForeground = (currentVersionData as any).foreground as string | undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-foreground">Quests</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 w-7 p-0"
            title="Import from folder"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdding(true)}
            className="h-7 w-7 p-0"
            title="Create new quest"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        // @ts-ignore: webkitdirectory is not in the types but works in browsers
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleImportFolder}
        className="hidden"
      />

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
          {currentVersionData.quests.map((quest) => {
            const isActive = currentVersionData.activeQuestId === quest.id;
            const isHovered = hoveredQuestId === quest.id;

            const dynamicStyle: React.CSSProperties = {};
            if (isActive && versionColor) {
              dynamicStyle.backgroundColor = versionColor;
              dynamicStyle.color = versionForeground ?? '#ffffff';
            } else if (!isActive && isHovered && versionColor) {
              dynamicStyle.backgroundColor = versionColor;
              dynamicStyle.color = versionForeground ?? '#ffffff';
            }

            return (
              <div
                key={quest.id}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  isActive && !versionColor ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => setActiveQuest(quest.id)}
                onMouseEnter={() => setHoveredQuestId(quest.id)}
                onMouseLeave={() => setHoveredQuestId(null)}
                style={dynamicStyle}
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
                  className="h-6 w-6 p-0 opacity-0 hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
