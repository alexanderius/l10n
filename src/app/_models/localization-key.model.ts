export interface LocalizationKey {
  id: string;
  humanKey: string;
  children?: LocalizationKey[];
}

export interface Translations {
  [key: string]: TranslationEntry | undefined;
}

export interface TranslationEntry {
  v: string;
  e: boolean;
}

export interface LocaleObject {
  [section: string]: {
    [key: string]: string;
  };
}
