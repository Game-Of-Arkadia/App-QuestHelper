import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const VERSION_COLORS = ['#f97316', '#22c55e', '#ec4899', '#3b82f6', '#a855f7', '#eab308', '#14b8a6', '#ef4444'];

export const VersionSelector = () => {
  const { data, setVersion, addVersion, updateVersion } = useDialogue();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(VERSION_COLORS[0]);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      addVersion(name.trim(), selectedColor);
      setName('');
      setSelectedColor(VERSION_COLORS[0]);
      setIsCreateOpen(false);
    }
  };

  const handleOpenEdit = () => {
    const currentVersionData = data.versions[data.currentVersion];
    setEditName(currentVersionData.name);
    setEditColor(currentVersionData.color);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (editName.trim()) {
      updateVersion(data.currentVersion, {
        name: editName.trim(),
        color: editColor,
      });
      setIsEditOpen(false);
    }
  };

  const versionEntries = Object.entries(data.versions);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        {versionEntries.map(([id, versionData]) => (
          <button
            key={id}
            onClick={() => setVersion(id)}
            className={`
              px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300
              ${data.currentVersion === id
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }
            `}
            style={data.currentVersion === id ? {
              backgroundColor: versionData.color,
              color: 'white',
            } : {}}
          >
            {versionData.name}
          </button>
        ))}
      </div>
      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={handleOpenEdit}>
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-version-name">Version Name</Label>
              <Input
                id="edit-version-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g., my_version"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {VERSION_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditColor(color)}
                    className={`w-10 h-10 rounded-md transition-all ${
                      editColor === color ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleUpdate} className="w-full" disabled={!editName.trim()}>
              Update !
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="version-name">Version Name</Label>
              <Input
                id="version-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Riddermark"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {VERSION_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-md transition-all ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={!name.trim()}>
              Create Version
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
