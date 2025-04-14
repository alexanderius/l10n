export interface LocalizationKey {
  id: string;
  humanKey?: string;
  children?: LocalizationKey[];
}
