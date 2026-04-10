export interface VocabItem {
  english: string;
  phonetic: string;
  partOfSpeech: string;
  chinese: string;
  example: string;
  boundingBox: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

export interface AnalysisResult {
  items: VocabItem[];
  literaryDescription: {
    english: string;
    chinese: string;
  };
  title: string;
}
