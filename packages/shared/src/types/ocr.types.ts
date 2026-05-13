export type OcrStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type OcrProvider = 'tesseract' | 'azure' | 'claude' | 'google';

export interface OcrPage {
  pageNumber: number;
  text: string;
}

export interface IlegibleSection {
  page: number;
  fragment: string;
}

export interface OcrResult {
  pages: OcrPage[];
  illegibleSections: IlegibleSection[];
  fullText: string;
  errorReport: string;
}

export interface OcrJobDto {
  id: string;
  status: OcrStatus;
  provider?: string;
  pageCount?: number;
  rawText?: string;
  errorReport?: string;
  inputPath: string;
  outputPath?: string;
  createdAt: string;
}
