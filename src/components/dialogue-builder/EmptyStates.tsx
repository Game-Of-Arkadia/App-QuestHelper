import { FolderOpen, MessageSquare } from 'lucide-react';

export const NoVersionState = () => (
  <div
    className="flex items-center justify-center h-full"
  >
    <p
      className="text-muted-foreground"
    >
      No version selected
    </p>
  </div>
);

export const NoQuestState = () => (
  <div
    className="flex flex-col items-center justify-center h-full text-muted-foreground"
  >
    <FolderOpen
      className="h-16 w-16 mb-4 opacity-50"
    />
    <p
      className="text-lg font-medium"
    >
      No quest selected
    </p>
    <p
      className="text-sm mt-1"
    >
      Select or create a quest to start
    </p>
  </div>
);

export const NoConversationState = () => (
  <div
    className="flex-1 flex items-center justify-center text-muted-foreground"
  >
    <div
      className="text-center"
    >
      <MessageSquare
        className="h-12 w-12 mb-3 mx-auto opacity-50"
      />
      <p
        className="text-lg font-medium"
      >
        No conversation selected
      </p>
      <p
        className="text-sm mt-1"
      >
        Select or create a conversation to add dialogues
      </p>
    </div>
  </div>
);

export const NoDialogueState = () => (
  <div
    className="flex flex-col items-center justify-center h-full text-center text-muted-foreground"
  >
    <p
      className="text-lg font-medium"
    >
      No Dialogue Yet
    </p>
    <p
      className="text-sm mt-1"
    >
      Click "Add New Line" to create the first dialogue.
    </p>
  </div>
);
