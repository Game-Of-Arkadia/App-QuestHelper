import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Download, HelpCircle, MessageSquare, FolderOpen, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DialogueLine } from '@/types/dialogue';
import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { wrapTextAt } from '@/lib/utils';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestSidebar } from './QuestSidebar';

const maxCharPerLines = 37

export const DialogueBuilder = () => {
  const { data, addConversation, updateConversation, deleteConversation, setActiveQuest, setActiveConversation, addDialogueLine, updateDialogueLine, deleteDialogueLine, moveDialogueLine, addAnswer, updateAnswer, deleteAnswer, updateQuest, } = useDialogue();

  const [draggedLine, setDraggedLine] = useState<{ line: DialogueLine; questId: string; convId: string; index: number } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}));
  const currentVersionData = data.versions[data.currentVersion];

  if (!currentVersionData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No version selected</p>
      </div>
    );
  }
  const [isAddingConversation, setIsAddingConversation] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const activeQuest = currentVersionData.quests.find((q) => q.id === currentVersionData.activeQuestId);
  const activeConversation = activeQuest?.conversations?.find((c) => c.id === currentVersionData.activeConversationId);

  if (!activeQuest) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FolderOpen className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No quest selected</p>
        <p className="text-sm mt-1">Select or create a quest to start</p>
      </div>
    );
  }

  const handleAddConversation = () => {
    if (newConversationTitle.trim()) {
      addConversation(activeQuest.id, newConversationTitle);
      setNewConversationTitle('');
      setIsAddingConversation(false);
      toast({ title: 'Conversation created' });
    }
  };

  const handleDeleteConversation = (convId: string, title: string) => {
    if (confirm(`Delete conversation "${title}"?`)) {
      deleteConversation(activeQuest.id, convId);
      toast({ title: 'Conversation deleted' });
    }
  };

  const handleAddLine = () => {
    if (!activeConversation) {
      toast({ title: 'You must have selected a conversation before', variant: 'destructive' });
      return;
    }
    if (currentVersionData.characters.length === 0) {
      toast({ title: 'You must have at least one character.', variant: 'destructive' });
      return;
    }
    // Get the last line to duplicate character and displayName
    const lastLine = activeConversation.dialogue[activeConversation.dialogue.length - 1];

    addDialogueLine(activeQuest.id, activeConversation.id, {
      characterId: lastLine?.characterId || currentVersionData.characters[0].id,
      displayName: lastLine?.displayName,
      text: '',
      linkedToNext: true,
    });

    // Focus the new line's textarea after it's added
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
    const data = active.data.current as { line: DialogueLine; questId: string; convId: string; index: number };
    setDraggedLine(data);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (!over)
      return;
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
    if (!over || !draggedLine)
      return;
    const overData = over.data.current as any;
    const activeData = active.data.current as any;
    const { line, questId: sourceQuestId, convId: sourceConvId, index: sourceIndex } = draggedLine;

    // Dropping on a conversation
    if (overData?.type === 'conversation') {
      const { questId: targetQuestId, conversationId: targetConvId } = overData; // calculate target conversation to determine insert position
      const targetQuest = currentVersionData.quests.find(q => q.id === targetQuestId);
      const targetConv = targetQuest?.conversations?.find(c => c.id === targetConvId);
      const targetIndex = targetConv?.dialogue?.length || 0;

      moveDialogueLine(sourceQuestId, sourceConvId, line.id, targetQuestId, targetConvId, targetIndex);
      toast({ title: `Moved to ${targetConv.title}` });
    }
    else if (overData?.type === 'line') {
      const { questId: targetQuestId, convId: targetConvId, index: targetIndex } = overData;

      if (sourceQuestId === targetQuestId && sourceConvId === targetConvId) {
        if (sourceIndex === targetIndex)
          return;
        moveDialogueLine(sourceQuestId, sourceConvId, line.id, targetQuestId, targetConvId, targetIndex);
      }
      else {
        moveDialogueLine(sourceQuestId, sourceConvId, line.id, targetQuestId, targetConvId, targetIndex);
        toast({ title: `Moved to ${targetConvId}` });
      }
    }
  };

  const handleExport = () => {
    const zip = new JSZip();
    const sanitizedQuestTitle = activeQuest.title.trim().replace(/\s+/g, '_');
    const questFolder = zip.folder(sanitizedQuestTitle);

    activeQuest.conversations.forEach((conv) => {
      const sanitizedConvTitle = conv.title.trim().replace(/\s+/g, '_');
      const convFolder = questFolder.folder(sanitizedConvTitle);

      conv.dialogue.forEach((line, index) => {
        const character = currentVersionData.characters.find((c) => c.id === line.characterId);
        let  characterYaml = character?.yamlConfig || '';

        if (line.displayName) {
          characterYaml = characterYaml.replace(
            /(Character:\s*\n\s*name:\s*).*/i,
            `$1${line.displayName}`
          );
        }
        const filename = `${index + 1}.yml`;
        const nextLineExists = index < conv.dialogue.length - 1;
        const wrappedText = wrapTextAt(line.text, maxCharPerLines);
        const lineArray = wrappedText.split('\n').map(l => l.trim()).filter(l => l);

        let yamlContent = `${characterYaml}\n"Dialogue":\n  "1":\n    "lines":\n`;
        lineArray.forEach(l => {
          yamlContent += `      - "${l.replace(/"/g, '\\"')}"\n`;
        });
        if (nextLineExists && line.linkedToNext !== false) {
          yamlContent += `  "2":\n    "post-actions":\n`;
          yamlContent += `      - "${sanitizedQuestTitle}/${sanitizedConvTitle}/${index + 2} @redirect"\n`;
        }
        if (line.isQuestion && line.answers && line.answers.length > 0) {
          yamlContent += `Answers:\n`;
          line.answers.forEach((answer, ansIndex) => {
            const answerNumber = ansIndex + 1;
            const linkedConv = activeQuest.conversations.find(c => c.id === answer.linkedConversationId);
            let actionPath = '';

            if (linkedConv) {
              const linkedConvTitle = linkedConv.title.trim().replace(/\s+/g, '_');
              actionPath = `${sanitizedQuestTitle}/${linkedConvTitle}/1 @redirect`;
            } else if (nextLineExists) {
              actionPath = `${sanitizedQuestTitle}/${sanitizedConvTitle}/${index + 2} @redirect`;
            }
            yamlContent += `  '${answerNumber}':\n`;
            yamlContent += `    text: "${answer.text.replace(/"/g, '\\"')}"\n`;
            yamlContent += `    sound: luxdialogues:luxdialogues.sounds.ding\n`;
            if (actionPath) {
              yamlContent += `    actions:\n`;
              yamlContent += `      - "${actionPath}"\n`;
            }
          });
        }
        convFolder.file(filename, yamlContent);
      });
    });
    zip.generateAsync({ type: 'blob' }).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizedQuestTitle}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Quest exported as ZIP' });
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Enter -> Add new line
      if (e.ctrlKey && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAddLine();
        toast({ title: 'Added Line', description: 'Shortcut: Ctrl + Enter' });
        return;
      }
      // Ctrl + Shift + Enter -> Create new conversation
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        setIsAddingConversation(true);
        toast({ title: 'Created conversation', description: 'Shortcut: Ctrl + Shift + Enter' });
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuest, activeConversation, currentVersionData.characters]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="flex h-full">
        <QuestSidebar/>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <Input value={activeQuest.title} onChange={(e) => updateQuest(activeQuest.id, { title: e.target.value })} className="text-lg font-semibold max-w-md border-none shadow-none px-0 focus-visible:ring-0"/>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Quest
        </Button>
      </div>

          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mb-3 mx-auto opacity-50" />
                <p className="text-lg font-medium">No conversation selected</p>
                <p className="text-sm mt-1">Select or create a conversation to add dialogues</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center p-4 border-b border-border bg-card">
                <Input value={activeConversation.title} onChange={(e) => updateConversation(activeQuest.id, activeConversation.id, { title: e.target.value }) } className="text-base font-medium max-w-sm border-none shadow-none px-0 focus-visible:ring-0" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                {activeConversation.dialogue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p className="text-lg font-medium">No Dialogue Yet</p>
                    <p className="text-sm mt-1">Click "Add New Line" to create the first dialogue.</p>
                  </div>
                ) : (
                  <SortableContext items={activeConversation.dialogue.map(line => `line-${line.id}`)} strategy={verticalListSortingStrategy}>
                    {activeConversation.dialogue.map((line, index) => {
                      const character = currentVersionData.characters.find((c) => c.id === line.characterId);
                      return (
                        <DraggableLine key={line.id} line={line} index={index} questId={activeQuest.id} convId={activeConversation.id} character={character} onUpdate={handleUpdateLine} onDelete={handleDeleteLine} />
                      );
                    })}
                  </SortableContext>
                )}
              </div>

              <div className="fixed bottom-4 right-4 z-10">
                <Button size="lg" onClick={handleAddLine} className="shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Line
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <DragOverlay>
        {draggedLine && (
          <div className="p-4 bg-card border-2 border-accent rounded-lg shadow-xl opacity-80 max-w-md">
            <div className="text-sm font-medium mb-1">
              {currentVersionData.characters.find(c => c.id === draggedLine.line.characterId)?.name || 'Unknown'}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {draggedLine.line.text || '(empty)'}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

const DraggableLine = ({line, index, questId, convId, character, onUpdate, onDelete}: { line: DialogueLine; index: number; questId: string; convId: string; character: any; onUpdate: (lineId: string, updates: Partial<DialogueLine>) => void; onDelete: (lineId: string) => void; }) => {
  const { data, addAnswer, updateAnswer, deleteAnswer } = useDialogue();
  const currentVersionData = data.versions[data.currentVersion];
  const activeQuest = currentVersionData.quests.find(q => q.id === questId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `line-${line.id}`, data: { type: 'line', line, questId, convId, index } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start pt-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <Select value={line.characterId} onValueChange={(characterId) => onUpdate(line.id, { characterId })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentVersionData.characters.map((char) => (
                <SelectItem key={char.id} value={char.id}>
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input value={line.displayName || ''} onChange={(e) => onUpdate(line.id, { displayName: e.target.value })} placeholder="Display name (optional)" className="flex-1"/>
        </div>

        <Textarea value={line.text} onChange={(e) => onUpdate(line.id, { text: e.target.value })} placeholder="Enter line..." rows={3} className="resize-none font-mono text-sm" data-dialogue-textarea/>

        {line.text && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border">
            <div className="font-medium mb-1">Preview :</div>
            <pre className="font-mono whitespace-pre-wrap">{wrapTextAt(line.text, maxCharPerLines)}</pre>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Switch id={`question-${line.id}`} checked={line.isQuestion || false} onCheckedChange={(checked) => { onUpdate(line.id, { isQuestion: checked, answers: checked ? [] : undefined, linkedToNext: checked ? false : true }); }}/>
            <Label htmlFor={`question-${line.id}`} className="flex items-center gap-1.5 cursor-pointer">
              <HelpCircle className="h-3.5 w-3.5" />
              Activate question
            </Label>
          </div>
        </div>

        {line.isQuestion && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Answer Choices</Label>
              <Button size="sm" variant="outline" onClick={() => { addAnswer(questId, convId, line.id, { text: '' }); }}>
                <Plus className="h-3 w-3 mr-1" />
                Add Answer
              </Button>
            </div>

            {line.answers?.map((answer, answerIndex) => (
              <div key={answer.id} className="flex gap-2 items-start bg-muted/30 p-2 rounded">
                <div className="flex-1 space-y-2">
                  <Input value={answer.text} onChange={(e) => updateAnswer(questId, convId, line.id, answer.id, { text: e.target.value })} placeholder={`Answer ${answerIndex + 1}...`} className="text-sm"/>
                  <Select value={answer.linkedConversationId || 'none'} onValueChange={(value) => updateAnswer(questId, convId, line.id, answer.id, { linkedConversationId: value === 'none' ? undefined : value }) }>
                    <SelectTrigger className="text-sm h-8">
                      <SelectValue placeholder="Link to conversation in this quest (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="none">
                      <span className="flex items-center gap-1">
                        Continue
                      </span>
                    </SelectItem>

                    {activeQuest.conversations.map((conv) => (
                      <SelectItem key={conv.id} value={conv.id}>
                        <span className="flex items-center justify-between w-full">
                          Redirect to {conv.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteAnswer(questId, convId, line.id, answer.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            {(!line.answers || line.answers.length === 0) && (
              <p className="text-xs text-muted-foreground italic">Click "Add Answer" to add a new answer.</p>
            )}
          </div>
        )}
      </div>

      <Button size="sm" variant="ghost" onClick={() => onDelete(line.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
