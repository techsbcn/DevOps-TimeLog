import { AuthHeader } from '../../helpers/RequestHeaders';
import { ErrorHandler, ResponseHandler } from '../../helpers/ResponseHandler';

export const GetPublicAlias = async (accessToken?: string) => {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: AuthHeader(accessToken),
  };

  return new Promise<any>((resolve, reject) =>
    fetch('https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=6.0', requestOptions)
      .then(ResponseHandler)
      .then((result: any) => {
        resolve(result);
      })
      .catch((error) => {
        reject(ErrorHandler(error));
      })
  );
};
