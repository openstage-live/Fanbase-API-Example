import { createI18n, type NamedValue } from 'vue-i18n';

// Import translations
import en from './en.json';

type PathToLeaves<T, Cache extends string = ''> = T extends PropertyKey
  ? Cache
  : {
      [P in keyof T]: P extends string
        ? Cache extends ''
          ? PathToLeaves<T[P], `${P}`>
          : PathToLeaves<T[P], `${Cache}.${P}`>
        : never;
    }[keyof T];

type MessageSchema = typeof en;
type MessageLeaves = PathToLeaves<MessageSchema>;

const i18n = createI18n<[MessageSchema], 'en'>({
  legacy: false, // Set to false to use Composition API
  locale: 'en', // Set default locale
  fallbackLocale: 'en', // Set fallback locale
  messages: {
    en,
  },
});

export const useTranslation = () => {
  const { t } = i18n.global;

  return {
    t: (path: MessageLeaves, named?: NamedValue) => (named ? t(path, named) : t(path)),
  } as const;
};

export default i18n;
