import { Input } from '@/components/ui/input';
import { Conversation } from '@/types/dialogue';

interface ConversationHeaderProps {
  conversation: Conversation;
  questId: string;
  onUpdateConversation: (questId: string, conversationId: string, updates: Partial<Conversation>) => void;
}

export const ConversationHeader = ({
  conversation,
  questId,
  onUpdateConversation,
}: ConversationHeaderProps) => (
  <div
    className="flex items-center p-4 border-b border-border bg-card"
  >
    <Input
      value={conversation.title}
      onChange={(e) =>
        onUpdateConversation(questId, conversation.id, { title: e.target.value })
      }
      className="text-base font-medium max-w-sm border-none shadow-none px-0 focus-visible:ring-0"
    />
  </div>
);
