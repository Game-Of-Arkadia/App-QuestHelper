import JSZip from 'jszip';
import { generateUUID } from '@/lib/utils';
import { Conversation, DialogueLine, Quest, VersionData } from '@/types/dialogue';

const parseYamlDialogue = (
  content: string,
  characters: VersionData['characters']
): Omit<DialogueLine, 'id'> => {
  const nameMatch = content.match(/Character:\s*\n\s*name:\s*(.*)/i);
  const displayName = nameMatch ? nameMatch[1].trim() : '';

  const isAmbiant = displayName.toLowerCase() === 'ambiant';

  const ambiantChar = characters.find((c) => c.name.toLowerCase() === 'ambiant');
  const defaultChar = characters.find((c) => c.name.toLowerCase() !== 'ambiant') || characters[0];

  const characterId = isAmbiant && ambiantChar ? ambiantChar.id : defaultChar?.id || '';

  const lines: string[] = [];
  const linesMatch = content.match(/"lines":\s*\n((?:\s+-\s+".*"\n?)*)/);
  if (linesMatch) {
    const lineEntries = linesMatch[1].matchAll(/- "(.*)"/g);
    for (const entry of lineEntries) {
      lines.push(entry[1].replace(/\\"/g, '"'));
    }
  }

  const text = lines.join('\n');

  const hasRedirect = content.includes('@redirect');
  const hasAnswers = content.includes('Answers:');

  const answers: DialogueLine['answers'] = [];
  if (hasAnswers) {
    const answersSection = content.split('Answers:')[1];
    if (answersSection) {
      const answerBlocks = answersSection.split(/\s+'(\d+)':/);
      for (let i = 1; i < answerBlocks.length; i += 2) {
        const block = answerBlocks[i + 1];
        if (block) {
          const textMatch = block.match(/text:\s*"(.*)"/);
          if (textMatch) {
            answers.push({
              id: generateUUID(),
              text: textMatch[1].replace(/\\"/g, '"'),
            });
          }
        }
      }
    }
  }

  return {
    characterId,
    displayName: isAmbiant ? undefined : displayName || undefined,
    text,
    linkedToNext: hasRedirect && !hasAnswers,
    isQuestion: hasAnswers && answers.length > 0,
    answers: answers.length > 0 ? answers : undefined,
  };
};

export const importQuestFromZip = async (
  file: File,
  characters: VersionData['characters']
): Promise<Quest> => {
  const zip = await JSZip.loadAsync(file);
  const folders = new Map<string, Map<number, string>>();

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;

    const parts = path.split('/').filter((part) => part);
    if (parts.length < 2) continue;

    let convFolder: string;
    let fileName: string;

    if (parts.length >= 3) {
      convFolder = parts[parts.length - 2];
      fileName = parts[parts.length - 1];
    } else {
      convFolder = parts[0];
      fileName = parts[1];
    }

    const fileIndex = parseInt(fileName.replace(/\.yml$/i, ''), 10);
    if (isNaN(fileIndex)) continue;

    if (!folders.has(convFolder)) {
      folders.set(convFolder, new Map());
    }

    const content = await entry.async('text');
    folders.get(convFolder)!.set(fileIndex, content);
  }

  const questTitle = file.name.replace(/\.zip$/i, '').trim() || 'Imported Quest';
  const conversations: Conversation[] = [];

  for (const [convName, files] of folders) {
    const sortedKeys = Array.from(files.keys()).sort((a, b) => a - b);
    const dialogue = sortedKeys.map((key) => parseYamlDialogue(files.get(key)!, characters));

    conversations.push({
      id: generateUUID(),
      title: convName.replace(/_/g, ' '),
      dialogue: dialogue.map((line) => ({
        ...line,
        id: generateUUID(),
      })),
    });
  }

  return {
    id: generateUUID(),
    title: questTitle,
    conversations,
  };
};