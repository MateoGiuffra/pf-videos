import fs from 'fs/promises';
import path from 'path';

export interface PracticeVideo {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  offset: number;
  year: number;
  date: string;
  cuatris: number[];
}

export interface TheoryVideo {
  id: string;
  url: string;
  title: string;
  classNumber: number;
  duration: string;
  views: number;
  emision: string;
  sortNumber: number;
}

export async function normalizedYoutubeLinks(): Promise<PracticeVideo[]> {
  const filePath = path.join(process.cwd(), 'data', 'normalized_youtube_links.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export async function normalizedFidelLinks(): Promise<TheoryVideo[]> {
  const filePath = path.join(process.cwd(), 'data', 'normalized_fidel_links.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}
