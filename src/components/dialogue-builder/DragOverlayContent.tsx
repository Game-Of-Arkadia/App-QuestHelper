import { Character, DialogueLine } from '@/types/dialogue';

interface DragOverlayContentProps {
  line: DialogueLine;
  characters: Character[];
}

export const DragOverlayContent = ({ line, characters }: DragOverlayContentProps) => (
  <div
    className="p-4 bg-card border-2 border-accent rounded-lg shadow-xl opacity-80 max-w-md"
  >
    <div
      className="text-sm font-medium mb-1"
    >
      {characters.find((c) => c.id === line.characterId)?.name || 'Unknown'}
    </div>
    <div
      className="text-xs text-muted-foreground line-clamp-2"
    >
      {line.text || '(empty)'}
    </div>
  </div>
);
