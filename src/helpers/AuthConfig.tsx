import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: 'e584e52a-fbc8-4c5a-80d2-cfdbf9d113c4',
    authority: 'https://login.microsoftonline.com/dfec1a27-28c7-48cc-925e-3015e63bc642',
    redirectUri: 'https://localhost:3000/dist/blank-auth-end.html', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.href
    postLogoutRedirectUri: 'https://localhost:3000/blank-auth-end.html', // Simply remove this line if you would like navigate to index page after logout.
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO btw tabs.
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
    allowRedirectInIframe: true,
  },
};
const apiConfig = {
  scopes: ['499b84ac-1321-427f-aa17-267ca6975798/.default'],
};

export const loginRequest = {
  scopes: ['User.Read'],
};

export const tokenRequest = {
  scopes: apiConfig.scopes,
  forceRefresh: false,
};
