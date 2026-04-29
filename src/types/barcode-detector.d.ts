interface DetectedBarcode {
  boundingBox?: DOMRectReadOnly;
  cornerPoints?: ReadonlyArray<{ x: number; y: number }>;
  format: string;
  rawValue: string;
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

interface BarcodeDetectorConstructor {
  new (options?: BarcodeDetectorOptions): BarcodeDetector;
  getSupportedFormats?: () => Promise<string[]>;
}

interface BarcodeDetector {
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export {};
