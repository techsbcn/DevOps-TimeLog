import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';
import { GLOBAL_EN, GLOBAL_ES } from './resources';

const resources = {
  es: {
    translation: GLOBAL_ES,
  },
  en: {
    translation: GLOBAL_EN,
  },
};

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources,
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
