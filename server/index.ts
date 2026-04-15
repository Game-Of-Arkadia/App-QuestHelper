import express, { Request, Response } from 'express';
import fs from 'fs';
import path, { dirname as getDirname } from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = getDirname(filename);

const app = express();
const PORT = process.env.PORT || 3001;

const STORAGE_PATH = path.join(dirname, '..', 'storage.json');

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const loadData = (): any => {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data from storage.json:', error);
  }
  return null;
};

const saveData = (data: any): boolean => {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving data to storage.json:', error);
    return false;
  }
};

app.get('/api/data', (req: Request, res: Response) => {
  const data = loadData();
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'No data found' });
  }
});

app.post('/api/data', (req: Request, res: Response) => {
  const data = req.body;
  const success = saveData(data);
  if (success) {
    res.json({ success: true, message: 'Data saved successfully' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to save data' });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request payload is too large. Please reduce quest data size.',
    });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server currently running on http://localhost:${PORT}`);
  console.log(`Storage file path: ${STORAGE_PATH}`);
  console.log(`Have fun using QuestHelper!`);
});
