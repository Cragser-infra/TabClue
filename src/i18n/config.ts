import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enSidebar from './locales/en/sidebar.json';
import enDialogs from './locales/en/dialogs.json';

import esCommon from './locales/es/common.json';
import esDashboard from './locales/es/dashboard.json';
import esSidebar from './locales/es/sidebar.json';
import esDialogs from './locales/es/dialogs.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    sidebar: enSidebar,
    dialogs: enDialogs,
  },
  es: {
    common: esCommon,
    dashboard: esDashboard,
    sidebar: esSidebar,
    dialogs: esDialogs,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'tabclue-language',
    },
  });

export default i18n;
