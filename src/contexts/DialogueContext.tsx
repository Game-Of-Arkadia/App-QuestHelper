import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Character, Conversation, DialogueLine, Answer, Quest, VersionData } from '@/types/dialogue';
import { generateUUID } from '@/lib/utils';

interface DialogueContextType {
  data: AppData;
  setVersion: (versionId: string) => void;
  addVersion: (name: string, color: string) => void;
  deleteVersion: (versionId: string) => void;
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  addQuest: (title: string) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  copyQuestFromVersion: (sourceVersionId: string, questId: string) => void;
  setActiveQuest: (id: string) => void;
  addConversation: (questId: string, title: string) => void;
  updateConversation: (questId: string, conversationId: string, updates: Partial<Conversation>) => void;
  deleteConversation: (questId: string, conversationId: string) => void;
  setActiveConversation: (id: string) => void;
  addDialogueLine: (questId: string, conversationId: string, line: Omit<DialogueLine, 'id'>) => void;
  updateDialogueLine: (questId: string, conversationId: string, lineId: string, updates: Partial<DialogueLine>) => void;
  deleteDialogueLine: (questId: string, conversationId: string, lineId: string) => void;
  reorderDialogue: (questId: string, conversationId: string, fromIndex: number, toIndex: number) => void;
  addAnswer: (questId: string, conversationId: string, lineId: string, answer: Omit<Answer, 'id'>) => void;
  updateAnswer: (questId: string, conversationId: string, lineId: string, answerId: string, updates: Partial<Answer>) => void;
  deleteAnswer: (questId: string, conversationId: string, lineId: string, answerId: string) => void;
}

const DialogueContext = createContext<DialogueContextType | undefined>(undefined);

const STORAGE_KEY = 'Cookie_thats_stealing_all_your_data'; // W name for the storage key ?

const VERSION_COLORS = ['#f97316', '#22c55e', '#ec4899', '#3b82f6', '#a855f7', '#eab308', '#14b8a6', '#ef4444'];


const getInitialData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsedData = JSON.parse(stored);

    // Migrate from old version structure to new dynamic structure
    if (parsedData.version && parsedData.v1) {
      return {
        currentVersion: 'Default',
        versions: {
          v1: { ...parsedData.v1, name: 'Default', color: VERSION_COLORS[0] },
        },
      };
    }

    // Migrate from very old structure (no versions)
    if (parsedData.characters && !parsedData.currentVersion) {
      return {
        currentVersion: 'Default',
        versions: {
          v1: {
            characters: parsedData.characters,
            quests: parsedData.quests,
            activeQuestId: parsedData.activeQuestId,
            activeConversationId: parsedData.activeConversationId,
            name: 'Default',
            color: VERSION_COLORS[0],
          },
        },
      };
    }
    
    return parsedData;
  }

  return {
    currentVersion: 'Default',
    versions: {
      v1: createDefaultVersionData('Default', VERSION_COLORS[0]),
    },
  };
};

// Default data
const ambiantChar: Character = {
  id: generateUUID(),
  name: 'ambiant',
  yamlConfig: "Settings:\n typing-speed: 1 # Ticks(Second/20)\n range: 3\n effect: Freeze # Slowness / Freeze\n answer-numbers: false\n prevent-exit: false\n character-name: false\n character-image: false\n background-fog: true\nSounds:\n typing: luxdialogues:luxdialogues.sounds.typing\n selection: luxdialogues:luxdialogues.sounds.selection\nOffsets:\n name: 20\n dialogue-background: 0\n dialogue-line: 10\n answer-background: 90\n answer-line: 8\n arrow: -7\n character: -16\nCharacter:\n name: Ambiant"
  //yamlConfig: "Settings:\n  typing-speed: 1 # Ticks(Second/20)\n  range: 3\n  effect: Freeze # Slowness / Freeze\n  answer-numbers: false\n  prevent-exit: false\n  character-name: false\n  character-image: false\n  background-fog: true\nSounds:\n  typing: luxdialogues:luxdialogues.sounds.typing\n  selection: luxdialogues:luxdialogues.sounds.selection\nOffsets:\n  name: 20\n  dialogue-background: 0\n  dialogue-line: 10\n  answer-background: 90\n  answer-line: 8\n  arrow: -7\n  character: -16\nCharacter:\n  name: Ambiant\nImages:\n  character: tavernier-avatar\n  arrow: hand\n  dialogue-background: dialogue-background\n  answer-background: answer-background\n  name-start: name-start\n  name-mid: name-mid\n  name-end: name-end\n  fog: fog\nColors:\n  name: '#4f4a3e'\n  name-background: '#f8ffe0'\n  dialogue: '#4f4a3e'\n  dialogue-background: '#f8ffe0'\n  answer: '#4f4a3e'\n  answer-background: '#f8ffe0'\n  arrow: '#cdff29'\n  selected: '#4f4a3e'\n  fog: '#000000'\n",
};

const defaultChar: Character = {
  id: generateUUID(),
  name: "default",
  yamlConfig: "Settings:\n typing-speed: 1 # Ticks(Second/20)\n range: 3\n effect: Freeze # Slowness / Freeze\n answer-numbers: false\n prevent-exit: false\n character-name: true\n character-image: false\n background-fog: true\nSounds:\n typing: luxdialogues:luxdialogues.sounds.typing\n selection: luxdialogues:luxdialogues.sounds.selection\nOffsets:\n name: 20\n dialogue-background: 0\n dialogue-line: 10\n answer-background: 90\n answer-line: 8\n arrow: -7\n character: -16\nCharacter:\n name: Default"
  //yamlConfig: "Settings:\n  typing-speed: 1 # Ticks(Second/20)\n  range: 3\n  effect: Freeze # Slowness / Freeze\n  answer-numbers: false\n  prevent-exit: false\n  character-name: true\n  character-image: false\n  background-fog: true\nSounds:\n  typing: luxdialogues:luxdialogues.sounds.typing\n  selection: luxdialogues:luxdialogues.sounds.selection\nOffsets:\n  name: 20\n  dialogue-background: 0\n  dialogue-line: 10\n  answer-background: 90\n  answer-line: 8\n  arrow: -7\n  character: -16\nCharacter:\n  name:  Default\nImages:\n  character: tavernier-avatar\n  arrow: hand\n  dialogue-background: dialogue-background\n  answer-background: answer-background-large\n  name-start: name-start\n  name-mid: name-mid\n  name-end: name-end\n  fog: fog\nColors:\n  name: '#4f4a3e'\n  name-background: '#f8ffe0'\n  dialogue: '#4f4a3e'\n  dialogue-background: '#f8ffe0'\n  answer: '#4f4a3e'\n  answer-background: '#f8ffe0'\n  arrow: '#cdff29'\n  selected: '#4f4a3e'\n  fog: '#000000'\n",
};

  const defaultConversation: Conversation = {
    id: crypto.randomUUID(),
    title: 'Introduction',
    dialogue: [],
  };

  const defaultQuest: Quest = {
    id: crypto.randomUUID(),
    title: "Default Quest",
    conversations: [defaultConversation],
  };

const createDefaultVersionData = (name: string, color: string): VersionData => {

  return {
    characters: [ambiantChar, defaultChar],
    quests: [defaultQuest],
    activeQuestId: defaultQuest.id,
    activeConversationId: defaultConversation.id,
    name,
    color,
  };
};

const createEmptyVersionData = (name: string, color: string): VersionData => {
  return {
    characters: [ambiantChar, defaultChar],
    quests: [defaultQuest],
    activeQuestId: defaultQuest.id,
    activeConversationId: null,
    name,
    color,
  };
};

export const DialogueProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setVersion = (versionId: string) => {
    setData(prev => ({ ...prev, currentVersion: versionId }));
  };

  const addVersion = (name: string, color: string) => {
    const versionId = crypto.randomUUID();
    setData(prev => ({
      ...prev,
      currentVersion: versionId,
      versions: {
        ...prev.versions,
        [versionId]: createEmptyVersionData(name, color),
      },
    }));
  };

  const deleteVersion = (versionId: string) => {
    setData(prev => {
      const versions = { ...prev.versions };
      delete versions[versionId];
      const versionIds = Object.keys(versions);
      const newCurrentVersion = prev.currentVersion === versionId 
        ? versionIds[0] || ''
        : prev.currentVersion;
      
      return {
        ...prev,
        currentVersion: newCurrentVersion,
        versions,
      };
    });
  };


  const addCharacter = (character: Omit<Character, 'id'>) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          characters: [...prev.versions[prev.currentVersion].characters, { ...character, id: crypto.randomUUID() }],
        },
      },
    }));
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          characters: prev.versions[prev.currentVersion].characters.map(c => c.id === id ? { ...c, ...updates } : c),
        },
      },
    }));
  };

  const deleteCharacter = (id: string) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          characters: prev.versions[prev.currentVersion].characters.filter(c => c.id !== id),
        },
      },
    }));
  };

  const addQuest = (title: string) => {
    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title,
      conversations: [],
    };
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: [...prev.versions[prev.currentVersion].quests, newQuest],
          activeQuestId: newQuest.id,
          activeConversationId: null,
        },
      },
    }));
  };

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q => q.id === id ? { ...q, ...updates } : q),
        },
      },
    }));
  };

  const deleteQuest = (id: string) => {
    setData(prev => {
      const currentVer = prev.versions[prev.currentVersion];
      const newActiveQuestId = currentVer.activeQuestId === id 
        ? currentVer.quests.find(q => q.id !== id)?.id || null
        : currentVer.activeQuestId;
      const newActiveConversationId = currentVer.activeQuestId === id ? null : currentVer.activeConversationId;
      
      return {
        ...prev,
        versions: {
          ...prev.versions,
          [prev.currentVersion]: {
            ...currentVer,
            quests: currentVer.quests.filter(q => q.id !== id),
            activeQuestId: newActiveQuestId,
            activeConversationId: newActiveConversationId,
          },
        },
      };
    });
  };

  const copyQuestFromVersion = (sourceVersionId: string, questId: string) => {
    setData(prev => {
      const sourceVersion = prev.versions[sourceVersionId];
      const currentVersionData = prev.versions[prev.currentVersion];
      
      if (!sourceVersion || !currentVersionData) return prev;

      const questToCopy = sourceVersion.quests.find((q) => q.id === questId);
      if (!questToCopy) return prev;

      // Create a deep copy with new IDs
      const newQuestId = crypto.randomUUID();
      const conversationIdMap = new Map<string, string>();
      
      const copiedConversations = questToCopy.conversations.map((conv) => {
        const newConvId = crypto.randomUUID();
        conversationIdMap.set(conv.id, newConvId);
        
        return {
          ...conv,
          id: newConvId,
          dialogue: conv.dialogue.map((line) => ({
            ...line,
            id: crypto.randomUUID(),
            answers: line.answers?.map((answer) => ({
              ...answer,
              id: crypto.randomUUID(),
              linkedConversationId: answer.linkedConversationId
                ? conversationIdMap.get(answer.linkedConversationId) || answer.linkedConversationId
                : undefined,
            })),
          })),
        };
      });

      const copiedQuest: Quest = {
        id: newQuestId,
        title: `${questToCopy.title} (copy)`,
        conversations: copiedConversations,
      };

      return {
        ...prev,
        versions: {
          ...prev.versions,
          [prev.currentVersion]: {
            ...currentVersionData,
            quests: [...currentVersionData.quests, copiedQuest],
            activeQuestId: newQuestId,
          },
        },
      };
    });
  };

  const setActiveQuest = (id: string) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          activeQuestId: id,
          activeConversationId: null,
        },
      },
    }));
  };

  const addConversation = (questId: string, title: string) => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title,
      dialogue: [],
    };
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? { ...q, conversations: [...q.conversations, newConversation] }
              : q
          ),
          activeConversationId: newConversation.id,
        },
      },
    }));
  };

  const updateConversation = (questId: string, conversationId: string, updates: Partial<Conversation>) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? {
                  ...q,
                  conversations: q.conversations.map(c =>
                    c.id === conversationId ? { ...c, ...updates } : c
                  ),
                }
              : q
          ),
        },
      },
    }));
  };

  const deleteConversation = (questId: string, conversationId: string) => {
    setData(prev => {
      const currentVer = prev.versions[prev.currentVersion];
      const newActiveConversationId = currentVer.activeConversationId === conversationId ? null : currentVer.activeConversationId;
      
      return {
        ...prev,
        versions: {
          ...prev.versions,
          [prev.currentVersion]: {
            ...currentVer,
            quests: currentVer.quests.map(q =>
              q.id === questId
                ? { ...q, conversations: q.conversations.filter(c => c.id !== conversationId) }
                : q
            ),
            activeConversationId: newActiveConversationId,
          },
        },
      };
    });
  };

  const setActiveConversation = (id: string) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          activeConversationId: id,
        },
      },
    }));
  };

  const addDialogueLine = (questId: string, conversationId: string, line: Omit<DialogueLine, 'id'>) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? {
                  ...q,
                  conversations: q.conversations.map(c =>
                    c.id === conversationId
                      ? { ...c, dialogue: [...c.dialogue, { ...line, id: crypto.randomUUID() }] }
                      : c
                  ),
                }
              : q
          ),
        },
      },
    }));
  };

  const updateDialogueLine = (questId: string, conversationId: string, lineId: string, updates: Partial<DialogueLine>) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? {
                  ...q,
                  conversations: q.conversations.map(c =>
                    c.id === conversationId
                      ? {
                          ...c,
                          dialogue: c.dialogue.map(l =>
                            l.id === lineId ? { ...l, ...updates } : l
                          ),
                        }
                      : c
                  ),
                }
              : q
          ),
        },
      },
    }));
  };

  const deleteDialogueLine = (questId: string, conversationId: string, lineId: string) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? {
                  ...q,
                  conversations: q.conversations.map(c =>
                    c.id === conversationId
                      ? { ...c, dialogue: c.dialogue.filter(l => l.id !== lineId) }
                      : c
                  ),
                }
              : q
          ),
        },
      },
    }));
  };

  const reorderDialogue = (questId: string, conversationId: string, fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? {
                  ...q,
                  conversations: q.conversations.map(c => {
                    if (c.id !== conversationId) return c;
                    const newDialogue = [...c.dialogue];
                    const [moved] = newDialogue.splice(fromIndex, 1);
                    newDialogue.splice(toIndex, 0, moved);
                    return { ...c, dialogue: newDialogue };
                  }),
                }
              : q
          ),
        },
      },
    }));
  };

  const addAnswer = (questId: string, conversationId: string, lineId: string, answer: Omit<Answer, 'id'>) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? {
                  ...q,
                  conversations: q.conversations.map(c =>
                    c.id === conversationId
                      ? {
                          ...c,
                          dialogue: c.dialogue.map(l =>
                            l.id === lineId
                              ? {
                                  ...l,
                                  answers: [...(l.answers || []), { ...answer, id: crypto.randomUUID() }],
                                }
                              : l
                          ),
                        }
                      : c
                  ),
                }
              : q
          ),
        },
      },
    }));
  };

  const updateAnswer = (questId: string, conversationId: string, lineId: string, answerId: string, updates: Partial<Answer>) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? {
                  ...q,
                  conversations: q.conversations.map(c =>
                    c.id === conversationId
                      ? {
                          ...c,
                          dialogue: c.dialogue.map(l =>
                            l.id === lineId
                              ? {
                                  ...l,
                                  answers: l.answers?.map(a =>
                                    a.id === answerId ? { ...a, ...updates } : a
                                  ),
                                }
                              : l
                          ),
                        }
                      : c
                  ),
                }
              : q
          ),
        },
      },
    }));
  };

  const deleteAnswer = (questId: string, conversationId: string, lineId: string, answerId: string) => {
    setData(prev => ({
      ...prev,
      versions: {
        ...prev.versions,
        [prev.currentVersion]: {
          ...prev.versions[prev.currentVersion],
          quests: prev.versions[prev.currentVersion].quests.map(q =>
            q.id === questId
              ? {
                  ...q,
                  conversations: q.conversations.map(c =>
                    c.id === conversationId
                      ? {
                          ...c,
                          dialogue: c.dialogue.map(l =>
                            l.id === lineId
                              ? {
                                  ...l,
                                  answers: l.answers?.filter(a => a.id !== answerId),
                                }
                              : l
                          ),
                        }
                      : c
                  ),
                }
              : q
          ),
        },
      },
    }));
  };

  return (
    <DialogueContext.Provider
      value={{
        data,
        setVersion,
        addVersion,
        deleteVersion,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        addQuest,
        updateQuest,
        deleteQuest,
        copyQuestFromVersion,
        setActiveQuest,
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
      }}
    >
      {children}
    </DialogueContext.Provider>
  );
};

export const useDialogue = () => {
  const context = useContext(DialogueContext);
  if (!context) {
    throw new Error('useDialogue must be used within DialogueProvider');
  }
  return context;
};
