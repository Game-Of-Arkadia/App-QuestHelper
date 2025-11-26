import { useDialogue } from '@/contexts/DialogueContext';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const VERSION_COLORS = ['#f97316', '#22c55e', '#ec4899', '#3b82f6', '#a855f7', '#eab308', '#14b8a6', '#ef4444'];

export const VersionSelector = () => {
  const { data, setVersion, addVersion, updateVersion } = useDialogue();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(VERSION_COLORS[0]);
  const [selectedVersionId, setSelectedVersionId] = useState(data.currentVersion);
  const [editVersions, setEditVersions] = useState<{[key: string]: {name: string, color: string}}>({});

  const handleCreate = () => {
    if (name.trim()) {
      addVersion(name.trim(), selectedColor);
      setName('');
      setSelectedColor(VERSION_COLORS[0]);
      setIsCreateOpen(false);
    }
  };

  const handleOpenEdit = () => {
    const initialEditState: {[key: string]: {name: string, color: string}} = {};
    Object.entries(data.versions).forEach(([id, versionData]) => {
      initialEditState[id] = {
        name: versionData.name,
        color: versionData.color,
      };
    });
    setEditVersions(initialEditState);
    setSelectedVersionId(data.currentVersion);
    setIsEditOpen(true);
  };

  const handleUpdateVersion = (versionId: string) => {
    const editData = editVersions[versionId];
    if (editData && editData.name.trim()) {
      updateVersion(versionId, {
        name: editData.name.trim(),
        color: editData.color,
      });
    }
  };

  const handleUpdateAll = () => {
    Object.keys(editVersions).forEach(versionId => {
      handleUpdateVersion(versionId);
    });
    setIsEditOpen(false);
  };

  const versionEntries = Object.entries(data.versions);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        {versionEntries.map(([id, versionData]) => (
          <button key={id} onClick={() => setVersion(id)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${data.currentVersion === id ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted' } `} style={data.currentVersion === id ? { backgroundColor: versionData.color, color: 'white' } : {}}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>City Settings</DialogTitle>
          </DialogHeader>
          <Tabs value={selectedVersionId} onValueChange={setSelectedVersionId} className="pt-4">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${versionEntries.length}, 1fr)` }}>
              {versionEntries.map(([id, versionData]) => (
                <TabsTrigger key={id} value={id} className="gap-2">
                  <div  className="w-3 h-3 rounded-full"  style={{ backgroundColor: versionData.color }}/>
                  {versionData.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {versionEntries.map(([id, versionData]) => (
              <TabsContent key={id} value={id} className="space-y-6 mt-4">
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Settings</h3>
                  <div className="space-y-2">
                    <Label htmlFor={`edit-version-name-${id}`}>City Name</Label>
                    <Input id={`edit-version-name-${id}`} value={editVersions[id]?.name || versionData.name} onChange={(e) => setEditVersions(prev => ({ ...prev, [id]: { ...prev[id], name: e.target.value } }))} placeholder="e.g., my_version"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {VERSION_COLORS.map((color) => (
                        <button key={color} onClick={() => setEditVersions(prev => ({ ...prev, [id]: { ...prev[id], color } }))} className={`w-10 h-10 rounded-md transition-all ${ (editVersions[id]?.color || versionData.color) === color  ? 'ring-2 ring-offset-2 ring-foreground scale-110'  : 'hover:scale-105' }`} style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20 opacity-50">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Advanced Settings</h3>
                  <p className="text-sm text-muted-foreground">More settings coming soon...</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAll}>
              Save All Changes
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
            <DialogTitle>Create New City</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="version-name">City Name</Label>
              <Input id="version-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Riddermark" onKeyDown={(e) => e.key === 'Enter' && handleCreate()}/>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {VERSION_COLORS.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-md transition-all ${ selectedColor === color ? 'ring-2 ring-offset-2 ring-foreground scale-110' : '' }`} style={{ backgroundColor: color }}/>
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
