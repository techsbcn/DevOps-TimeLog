import Translate from '../i18n';
//import { addNotification } from '../helpers';

export const ResponseHandler = (response: any) => {
  return response.text().then((text: any) => {
    const data = text && JSON.parse(text);

    if (!response.ok) return Promise.reject(data);

    return data;
  });
};

export const ResponseBlobHandler = (response: any) => {
  return response.blob().then((blob: any) => {
    if (!response.ok) return Promise.reject(JSON.parse(response));

    return { blob: blob, contentDisposition: response.headers.get('content-disposition') };
  });
};

export const ErrorHandler = (error: any) => {
  console.log(error);
  /*if (error.Id) {
    const translate = Translate.t(`${error.Id}`);
    const message = translate.trim() !== '' ? translate : Translate.t('InternalServerErrorException');
    addNotification(message, 'danger', error.Id);
    /*if (error.Code === 401 || error.Code === 403) {
    }
    return Object({ Code: error.Code, Exception: error.Id, Message: message });
  }*/

  //addNotification(Translate.t('FailedToFetchException'), 'danger', 'FailedToFetchException');
  return Object({ Code: 500, Exception: 'FailedToFetchException', Message: Translate.t('FailedToFetchException') });
};
