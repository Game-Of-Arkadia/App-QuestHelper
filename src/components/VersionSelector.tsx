import { useDialogue } from '@/contexts/DialogueContext';
import type { Version } from '@/types/dialogue';

const versions: { id: Version; label: string }[] = [
  { id: 'v1', label: 'v1' },
  { id: 'v2', label: 'v2' },
  { id: 'v3', label: 'v3' },
];

export const VersionSelector = () => {
  const { data, setVersion } = useDialogue();

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      {versions.map((version) => (
        <button
          key={version.id}
          onClick={() => setVersion(version.id)}
          className={`
            px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300
            ${data.version === version.id
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }
          `}
        >
          {version.label}
        </button>
      ))}
    </div>
  );
};
