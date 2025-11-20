import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Character, Conversation, DialogueLine, Answer, Quest, Version, VersionData } from '@/types/dialogue';

interface DialogueContextType {
  data: AppData;
  setVersion: (version: Version) => void;
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  addQuest: (title: string) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
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

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const getInitialData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsedData = JSON.parse(stored);
    // Migrate old data to new version
    if (parsedData.characters && !parsedData.v1) {
      const oldData = {
        characters: parsedData.characters,
        quests: parsedData.quests,
        activeQuestId: parsedData.activeQuestId,
        activeConversationId: parsedData.activeConversationId,
      };
      return {
        version: parsedData.version || 'v1',
        v1: oldData,
        v2: createDefaultVersionData('Quest for v2'),
        v3: createDefaultVersionData('Welcome to v3 !'),
      };
    }
    return parsedData;
  }
  
  return {
    version: 'v1' as Version,
    v1: createDefaultVersionData('Default v1 Quest'),
    v2: createDefaultVersionData('Quest for v2'),
    v3: createDefaultVersionData('Welcome to v3 !'),
  };
};

const createDefaultVersionData = (defaultName: string): VersionData => {
  
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
    title: defaultName,
    conversations: [defaultConversation],
  };
  
  return {
    characters: [defaultChar, ambiantChar],
    quests: [defaultQuest],
    activeQuestId: "None",
    activeConversationId: "None",
  };
};

const createEmptyVersionData = (): VersionData => {
  return {
    characters: [],
    quests: [],
    activeQuestId: null,
    activeConversationId: null,
  };
};

export const DialogueProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setVersion = (version: Version) => {
    setData(prev => ({ ...prev, version }));
  };


  const addCharacter = (character: Omit<Character, 'id'>) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        characters: [...prev[prev.version].characters, { ...character, id: crypto.randomUUID() }],
      },
    }));
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        characters: prev[prev.version].characters.map(c => c.id === id ? { ...c, ...updates } : c),
      },
    }));
  };

  const deleteCharacter = (id: string) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        characters: prev[prev.version].characters.filter(c => c.id !== id),
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
      [prev.version]: {
        ...prev[prev.version],
        quests: [...prev[prev.version].quests, newQuest],
        activeQuestId: newQuest.id,
        activeConversationId: null,
      },
    }));
  };

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q => q.id === id ? { ...q, ...updates } : q),
      },
    }));
  };

  const deleteQuest = (id: string) => {
    setData(prev => {
      const newActiveQuestId = prev[prev.version].activeQuestId === id 
        ? prev[prev.version].quests.find(q => q.id !== id)?.id || null
        : prev[prev.version].activeQuestId;
      const newActiveConversationId = prev[prev.version].activeQuestId === id ? null : prev[prev.version].activeConversationId;
      
      return {
        ...prev,
        [prev.version]: {
          ...prev[prev.version],
          quests: prev[prev.version].quests.filter(q => q.id !== id),
          activeQuestId: newActiveQuestId,
          activeConversationId: newActiveConversationId,
        },
      };
    });
  };

  const setActiveQuest = (id: string) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        activeQuestId: id,
        activeConversationId: null,
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
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
          q.id === questId
            ? { ...q, conversations: [...q.conversations, newConversation] }
            : q
        ),
        activeConversationId: newConversation.id,
      },
    }));
  };

  const updateConversation = (questId: string, conversationId: string, updates: Partial<Conversation>) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
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
    }));
  };

  const deleteConversation = (questId: string, conversationId: string) => {
    setData(prev => {
      const newActiveConversationId = prev[prev.version].activeConversationId === conversationId ? null : prev[prev.version].activeConversationId;
      
      return {
        ...prev,
        [prev.version]: {
          ...prev[prev.version],
          quests: prev[prev.version].quests.map(q =>
            q.id === questId
              ? { ...q, conversations: q.conversations.filter(c => c.id !== conversationId) }
              : q
          ),
          activeConversationId: newActiveConversationId,
        },
      };
    });
  };

  const setActiveConversation = (id: string) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        activeConversationId: id,
      },
    }));
  };

  const addDialogueLine = (questId: string, conversationId: string, line: Omit<DialogueLine, 'id'>) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
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
    }));
  };

  const updateDialogueLine = (questId: string, conversationId: string, lineId: string, updates: Partial<DialogueLine>) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
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
    }));
  };

  const deleteDialogueLine = (questId: string, conversationId: string, lineId: string) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
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
    }));
  };

  const reorderDialogue = (questId: string, conversationId: string, fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
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
    }));
  };

  const addAnswer = (questId: string, conversationId: string, lineId: string, answer: Omit<Answer, 'id'>) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
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
    }));
  };

  const updateAnswer = (questId: string, conversationId: string, lineId: string, answerId: string, updates: Partial<Answer>) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
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
    }));
  };

  const deleteAnswer = (questId: string, conversationId: string, lineId: string, answerId: string) => {
    setData(prev => ({
      ...prev,
      [prev.version]: {
        ...prev[prev.version],
        quests: prev[prev.version].quests.map(q =>
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
    }));
  };

  return (
    <DialogueContext.Provider
      value={{
        data,
        setVersion,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        addQuest,
        updateQuest,
        deleteQuest,
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
