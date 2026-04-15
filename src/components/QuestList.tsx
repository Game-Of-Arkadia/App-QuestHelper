import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FolderOpen, Upload, Copy } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { importQuestFromZip } from './dialogue-builder/importQuestFromZip';

export const QuestList = () => {
  const {
    data,
    addQuest,
    deleteQuest,
    setActiveQuest,
    copyQuestFromVersion,
    updateData,
  } = useDialogue();

  const [isAdding, setIsAdding] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [hoveredQuestId, setHoveredQuestId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const currentVersionData = data.versions[data.currentVersion];

  if (!currentVersionData) {
    return null;
  }

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

  const handleCopyQuest = (sourceVersionId: string, questId: string) => {
    copyQuestFromVersion(sourceVersionId, questId);
    setIsCopyDialogOpen(false);
    toast({ title: 'Quest copied' });
  };

  const handleImportQuest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      const importedQuest = await importQuestFromZip(file, currentVersionData.characters);

      updateData((prev) => {
        const version = prev.versions[prev.currentVersion];
        if (!version) return prev;

        return {
          ...prev,
          versions: {
            ...prev.versions,
            [prev.currentVersion]: {
              ...version,
              quests: [...version.quests, importedQuest],
              activeQuestId: importedQuest.id,
              activeConversationId: importedQuest.conversations[0]?.id || null,
            },
          },
        };
      });

      toast({
        title: 'Quest imported successfully',
        description: importedQuest.title,
      });
    } catch (error) {
      toast({
        title: 'Quest import failed',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      e.target.value = '';
    }
  };

  const otherVersions = Object.entries(data.versions).filter(
    ([versionId]) => versionId !== data.currentVersion
  );

  const versionColor = currentVersionData.color;

  return (
    <div
      className="space-y-2"
    >
      <div
        className="flex items-center justify-between px-2"
      >
        <h3
          className="text-sm font-semibold text-foreground"
        >
          Quests
        </h3>
        <div
          className="flex gap-1"
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const activeQuest = currentVersionData.quests.find(
                (q) => q.id === currentVersionData.activeQuestId
              );
              if (activeQuest) handleDelete(activeQuest.id, activeQuest.title);
            }}
            className="h-7 w-7 p-0"
            title="Delete active quest"
            disabled={!currentVersionData.activeQuestId}
          >
            <Trash2
              className="h-4 w-4"
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => importInputRef.current?.click()}
            className="h-7 w-7 p-0"
            title="Import quest from ZIP"
          >
            <Upload
              className="h-4 w-4"
            />
          </Button>
          <Dialog
            open={isCopyDialogOpen}
            onOpenChange={setIsCopyDialogOpen}
          >
            <DialogTrigger
              asChild
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                title="Copy quest from another version"
              >
                <Copy
                  className="h-4 w-4"
                />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Copy Quest from Another Version
                </DialogTitle>
                <DialogDescription>
                  Select a quest from another version to copy to the current version.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea
                className="max-h-[400px]"
              >
                <div
                  className="space-y-4"
                >
                  {otherVersions.length === 0 ? (
                    <p
                      className="text-sm text-muted-foreground text-center py-4"
                    >
                      No other versions available
                    </p>
                  ) : (
                    otherVersions.map(([versionId, versionData]) => (
                      <div
                        key={versionId}
                        className="space-y-2"
                      >
                        <h4
                          className="text-sm font-semibold text-foreground flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: versionData.color }}
                          />
                          {versionData.name}
                        </h4>
                        {versionData.quests.length === 0 ? (
                          <p
                            className="text-xs text-muted-foreground pl-5"
                          >
                            No quests
                          </p>
                        ) : (
                          <div
                            className="space-y-1 pl-5"
                          >
                            {versionData.quests.map((quest) => (
                              <Button
                                key={quest.id}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-sm"
                                onClick={() => handleCopyQuest(versionId, quest.id)}
                              >
                                <FolderOpen
                                  className="h-3 w-3 mr-2"
                                />
                                {quest.title}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdding(true)}
            className="h-7 w-7 p-0"
            title="Create new quest"
          >
            <Plus
              className="h-4 w-4"
            />
          </Button>
        </div>
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept=".zip"
        onChange={handleImportQuest}
        className="hidden"
      />

      {isAdding && (
        <div
          className="flex gap-2 px-2"
        >
          <Input
            value={newQuestTitle}
            onChange={(e) => setNewQuestTitle(e.target.value)}
            placeholder="Quest title..."
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleAdd}
            className="h-8"
          >
            Add
          </Button>
        </div>
      )}

      <ScrollArea
        className="flex-1"
      >
        <div
          className="space-y-1 pr-2"
        >
          {currentVersionData.quests.map((quest) => {
            const isActive = currentVersionData.activeQuestId === quest.id;
            const isHovered = hoveredQuestId === quest.id;

            const dynamicStyle: React.CSSProperties = {};
            if ((isActive || isHovered) && versionColor) {
              dynamicStyle.backgroundColor = versionColor;
              dynamicStyle.color = '#ffffff';
            }

            return (
              <div
                key={quest.id}
                className={`flex items-start justify-between p-2 pl-4 min-w-0 rounded-lg cursor-pointer transition-colors ${
                  isActive && !versionColor ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => setActiveQuest(quest.id)}
                onMouseEnter={() => setHoveredQuestId(quest.id)}
                onMouseLeave={() => setHoveredQuestId(null)}
                style={dynamicStyle}
              >
                <div
                  className="flex items-start gap-2 flex-1 min-w-0"
                >
                  <FolderOpen
                    className="h-4 w-4 flex-shrink-0"
                  />
                  <span
                    className="block w-full text-sm font-medium whitespace-normal [overflow-wrap:anywhere] leading-snug"
                  >
                    {quest.title}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(quest.id, quest.title);
                  }}
                  className="h-6 w-6 p-0 flex-shrink-0 self-start opacity-0 hover:opacity-100 hover:text-destructive"
                >
                  <Trash2
                    className="h-3 w-3"
                  />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
