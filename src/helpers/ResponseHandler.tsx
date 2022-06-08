import Translate from '../i18n';
//import { addNotification } from '../helpers';

export const ResponseHandler = (response: any) => {
  if (response.status === 203)
    return Promise.reject(ErrorHandler({ Id: 'NotAuthorizedException', Code: response.status }));
  else {
    return response.text().then((text: any) => {
      const data = text && JSON.parse(text);
      if (!response.ok || response.status === 203) return Promise.reject(data);

      return data;
    });
  }
};

export const ResponseBlobHandler = (response: any) => {
  return response.blob().then((blob: any) => {
    if (!response.ok) return Promise.reject(JSON.parse(response));

    return { blob: blob, contentDisposition: response.headers.get('content-disposition') };
  });
};

export const ErrorHandler = (error: any) => {
  console.log(error);
  if (error.Id) {
    const translate = Translate.t(`${error.Id}`);
    const message = translate.trim() !== '' ? translate : Translate.t('InternalServerErrorException');
    //Here you can create a custom notification based on the handler error appeared to inform the user
    //addNotification(message, 'danger', error.Id);
    /*if (error.Code === 401 || error.Code === 403) {
    }*/
    return Object({ Code: error.Code, Exception: error.Id, Message: message });
  }
  //Here you can create a generic notification based on an unhandled or generic error appeared to inform the user
  //addNotification(Translate.t('FailedToFetchException'), 'danger', 'FailedToFetchException');
  return Object({ Exception: 'FailedToFetchException', Message: Translate.t('FailedToFetchException') });
};
