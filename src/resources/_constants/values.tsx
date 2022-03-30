import Translate from '../../i18n';
import { ObjectKey } from '../../interfaces';

export const _VALUES: ObjectKey = {
  ADD: Translate.t('add'),
  SEARCH: Translate.t('search'),
  CANCEL: Translate.t('cancel'),
  LIST: Translate.t('list'),
  DELETE: Translate.t('delete'),
  TABLE_LABEL_DISPLAY: (form: any, to: any, count: any) => Translate.t('tableLabelDisplay', [form, to, count]),
  ID: Translate.t('id'),
  NAME: Translate.t('name'),
  REMOVE: Translate.t('remove'),
  CONFIRM: Translate.t('Confirmar'),
  NO_RESULTS_FOUND: Translate.t('noResultsFound'),
  RESULTS: Translate.t('results'),
  SHOWING: Translate.t('showing'),
  STATUS: Translate.t('status'),
  ACTIONS: Translate.t('actions'),
  DATE: Translate.t('date'),
  YES: Translate.t('yes'),
  NO: Translate.t('no'),
  ACCEPT: Translate.t('accept'),
  REQUIRED: {
    REQUIRED_FIELD: Translate.t('requiredField'),
  },
  BASIC_INFO: Translate.t('basicInfo'),
  TYPE: Translate.t('type'),
  DOWNLOAD_PDF: Translate.t('downloadPdf'),
  DOWNLOADING: Translate.t('downloading'),
  DESCRIPTION: Translate.t('description'),
  USER: Translate.t('user'),
  TO: Translate.t('to'),
  FROM: Translate.t('from'),
  TYPES: Translate.t('types'),
  NEW: Translate.t('new'),
  STATUSES: Translate.t('statuses'),
  NONE: Translate.t('none'),
  CREATE_ARTICLE: Translate.t('createArticle'),
  SAVE: Translate.t('save'),
  NEW_MALE: Translate.t('newMale'),
  NUMBER: Translate.t('number'),
  DOWNLOAD: Translate.t('download'),
  SUMMARY: Translate.t('summary'),
  TOTAL: Translate.t('total'),
  USERS: Translate.t('users'),
  DOWNLOAD_CSV: Translate.t('downloadCSV'),
  REMOVE_TEXT_INFO: (text: any) => Translate.t('removeTextInfo', [text]),
  REMOVE_TITLE: (text: any) => Translate.t('removeTitle', [text]),
  CREATE_TITLE: (text: any) => Translate.t('createTitle', [text]),
  TIME: Translate.t('time'),
  ACTIVITY: Translate.t('activity'),
  NOTES: Translate.t('notes'),
  TIMELOG_ENTRIES: Translate.t('timelogEntries'),
};
