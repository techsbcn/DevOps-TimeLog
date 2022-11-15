import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';
import { GLOBAL_EN, GLOBAL_ES } from './resources';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import localeData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/LocalizedFormat';

dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);

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

dayjs.locale(i18n.resolvedLanguage);
export default i18n;
