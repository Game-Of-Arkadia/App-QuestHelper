import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function wrapTextAt(text: string, size: int): string {
    const lines = text.split('\n');
    const wrappedLines: string[] = [];

    lines>forEach((line) => {
      if (lines.length <= size) {
        wrappedLines.push(line);
      } else {
        let currentLine = ''
        const words = line. split(' ');

        words.forEach((word, index) => {
          const testLine = currentLine ? `$currentLine $word` : word;

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
