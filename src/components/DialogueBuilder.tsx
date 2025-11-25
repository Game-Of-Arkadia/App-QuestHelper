import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2,  ChevronUp, ChevronDown, Download, MessageCircleQuestion, MessageSquare, FolderOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DialogueLine } from '@/types/dialogue';
import { useState } from 'react';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { wrapTextAt } from '@/lib/utils';

export const DialogueBuilder = () => {
  const {
    data,
    addConversation,
    updateConversation,
    deleteConversation,
    setActiveConversation,
    addDialogueLine,
    updateDialogueLine,
    deleteDialogueLine,
    reorderDialogue,
    addAnswer,
    updateAnswer,
    deleteAnswer,
    updateQuest,
  } = useDialogue();

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

  const maxCharSize = 32

  const activeQuest = currentVersionData.quests.find((q) => q.id === currentVersionData.activeQuestId);
  const activeConversation = activeQuest?.conversations.find(
    (c) => c.id === currentVersionData.activeConversationId
  );

  if (!activeQuest) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FolderOpen className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No quest selected</p>
         <p className="text-sm font-small">Please create one on the left  to start building.</p>
      </div>
    );
  }

  const handleAddConversation = () => {
    if (newConversationTitle.trim()) {
      addConversation(activeQuest.id, newConversationTitle);
      setNewConversationTitle('');
      setIsAddingConversation(false);
      toast({ title: 'Conversation created.' });
    }
  };

  const handleDeleteConversation = (convId: string, title: string) => {
    if (confirm(`Delete conversation "${title}"?`)) {
      deleteConversation(activeQuest.id, convId);
      toast({ title: 'Conversation deleted.' });
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

    const lastLine = activeConversation.dialogue[activeConversation.dialogue.length - 1];
    addDialogueLine(activeQuest.id, activeConversation.id, {
      characterId: lastLine?.characterId || currentVersionData.characters[0].id,
      displayName: lastLine?.displayName,
      text: '',
      linkedToNext: true,
    });
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

  const handleMoveUp = (index: number) => {
    if (!activeConversation || index <= 0) return;
    reorderDialogue(activeQuest.id, activeConversation.id, index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (!activeConversation || index >= activeConversation.dialogue.length - 1) return;
    reorderDialogue(activeQuest.id, activeConversation.id, index, index + 1);
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
        const wrappedText = wrapTextAt(line.text, maxCharSize);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <Input
          value={activeQuest.title}
          onChange={(e) => updateQuest(activeQuest.id, { title: e.target.value })}
          className="text-lg font-semibold max-w-md border-none shadow-none px-0 focus-visible:ring-0"
        />
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Quest
        </Button>
      </div>

      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-sm font-medium">Conversation List:</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingConversation(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Create
          </Button>
        </div>

        {isAddingConversation && (
          <div className="flex gap-2 mb-2">
            <Input
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              placeholder="Conversation title..."
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddConversation()}
              autoFocus
            />
            <Button size="sm" onClick={handleAddConversation} className="h-8">
              Create
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {activeQuest.conversations.map((conv) => {
            const isActive = currentVersionData.activeConversationId === conv.id;
            const hasVersionColor = !!currentVersionData?.color;
            const activeStyle = hasVersionColor
              ? {
                  backgroundColor: currentVersionData.color,
                  borderColor: currentVersionData.color,
                  color: '#ffffff',
                }
              : undefined;

            return (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
                  isActive
                    ? 'border'
                    : 'bg-card hover:bg-muted border-border cursor-pointer'
                }`}
                onClick={() => setActiveConversation(conv.id)}
                style={isActive ? activeStyle : undefined}
                onMouseEnter={(e) => {
                  if (!isActive && hasVersionColor) {
                    const el = e.currentTarget;
                    el.style.backgroundColor = currentVersionData.color || '';
                    el.style.borderColor = currentVersionData.color || '';
                    if (currentVersionData.color) el.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && hasVersionColor) {
                    const el = e.currentTarget;
                    el.style.backgroundColor = '';
                    el.style.borderColor = '';
                    if (currentVersionData.color) el.style.color = '';
                  }
                }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">{conv.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id, conv.title);
                  }}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          {activeQuest.conversations.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No conversations created. Click "Create" to create one.</p>
          )}
        </div>
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
            <Input
              value={activeConversation.title}
              onChange={(e) =>
                updateConversation(activeQuest.id, activeConversation.id, { title: e.target.value })
              }
              className="text-base font-medium max-w-sm border-none shadow-none px-0 focus-visible:ring-0"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConversation.dialogue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p className="text-lg font-medium">No Dialogue Yet</p>
                <p className="text-sm mt-1">Click "Add New Line" to create the first dialogue.</p>
              </div>
            ) : (
              activeConversation.dialogue.map((line, index) => {
                const character = currentVersionData.characters.find((c) => c.id === line.characterId);
                return (
                  <div
                    key={line.id}
                    className="flex gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === activeConversation.dialogue.length - 1}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <Select
                          value={line.characterId}
                          onValueChange={(characterId) =>
                            handleUpdateLine(line.id, { characterId })
                          }
                        >
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

                        <Input
                          value={line.displayName || ''}
                          onChange={(e) => handleUpdateLine(line.id, { displayName: e.target.value })}
                          placeholder="Display name (optional)"
                          className="flex-1"
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        <Textarea
                          value={line.text}
                          onChange={(e) => handleUpdateLine(line.id, { text: e.target.value })}
                          placeholder="Enter line..."
                          rows={4}
                          className="resize-none font-mono text-sm"
                          // maxLength={maxCharSize} for automatically force to stop to the character number
                        />

                        {line.text && (
                          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border">
                            <div className="font-medium mb-3">Preview (text wrap each lines) :</div>
                            <pre className="whitespace-pre-wrap font-mono font-normal">{wrapTextAt(line.text, maxCharSize)}</pre>
                          </div>
                        )}

                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                              <Label htmlFor={`question-${line.id}`} className="flex items-center gap-1.5 cursor-pointer">
                                <MessageCircleQuestion className="h-3.5 w-3.5" />
                                Activate question
                              </Label>
                          <Switch
                            id={`question-${line.id}`}
                            checked={line.isQuestion || false}
                            onCheckedChange={(checked) => {
                              handleUpdateLine(line.id, { 
                                isQuestion: checked,
                                answers: checked ? [] : undefined,
                                linkedToNext: checked ? false : true
                              });
                            }}
                          />
                        </div>
                      </div>

                      {line.isQuestion && (
                        <div className="mt-3 space-y-2 border-t border-border pt-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Answer Choices</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                addAnswer(activeQuest.id, activeConversation.id, line.id, { text: '' });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Answer
                            </Button>
                          </div>

                          {line.answers?.map((answer, answerIndex) => (
                            <div key={answer.id} className="flex gap-2 items-start bg-muted/30 p-2 rounded">
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={answer.text}
                                  onChange={(e) => 
                                    updateAnswer(activeQuest.id, activeConversation.id, line.id, answer.id, { text: e.target.value })
                                  }
                                  placeholder={`Answer ${answerIndex + 1}...`}
                                  className="text-sm"
                                />

                                <Select
                                  value={answer.linkedConversationId || 'none'}
                                  onValueChange={(value) =>
                                    updateAnswer(activeQuest.id, activeConversation.id, line.id, answer.id, { 
                                      linkedConversationId: value === 'none' ? undefined : value
                                    })
                                  }
                                >
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

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteAnswer(activeQuest.id, activeConversation.id, line.id, answer.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
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

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteLine(line.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
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
  );
};
