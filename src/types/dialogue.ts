export interface Character {
  id: string;
  name: string;
  yamlConfig: string;
}

export interface Answer {
  id: string;
  text: string;
  linkedConversationId?: string;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  displayName?: string;
  text: string;
  linkedToNext?: boolean;
  isQuestion?: boolean;
  answers?: Answer[];
}

export interface Conversation {
  id: string;
  title: string;
  dialogue: DialogueLine[];
}

export interface Quest {
  id: string;
  title: string;
  conversations: Conversation[];
}

export type Version = 'v1' | 'v2' | 'v3';

export interface AppData {
  characters: Character[];
  quests: Quest[];
  activeQuestId: string | null;
  activeConversationId: string | null;
  version: Version;
}
