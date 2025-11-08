import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Character, Conversation, DialogueLine, Answer, Quest } from '@/types/dialogue';

interface DialogueContextType {
  data: AppData;
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

const STORAGE_KEY = 'Cookie_thats_stealing_all_your_data';

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
    return JSON.parse(stored);
  }
  
  // Default data
  const ambiantChar: Character = {
    id: generateUUID(),
    name: 'ambiant',
    yamlConfig: "Settings:\n  typing-speed: 1 # Ticks(Second/20)\n  range: 3\n  effect: Freeze # Slowness / Freeze\n  answer-numbers: false\n  prevent-exit: false\n  character-name: false\n  character-image: false\n  background-fog: true\nSounds:\n  typing: luxdialogues:luxdialogues.sounds.typing\n  selection: luxdialogues:luxdialogues.sounds.selection\nOffsets:\n  name: 20\n  dialogue-background: 0\n  dialogue-line: 10\n  answer-background: 90\n  answer-line: 8\n  arrow: -7\n  character: -16\nCharacter:\n  name: Ambiant\nImages:\n  character: tavernier-avatar\n  arrow: hand\n  dialogue-background: dialogue-background\n  answer-background: answer-background\n  name-start: name-start\n  name-mid: name-mid\n  name-end: name-end\n  fog: fog\nColors:\n  name: '#4f4a3e'\n  name-background: '#f8ffe0'\n  dialogue: '#4f4a3e'\n  dialogue-background: '#f8ffe0'\n  answer: '#4f4a3e'\n  answer-background: '#f8ffe0'\n  arrow: '#cdff29'\n  selected: '#4f4a3e'\n  fog: '#000000'\n",
  };

  const defaultChar: Character = {
    id: generateUUID(),
    name: "default",
    yamlConfig: "Settings:\n  typing-speed: 1 # Ticks(Second/20)\n  range: 3\n  effect: Freeze # Slowness / Freeze\n  answer-numbers: false\n  prevent-exit: false\n  character-name: true\n  character-image: false\n  background-fog: true\nSounds:\n  typing: luxdialogues:luxdialogues.sounds.typing\n  selection: luxdialogues:luxdialogues.sounds.selection\nOffsets:\n  name: 20\n  dialogue-background: 0\n  dialogue-line: 10\n  answer-background: 90\n  answer-line: 8\n  arrow: -7\n  character: -16\nCharacter:\n  name:  Default\nImages:\n  character: tavernier-avatar\n  arrow: hand\n  dialogue-background: dialogue-background\n  answer-background: answer-background-large\n  name-start: name-start\n  name-mid: name-mid\n  name-end: name-end\n  fog: fog\nColors:\n  name: '#4f4a3e'\n  name-background: '#f8ffe0'\n  dialogue: '#4f4a3e'\n  dialogue-background: '#f8ffe0'\n  answer: '#4f4a3e'\n  answer-background: '#f8ffe0'\n  arrow: '#cdff29'\n  selected: '#4f4a3e'\n  fog: '#000000'\n",
  };

  /*const defaultConversation: Conversation = {
    id: generateUUID(),
    title: 'Introduction',
    dialogue: [],
  };*/
  
  return {
    characters: [defaultChar, ambiantChar],
    quests: [],
    activeQuestId: "None",
    activeConversationId: "None",
  };
};

export const DialogueProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addCharacter = (character: Omit<Character, 'id'>) => {
    setData(prev => ({
      ...prev,
      characters: [...prev.characters, { ...character, id: generateUUID() }],
    }));
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setData(prev => ({
      ...prev,
      characters: prev.characters.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const deleteCharacter = (id: string) => {
    setData(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== id),
    }));
  };

  const addQuest = (title: string) => {
    const newQuest: Quest = {
      id: generateUUID(),
      title,
      conversations: [],
    };
    setData(prev => ({
      ...prev,
      quests: [...prev.quests, newQuest],
      activeQuestId: newQuest.id,
      activeConversationId: null,
    }));
  };

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q => q.id === id ? { ...q, ...updates } : q),
    }));
  };

  const deleteQuest = (id: string) => {
    setData(prev => {
      const filtered = prev.quests.filter(q => q.id !== id);
      return {
        ...prev,
        quests: filtered,
        activeQuestId: prev.activeQuestId === id ? (filtered[0]?.id || null) : prev.activeQuestId,
        activeConversationId: prev.activeQuestId === id ? null : prev.activeConversationId,
      };
    });
  };

  const setActiveQuest = (id: string) => {
    setData(prev => ({ 
      ...prev, 
      activeQuestId: id,
      activeConversationId: null,
    }));
  };

  const addConversation = (questId: string, title: string) => {
    const newConversation: Conversation = {
      id: generateUUID(),
      title,
      dialogue: [],
    };
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? { ...q, conversations: [...q.conversations, newConversation] }
          : q
      ),
      activeConversationId: newConversation.id,
    }));
  };

  const updateConversation = (questId: string, conversationId: string, updates: Partial<Conversation>) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? { ...q, conversations: q.conversations.map(c => c.id === conversationId ? { ...c, ...updates } : c) }
          : q
      ),
    }));
  };

  const deleteConversation = (questId: string, conversationId: string) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? { ...q, conversations: q.conversations.filter(c => c.id !== conversationId) }
          : q
      ),
      activeConversationId: prev.activeConversationId === conversationId ? null : prev.activeConversationId,
    }));
  };

  const setActiveConversation = (id: string) => {
    setData(prev => ({ ...prev, activeConversationId: id }));
  };

  const addDialogueLine = (questId: string, conversationId: string, line: Omit<DialogueLine, 'id'>) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? {
              ...q,
              conversations: q.conversations.map(c =>
                c.id === conversationId
                  ? { ...c, dialogue: [...c.dialogue, { ...line, id: generateUUID() }] }
                  : c
              ),
            }
          : q
      ),
    }));
  };

  const updateDialogueLine = (questId: string, conversationId: string, lineId: string, updates: Partial<DialogueLine>) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? {
              ...q,
              conversations: q.conversations.map(c =>
                c.id === conversationId
                  ? {
                      ...c,
                      dialogue: c.dialogue.map(line =>
                        line.id === lineId ? { ...line, ...updates } : line
                      ),
                    }
                  : c
              ),
            }
          : q
      ),
    }));
  };

  const deleteDialogueLine = (questId: string, conversationId: string, lineId: string) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? {
              ...q,
              conversations: q.conversations.map(c =>
                c.id === conversationId
                  ? { ...c, dialogue: c.dialogue.filter(line => line.id !== lineId) }
                  : c
              ),
            }
          : q
      ),
    }));
  };

  const reorderDialogue = (questId: string, conversationId: string, fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
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
    }));
  };

  const addAnswer = (questId: string, conversationId: string, lineId: string, answer: Omit<Answer, 'id'>) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? {
              ...q,
              conversations: q.conversations.map(c =>
                c.id === conversationId
                  ? {
                      ...c,
                      dialogue: c.dialogue.map(line =>
                        line.id === lineId
                          ? { ...line, answers: [...(line.answers || []), { ...answer, id: generateUUID() }] }
                          : line
                      ),
                    }
                  : c
              ),
            }
          : q
      ),
    }));
  };

  const updateAnswer = (questId: string, conversationId: string, lineId: string, answerId: string, updates: Partial<Answer>) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? {
              ...q,
              conversations: q.conversations.map(c =>
                c.id === conversationId
                  ? {
                      ...c,
                      dialogue: c.dialogue.map(line =>
                        line.id === lineId
                          ? {
                              ...line,
                              answers: line.answers?.map(answer =>
                                answer.id === answerId ? { ...answer, ...updates } : answer
                              ),
                            }
                          : line
                      ),
                    }
                  : c
              ),
            }
          : q
      ),
    }));
  };

  const deleteAnswer = (questId: string, conversationId: string, lineId: string, answerId: string) => {
    setData(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId
          ? {
              ...q,
              conversations: q.conversations.map(c =>
                c.id === conversationId
                  ? {
                      ...c,
                      dialogue: c.dialogue.map(line =>
                        line.id === lineId
                          ? { ...line, answers: line.answers?.filter(answer => answer.id !== answerId) }
                          : line
                      ),
                    }
                  : c
              ),
            }
          : q
      ),
    }));
  };

  return (
    <DialogueContext.Provider
      value={{
        data,
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
