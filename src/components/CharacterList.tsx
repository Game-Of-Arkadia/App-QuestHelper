import { useState } from 'react';
import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { CharacterDialog } from './CharacterDialog';
import { Character } from '@/types/dialogue';
import { UserCircle, Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const CharacterList = () => {
  const { data, addCharacter, updateCharacter, deleteCharacter } = useDialogue();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();

  const handleAdd = () => {
    setEditingCharacter(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setDialogOpen(true);
  };

  const handleSave = (character: Omit<Character, 'id'>) => {
    if (editingCharacter) {
      updateCharacter(editingCharacter.id, character);
      toast({ title: 'Character updated' });
    } else {
      addCharacter(character);
      toast({ title: 'Character added' });
    }
  };

  const handleDelete = (id: string) => {
    if (data[data.version].characters.length === 1) {
      toast({ title: 'Cannot delete last character', variant: 'destructive' });
      return;
    }
    deleteCharacter(id);
    toast({ title: 'Character deleted' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-semibold text-foreground">Characters</h2>
        <Button size="sm" variant="ghost" onClick={handleAdd} className="h-7 w-7 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {data[data.version].characters.map((character) => (
          <div
            key={character.id}
            className="group flex items-start gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
          >
            <UserCircle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground truncate">{character.name}</div>
              {character.yamlConfig && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 font-mono">
                  {character.yamlConfig}
                </p>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(character)}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(character.id)}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CharacterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        character={editingCharacter}
        onSave={handleSave}
      />
    </div>
  );
};
