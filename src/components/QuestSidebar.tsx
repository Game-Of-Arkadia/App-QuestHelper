import { useDialogue } from '@/contexts/DialogueContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FolderOpen, MessageSquare, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useDroppable } from '@dnd-kit/core';

export const QuestSidebar = () => {
  const { data, addQuest, addConversation, setActiveQuest, setActiveConversation, deleteConversation} = useDialogue();

  const [isAddingQuest, setIsAddingQuest] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [isAddingConvInQuest, setIsAddingConvInQuest] = useState<string | null>(null);
  const [newConvTitle, setNewConvTitle] = useState('');
  const [collapsedQuests, setCollapsedQuests] = useState<Set<string>>(new Set());

  const currentVersionData = data.versions[data.currentVersion];

  if (!currentVersionData)
    return null;

  const handleAddQuest = () => {
    if (newQuestTitle.trim()) {
      addQuest(newQuestTitle);
      setNewQuestTitle('');
      setIsAddingQuest(false);
      toast({ title: 'Quest created' });
    }
  };

  const handleAddConversation = (questId: string) => {
    if (newConvTitle.trim()) {
      addConversation(questId, newConvTitle);
      setNewConvTitle('');
      setIsAddingConvInQuest(null);
      toast({ title: 'Conversation created' });
    }
  };

  const handleDeleteConversation = (questId: string, convId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete conversation "${title}"?`)) {
      deleteConversation(questId, convId);
      toast({ title: 'Conversation deleted' });
    }
  };

  const toggleQuestCollapse = (questId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedQuests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questId)) {
        newSet.delete(questId);
      } else {
        newSet.add(questId);
      }
      return newSet;
    });
  };

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-foreground">Workspace</h2>
          <Button size="sm" variant="outline" onClick={() => setIsAddingQuest(true)} className="h-7">
            <Plus className="h-3 w-3 mr-1" />
            Add Quest
          </Button>
        </div>

        {isAddingQuest && (
          <div className="flex gap-2">
            <Input value={newQuestTitle} onChange={(e) => setNewQuestTitle(e.target.value)} placeholder="Quest title..." className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddQuest()} autoFocus/>
            <Button size="sm" onClick={handleAddQuest} className="h-8">
              Add
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {currentVersionData.quests.map((quest) => {
            const isCollapsed = collapsedQuests.has(quest.id);
            return (
              <div key={quest.id} className="border border-border rounded-lg overflow-hidden bg-background">
              <div className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50 transition-colors ${currentVersionData.activeQuestId === quest.id ? 'bg-accent/10' : ''}`} onClick={() => setActiveQuest(quest.id)}>
                <button onClick={(e) => toggleQuestCollapse(quest.id, e)} className="flex-shrink-0 hover:bg-muted rounded p-0.5 transition-colors" >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">{quest.title}</span>
                <Button size="sm" variant="ghost" onClick={(e) => {e.stopPropagation(); setIsAddingConvInQuest(quest.id);}} className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {isAddingConvInQuest === quest.id && (
                <div className="flex gap-2 p-2 bg-muted/30 border-t border-border">
                  <Input value={newConvTitle} onChange={(e) => setNewConvTitle(e.target.value)} placeholder="Conversation title..." className="h-7 text-xs" onKeyDown={(e) => e.key === 'Enter' && handleAddConversation(quest.id)} autoFocus/>
                  <Button size="sm" onClick={() => handleAddConversation(quest.id)} className="h-7 text-xs">
                    Add
                  </Button>
                </div>
              )}

              {!isCollapsed && (
                  <div className="border-t border-border">
                    {quest.conversations && quest.conversations.length > 0 ? (
                      quest.conversations.map((conv) => (
                        <ConversationDropZone key={conv.id} questId={quest.id} conversationId={conv.id}>
                          <div
                            className={`group flex items-center gap-2 p-2 pl-6 cursor-pointer hover:bg-muted/50 transition-colors ${
                              currentVersionData.activeConversationId === conv.id ? 'bg-accent/20' : ''
                            }`}
                            onClick={() => {
                              setActiveQuest(quest.id);
                              setActiveConversation(conv.id);
                            }}
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs flex-1 truncate">{conv.title}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleDeleteConversation(quest.id, conv.id, conv.title, e)}
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </ConversationDropZone>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-muted-foreground italic text-center">
                        No conversations yet
                      </div>
                    )}
                  </div>
                )}
            </div>
            );
          })}

          {currentVersionData.quests.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No quests yet</p>
              <p className="text-xs mt-1">Click "+" to create one</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Drop zone for conversation
const ConversationDropZone = ({ questId, conversationId, children }: { questId: string; conversationId: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver, active } = useDroppable({ id: `conversation-${questId}-${conversationId}`, data: { type: 'conversation', questId, conversationId }});
  const isDraggingLine = active?.data?.current?.type === 'line';

  return (
    <div ref={setNodeRef} className={isOver && isDraggingLine ? 'bg-accent/30 ring-2 ring-accent' : ''}>
      {children}
    </div>
  );
};