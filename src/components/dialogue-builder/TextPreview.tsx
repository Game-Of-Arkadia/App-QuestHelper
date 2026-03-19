import { wrapTextAt } from '@/lib/utils';
import { MAX_CHAR_PER_LINE } from './constants';

interface TextPreviewProps {
  text: string;
}

export const TextPreview = ({ text }: TextPreviewProps) => {
  if (!text) {
    return null;
  }

  return (
    <div
      className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border"
    >
      <div
        className="font-medium mb-1"
      >
        Preview :
      </div>
      <pre
        className="font-mono whitespace-pre-wrap"
      >
        {wrapTextAt(text, MAX_CHAR_PER_LINE)}
      </pre>
    </div>
  );
};
