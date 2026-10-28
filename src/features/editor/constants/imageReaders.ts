import type { ImageDimensionReader } from '../types/images';
import { pngDimensions } from '../utils/pngDimensions.ts';
import { jpegDimensions } from '../utils/jpegDimensions.ts';
import { webpDimensions } from '../utils/webpDimensions.ts';

export const IMAGE_DIMENSION_READERS: ReadonlyMap<
  string,
  ImageDimensionReader
> = new Map([
  ['image/png', pngDimensions],
  ['image/jpeg', jpegDimensions],
  ['image/webp', webpDimensions],
]);
