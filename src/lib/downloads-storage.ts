import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DownloadFile {
  id: string;
  name: string;
  size: string;
  format: string;
  filePath: string; // Chemin du fichier dans public/downloads/
  categoryId: number;
}

export interface DownloadCategory {
  id: number;
  title: string;
  description: string;
  icon: string; // Nom de l'icône Lucide
  color: string;
  files: DownloadFile[];
}

export interface DownloadsContent {
  categories: DownloadCategory[];
}

const DOWNLOADS_DATA_FILE = join(process.cwd(), 'data', 'downloads-content.json');

const defaultContent: DownloadsContent = {
  categories: [
    {
      id: 1,
      title: "Catalogues produits",
      description: "Téléchargez nos catalogues complets de produits solaires",
      icon: "BookOpen",
      color: "bg-blue-500",
      files: [],
    },
    {
      id: 2,
      title: "Guides d'installation",
      description: "Manuels et guides techniques pour vos installations",
      icon: "FileText",
      color: "bg-green-500",
      files: [],
    },
    {
      id: 3,
      title: "Fiches techniques",
      description: "Documentation technique détaillée de nos produits",
      icon: "FileCheck",
      color: "bg-orange-500",
      files: [],
    },
    {
      id: 4,
      title: "Formations",
      description: "Documents et supports de formation",
      icon: "Download",
      color: "bg-purple-500",
      files: [],
    },
  ],
};

export function loadDownloadsContent(): DownloadsContent {
  try {
    if (existsSync(DOWNLOADS_DATA_FILE)) {
      const fileContent = readFileSync(DOWNLOADS_DATA_FILE, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error loading downloads content:', error);
  }
  
  // Create default file if it doesn't exist
  if (!existsSync(DOWNLOADS_DATA_FILE)) {
    saveDownloadsContent(defaultContent);
  }
  
  return defaultContent;
}

export function saveDownloadsContent(content: DownloadsContent): void {
  try {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
      const { mkdirSync } = require('fs');
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(DOWNLOADS_DATA_FILE, JSON.stringify(content, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving downloads content:', error);
    throw error;
  }
}

