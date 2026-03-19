import { useState, useEffect } from 'react';
import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DialogueLine } from '@/types/dialogue';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { QuestSidebar } from '../QuestSidebar';
import { DraggableLine } from './DraggableLine';
import { DragOverlayContent } from './DragOverlayContent';
import { DialogueHeader } from './DialogueHeader';
import { ConversationHeader } from './ConversationHeader';
import { NoVersionState, NoQuestState, NoConversationState, NoDialogueState } from './EmptyStates';
import { useExportQuest } from './useExportQuest';

export const DialogueBuilder = () => {
  const {
    data,
    updateConversation,
    setActiveQuest,
    setActiveConversation,
    addDialogueLine,
    updateDialogueLine,
    deleteDialogueLine,
    moveDialogueLine,
    updateQuest,
  } = useDialogue();

  const [draggedLine, setDraggedLine] = useState<{
    line: DialogueLine;
    questId: string;
    convId: string;
    index: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const currentVersionData = data.versions[data.currentVersion];
  const activeQuest = currentVersionData?.quests.find(
    (q) => q.id === currentVersionData.activeQuestId
  );
  const activeConversation = activeQuest?.conversations?.find(
    (c) => c.id === currentVersionData.activeConversationId
  );

  const { handleExport } = useExportQuest(
    activeQuest!,
    currentVersionData!
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAddLine();
        toast({ title: 'Added Line', description: 'Shortcut: Ctrl + Enter' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuest, activeConversation, currentVersionData?.characters]);

  if (!currentVersionData) {
    return <NoVersionState />;
  }

  if (!activeQuest) {
    return <NoQuestState />;
  }

  const handleAddLine = () => {
    if (!activeConversation) {
      toast({ title: 'You must have selected a conversation before', variant: 'destructive' });
      return;
    }
    if (currentVersionData.characters.length === 0) {
      toast({ title: 'You must have at least one character.', variant: 'destructive' });
      return;
    }

    const lastLine = activeConversation.dialogue[activeConversation.dialogue.length - 1];

    addDialogueLine(activeQuest.id, activeConversation.id, {
      characterId: lastLine?.characterId || currentVersionData.characters[0].id,
      displayName: lastLine?.displayName,
      text: '',
      linkedToNext: true,
    });

    setTimeout(() => {
      const textareas = document.querySelectorAll('[data-dialogue-textarea]');
      const lastTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
      if (lastTextarea) {
        lastTextarea.focus();
      }
    }, 50);
  };

  const handleUpdateLine = (lineId: string, updates: Partial<DialogueLine>) => {
    if (!activeConversation) return;
    updateDialogueLine(activeQuest.id, activeConversation.id, lineId, updates);
  };

  const handleDeleteLine = (lineId: string) => {
    if (!activeConversation) return;
    deleteDialogueLine(activeQuest.id, activeConversation.id, lineId);
    toast({ title: 'Deleted' });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as {
      line: DialogueLine;
      questId: string;
      convId: string;
      index: number;
    };
    setDraggedLine(dragData);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (!over) return;
    const overData = over.data.current as any;

    if (overData?.type === 'conversation') {
      const { questId: targetQuestId, conversationId: targetConvId } = overData;
      setActiveQuest(targetQuestId);
      setActiveConversation(targetConvId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedLine(null);

    if (!over || !draggedLine) return;

    const overData = over.data.current as any;
    const { line, questId: sourceQuestId, convId: sourceConvId, index: sourceIndex } = draggedLine;

    if (overData?.type === 'conversation') {
      const { questId: targetQuestId, conversationId: targetConvId } = overData;
      const targetQuest = currentVersionData.quests.find((q) => q.id === targetQuestId);
      const targetConv = targetQuest?.conversations?.find((c) => c.id === targetConvId);
      const targetIndex = targetConv?.dialogue?.length || 0;

      moveDialogueLine(sourceQuestId, sourceConvId, line.id, targetQuestId, targetConvId, targetIndex);
      toast({ title: `Moved to ${targetConv?.title}` });
    } else if (overData?.type === 'line') {
      const { questId: targetQuestId, convId: targetConvId, index: targetIndex } = overData;

      if (sourceQuestId === targetQuestId && sourceConvId === targetConvId) {
        if (sourceIndex === targetIndex) return;
        moveDialogueLine(sourceQuestId, sourceConvId, line.id, targetQuestId, targetConvId, targetIndex);
      } else {
        moveDialogueLine(sourceQuestId, sourceConvId, line.id, targetQuestId, targetConvId, targetIndex);
        toast({ title: `Moved to ${targetConvId}` });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div
        className="flex h-full"
      >
        <QuestSidebar />

        <div
          className="flex flex-col flex-1"
        >
          <DialogueHeader
            quest={activeQuest}
            onUpdateQuest={updateQuest}
            onExport={handleExport}
          />

          {!activeConversation ? (
            <NoConversationState />
          ) : (
            <>
              <ConversationHeader
                conversation={activeConversation}
                questId={activeQuest.id}
                onUpdateConversation={updateConversation}
              />

              <div
                className="flex-1 overflow-y-auto p-4 space-y-3 pb-20"
              >
                {activeConversation.dialogue.length === 0 ? (
                  <NoDialogueState />
                ) : (
                  <SortableContext
                    items={activeConversation.dialogue.map((line) => `line-${line.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {activeConversation.dialogue.map((line, index) => {
                      const character = currentVersionData.characters.find(
                        (c) => c.id === line.characterId
                      );
                      return (
                        <DraggableLine
                          key={line.id}
                          line={line}
                          index={index}
                          questId={activeQuest.id}
                          convId={activeConversation.id}
                          character={character}
                          onUpdate={handleUpdateLine}
                          onDelete={handleDeleteLine}
                        />
                      );
                    })}
                  </SortableContext>
                )}
              </div>

              <div
                className="fixed bottom-4 right-4 z-10"
              >
                <Button
                  size="lg"
                  onClick={handleAddLine}
                  className="shadow-lg"
                >
                  <Plus
                    className="h-5 w-5 mr-2"
                  />
                  Add New Line
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <DragOverlay>
        {draggedLine && (
          <DragOverlayContent
            line={draggedLine.line}
            characters={currentVersionData.characters}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};
