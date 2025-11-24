import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function wrapTextAt(text: string, size: int): string {
    const lines = text.split('\n');
    const wrappedLines: string[] = [];

    lines.forEach((line) => {
      if (line.length <= size) {
        wrappedLines.push(line);
      } else {
        let currentLine = ''
        const words = line.split(' ');

        words.forEach((word, index) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;

          if (testLine.length <= size) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              wrappedLines.push(currentLine);
            }
            currentLine = word;
          }
          if (index === words.length - 1 && currentLine) {
            wrappedLines.push(currentLine);
          }
        });
      }
    });
    return wrappedLines.join('\n')
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}