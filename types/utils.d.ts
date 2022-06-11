export function hash(input: string): string;
export function uuid(): string;
export function computeFontSize(options: ComputeSizeOptions): ComputeSizeResult;
export type ComputeSizeOptions = {
  text: string;
  font: string;
  fontSize: string;
  lineHeight?: string;
};
export type ComputeSizeResult = {
  width: number;
  height: number;
};
