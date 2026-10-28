import type { ImageSize } from '../../../core/types/images';

export type ImageDimensionReader = (
  header: ImageHeader,
) => ImageSize | undefined;

export interface ImageResource {
  bitmap: ImageBitmap;
  url: string;
  bytes: number;
}

export interface ImageHeader {
  bytes: Uint8Array;
  view: DataView;
}

export interface JpegSegment {
  marker: number;
  length: number;
  dataOffset: number;
  nextOffset: number;
}

export interface WebpChunk {
  type: number;
  length: number;
  dataOffset: number;
  nextOffset: number;
}

export type ScreenshotReadResult =
  { success: true; id: string } | { success: false; error: string };

export interface ScreenshotBatch {
  ids: string[];
  errors: string[];
}
