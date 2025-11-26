import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Character } from '@/types/dialogue';

interface CharacterDialogProps { open: boolean; onOpenChange: (open: boolean) => void; character?: Character; onSave: (character: Omit<Character, 'id'>) => void; }

export const CharacterDialog = ({ open, onOpenChange, character, onSave }: CharacterDialogProps) => {
  const [name, setName] = useState('');
  const [yamlConfig, setYamlConfig] = useState('');

  useEffect(() => {
    if (character) {
      setName(character.name);
      setYamlConfig(character.yamlConfig);
    } else {
      setName('');
      setYamlConfig('');
    }
  }, [character, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), yamlConfig: yamlConfig.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{character ? `Edit ${character.name}` : 'Edit new character'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name of your character"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="yaml">YAML Configuration</Label>
            <Textarea id="yaml" value={yamlConfig} onChange={(e) => setYamlConfig(e.target.value)} placeholder="LuxDialog YAML configuration" rows={8} className="font-mono text-sm"/>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
