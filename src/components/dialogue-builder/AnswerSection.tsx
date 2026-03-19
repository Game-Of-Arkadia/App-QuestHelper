import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Answer, Quest } from '@/types/dialogue';

interface AnswerSectionProps {
  lineId: string;
  answers: Answer[];
  questId: string;
  convId: string;
  activeQuest: Quest;
  onAddAnswer: (questId: string, convId: string, lineId: string, answer: Omit<Answer, 'id'>) => void;
  onUpdateAnswer: (questId: string, convId: string, lineId: string, answerId: string, updates: Partial<Answer>) => void;
  onDeleteAnswer: (questId: string, convId: string, lineId: string, answerId: string) => void;
}

export const AnswerSection = ({
  lineId,
  answers,
  questId,
  convId,
  activeQuest,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
}: AnswerSectionProps) => (
  <div
    className="mt-3 space-y-2 border-t border-border pt-3"
  >
    <div
      className="flex items-center justify-between"
    >
      <Label
        className="text-sm font-medium"
      >
        Answer Choices
      </Label>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onAddAnswer(questId, convId, lineId, { text: '' })}
      >
        <Plus
          className="h-3 w-3 mr-1"
        />
        Add Answer
      </Button>
    </div>

    {answers.map((answer, answerIndex) => (
      <div
        key={answer.id}
        className="flex gap-2 items-start bg-muted/30 p-2 rounded"
      >
        <div
          className="flex-1 space-y-2"
        >
          <Input
            value={answer.text}
            onChange={(e) => onUpdateAnswer(questId, convId, lineId, answer.id, { text: e.target.value })}
            placeholder={`Answer ${answerIndex + 1}...`}
            className="text-sm"
          />
          <Select
            value={answer.linkedConversationId || 'none'}
            onValueChange={(value) =>
              onUpdateAnswer(questId, convId, lineId, answer.id, {
                linkedConversationId: value === 'none' ? undefined : value,
              })
            }
          >
            <SelectTrigger
              className="text-sm h-8"
            >
              <SelectValue
                placeholder="Link to conversation in this quest (optional)"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="none"
              >
                <span
                  className="flex items-center gap-1"
                >
                  Continue
                </span>
              </SelectItem>
              {activeQuest.conversations.map((conv) => (
                <SelectItem
                  key={conv.id}
                  value={conv.id}
                >
                  <span
                    className="flex items-center justify-between w-full"
                  >
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
          onClick={() => onDeleteAnswer(questId, convId, lineId, answer.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2
            className="h-3.5 w-3.5"
          />
        </Button>
      </div>
    ))}

    {answers.length === 0 && (
      <p
        className="text-xs text-muted-foreground italic"
      >
        Click "Add Answer" to add a new answer.
      </p>
    )}
  </div>
);
