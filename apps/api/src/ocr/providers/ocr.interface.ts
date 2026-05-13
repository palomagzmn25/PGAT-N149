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
}

export interface IOcrProvider {
  process(buffer: Buffer, mimeType: string): Promise<OcrResult>;
  readonly name: string;
}
