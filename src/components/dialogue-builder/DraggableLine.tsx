import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, HelpCircle, Trash2 } from 'lucide-react';
import { DialogueLine } from '@/types/dialogue';
import { TextPreview } from './TextPreview';
import { AnswerSection } from './AnswerSection';

interface DraggableLineProps {
  line: DialogueLine;
  index: number;
  totalLines: number;
  questId: string;
  convId: string;
  character: any;
  onUpdate: (lineId: string, updates: Partial<DialogueLine>) => void;
  onDelete: (lineId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const DraggableLine = ({
  line,
  index,
  totalLines,
  questId,
  convId,
  character,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: DraggableLineProps) => {
  const { data, addAnswer, updateAnswer, deleteAnswer } = useDialogue();
  const currentVersionData = data.versions[data.currentVersion];
  const activeQuest = currentVersionData.quests.find((q) => q.id === questId);

  return (
    <div
      className="flex gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
    >
      <div
        className="flex flex-col items-center gap-1 pt-2"
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="h-7 w-7 p-0"
        >
          <ArrowUp
            className="h-4 w-4"
          />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onMoveDown(index)}
          disabled={index === totalLines - 1}
          className="h-7 w-7 p-0"
        >
          <ArrowDown
            className="h-4 w-4"
          />
        </Button>
      </div>

      <div
        className="flex-1 space-y-3"
      >
        <div
          className="flex gap-2"
        >
          <Select
            value={line.characterId}
            onValueChange={(characterId) => onUpdate(line.id, { characterId })}
          >
            <SelectTrigger
              className="w-48"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentVersionData.characters.map((char) => (
                <SelectItem
                  key={char.id}
                  value={char.id}
                >
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={line.displayName || ''}
            onChange={(e) => onUpdate(line.id, { displayName: e.target.value })}
            placeholder="Display name (optional)"
            className="flex-1"
          />
        </div>

        <Textarea
          value={line.text}
          onChange={(e) => onUpdate(line.id, { text: e.target.value })}
          placeholder="Enter line..."
          rows={3}
          className="resize-none font-mono text-sm"
          data-dialogue-textarea
        />

        <TextPreview
          text={line.text}
        />

        <div
          className="flex items-center gap-4 text-sm"
        >
          <div
            className="flex items-center gap-2"
          >
            <Switch
              id={`question-${line.id}`}
              checked={line.isQuestion || false}
              onCheckedChange={(checked) => {
                onUpdate(line.id, {
                  isQuestion: checked,
                  answers: checked ? [] : undefined,
                  linkedToNext: checked ? false : true,
                });
              }}
            />
            <Label
              htmlFor={`question-${line.id}`}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle
                className="h-3.5 w-3.5"
              />
              User choice
            </Label>
          </div>
        </div>

        {line.isQuestion && activeQuest && (
          <AnswerSection
            lineId={line.id}
            answers={line.answers || []}
            questId={questId}
            convId={convId}
            activeQuest={activeQuest}
            onAddAnswer={addAnswer}
            onUpdateAnswer={updateAnswer}
            onDeleteAnswer={deleteAnswer}
          />
        )}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onDelete(line.id)}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash2
          className="h-4 w-4"
        />
      </Button>
    </div>
  );
};
