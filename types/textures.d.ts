declare module 'textures' {
  import type { Selection } from 'd3';

  interface Texture {
    (selection: Selection<any, any, any, any>): void;
    id(id?: string): Texture;
    url(): string;
    lighter(): Texture;
    darker(): Texture;
    thicker(): Texture;
    thinner(size?: number): Texture;
    heavier(width?: number): Texture;
    stroke(color: string): Texture;
    background(color: string): Texture;
    size(size: number): Texture;
    orientation(...args: string[]): Texture;
    shapeRendering(value: string): Texture;
  }

  interface TextureFactory {
    lines(): Texture;
    circles(): Texture;
    paths(): Texture;
  }

  const textures: TextureFactory;
  export default textures;
}
