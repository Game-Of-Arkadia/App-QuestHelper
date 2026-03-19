import JSZip from 'jszip';
import { toast } from '@/hooks/use-toast';
import { wrapTextAt } from '@/lib/utils';
import { Quest, VersionData } from '@/types/dialogue';
import { MAX_CHAR_PER_LINE } from './constants';

export const useExportQuest = (activeQuest: Quest, currentVersionData: VersionData) => {
  const handleExport = () => {
    const zip = new JSZip();
    const sanitizedQuestTitle = activeQuest.title.trim().replace(/\s+/g, '_');
    const sanitizedVersionName = currentVersionData.name.trim().replace(/\s+/g, '_');
    const questFolder = zip.folder(sanitizedQuestTitle);

    activeQuest.conversations.forEach((conv) => {
      const sanitizedConvTitle = conv.title.trim().replace(/\s+/g, '_');
      const convFolder = questFolder!.folder(sanitizedConvTitle);

      conv.dialogue.forEach((line, index) => {
        const character = currentVersionData.characters.find((c) => c.id === line.characterId);
        let characterYaml = character?.yamlConfig || '';

        if (line.displayName) {
          characterYaml = characterYaml.replace(
            /(Character:\s*\n\s*name:\s*).*/i,
            `$1${line.displayName}`
          );
        }

        const filename = `${index + 1}.yml`;
        const nextLineExists = index < conv.dialogue.length - 1;
        const wrappedText = wrapTextAt(line.text, MAX_CHAR_PER_LINE);
        const lineArray = wrappedText.split('\n').map((l) => l.trim()).filter((l) => l);

        let yamlContent = `${characterYaml}\n"Dialogue":\n  "1":\n    "lines":\n`;
        lineArray.forEach((l) => {
          yamlContent += `      - "${l.replace(/"/g, '\\"')}"\n`;
        });

        if (nextLineExists && line.linkedToNext !== false) {
          yamlContent += `  "2":\n    "post-actions":\n`;
          yamlContent += `      - "${sanitizedVersionName}/${sanitizedQuestTitle}/${sanitizedConvTitle}/${index + 2} @redirect"\n`;
        }

        if (line.isQuestion && line.answers && line.answers.length > 0) {
          yamlContent += `Answers:\n`;
          line.answers.forEach((answer, ansIndex) => {
            const answerNumber = ansIndex + 1;
            const linkedConv = activeQuest.conversations.find((c) => c.id === answer.linkedConversationId);
            let actionPath = '';

            if (linkedConv) {
              const linkedConvTitle = linkedConv.title.trim().replace(/\s+/g, '_');
              actionPath = `${sanitizedVersionName}/${sanitizedQuestTitle}/${linkedConvTitle}/1 @redirect`;
            } else if (nextLineExists) {
              actionPath = `${sanitizedVersionName}/${sanitizedQuestTitle}/${sanitizedConvTitle}/${index + 2} @redirect`;
            }

            yamlContent += `  '${answerNumber}':\n`;
            yamlContent += `    text: "${answer.text.replace(/"/g, '\\"')}"\n`;
            yamlContent += `    sound: luxdialogues:luxdialogues.sounds.ding\n`;

            if (actionPath) {
              yamlContent += `    actions:\n`;
              yamlContent += `      - "${actionPath}"\n`;
            }
          });
        }

        convFolder!.file(filename, yamlContent);
      });
    });

    zip.generateAsync({ type: 'blob' }).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizedQuestTitle}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Quest exported as ZIP' });
    });
  };

  return { handleExport };
};
