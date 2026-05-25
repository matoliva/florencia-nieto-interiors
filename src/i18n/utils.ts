import en from './en';
import es from './es';

const translations = { en, es } as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof en;

export function useTranslations(locale: string | undefined) {
  const lang: Locale = (locale as Locale) in translations ? (locale as Locale) : 'en';
  return (key: TranslationKey): string => translations[lang][key];
}
