export function mapRange(
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number,
): number {
  const ratio = (value - fromLow) / (fromHigh - fromLow)
  return toLow + ratio * (toHigh - toLow)
}
