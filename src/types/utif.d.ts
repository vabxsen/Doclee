declare module 'utif' {
  export interface UtifIfd {
    width: number
    height: number
    [key: string]: unknown
  }

  export function decode(buffer: ArrayBuffer): UtifIfd[]
  export function decodeImage(buffer: ArrayBuffer, ifd: UtifIfd, ifds?: UtifIfd[]): void
  export function toRGBA8(ifd: UtifIfd): Uint8Array
}
