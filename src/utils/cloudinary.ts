interface CloudinaryImageOptions {
  width?: number;
  quality?: 'auto' | number;
  format?: 'auto' | string;
}

const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';

export function getOptimizedCloudinaryUrl(
  src: string,
  { width, quality = 'auto', format = 'auto' }: CloudinaryImageOptions = {}
): string {
  if (!src.includes('res.cloudinary.com') || !src.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return src;
  }

  const transformations = [`f_${format}`, `q_${quality}`];

  if (width) {
    transformations.push(`w_${width}`);
  }

  return src.replace(
    CLOUDINARY_UPLOAD_SEGMENT,
    `${CLOUDINARY_UPLOAD_SEGMENT}${transformations.join(',')}/`
  );
}

export function getCloudinarySrcSet(src: string, widths: number[]): string {
  return widths.map(width => `${getOptimizedCloudinaryUrl(src, { width })} ${width}w`).join(', ');
}
