import { getImage } from 'astro:assets';
import textureImg from '../assets/images/texture.jpg';

export async function getTextureImage(width: number) {
  return getImage({ src: textureImg, format: 'webp', width });
}

export function textureStyle(src: string, position = 'top center') {
  return `background-color: #F8F4ED; background-image: url('${src}'); background-blend-mode: multiply; background-repeat: no-repeat; background-size: cover; background-position: ${position};`;
}
