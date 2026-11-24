import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export interface AvatarImage {
  uri: string;
  width: number;
  height: number;
}

/** Photos larger than this are downscaled before cropping so pinch/pan stays smooth. */
const MAX_SOURCE_EDGE = 2048;
/** Final avatar edge length in px (sharp on 3x screens, small to upload). */
export const AVATAR_OUTPUT_EDGE = 640;

/**
 * Re-encodes a freshly picked photo: bakes in EXIF orientation (so width/height
 * match what is displayed) and caps the longest edge.
 */
export async function prepareSourceImage(asset: AvatarImage): Promise<AvatarImage> {
  const ctx = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_SOURCE_EDGE) {
    ctx.resize(
      asset.width >= asset.height
        ? { width: MAX_SOURCE_EDGE }
        : { height: MAX_SOURCE_EDGE }
    );
  }
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });
  return { uri: out.uri, width: out.width, height: out.height };
}

export async function rotateImage(src: AvatarImage, degrees = 90): Promise<AvatarImage> {
  const ref = await ImageManipulator.manipulate(src.uri).rotate(degrees).renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });
  return { uri: out.uri, width: out.width, height: out.height };
}

export interface SquareCrop {
  originX: number;
  originY: number;
  size: number;
}

/** Crops a square region (image pixels) and scales it down to the avatar size. */
export async function cropSquare(src: AvatarImage, rect: SquareCrop): Promise<AvatarImage> {
  const size = Math.max(1, Math.min(Math.floor(rect.size), src.width, src.height));
  const originX = Math.min(Math.max(Math.round(rect.originX), 0), src.width - size);
  const originY = Math.min(Math.max(Math.round(rect.originY), 0), src.height - size);

  const ctx = ImageManipulator.manipulate(src.uri).crop({
    originX,
    originY,
    width: size,
    height: size,
  });
  if (size > AVATAR_OUTPUT_EDGE) {
    ctx.resize({ width: AVATAR_OUTPUT_EDGE });
  }
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
  return { uri: out.uri, width: out.width, height: out.height };
}
