import { GetPublicAlias } from '../redux/profile/profileAPI';

export const BasicHeader = () => {
  return { 'Content-Type': 'application/json' };
};

export const AuthHeader = (token?: string) => {
  const tokenTL = token
    ? JSON.parse(JSON.stringify(token))
    : localStorage.getItem('TL_TOKEN')
    ? JSON.parse(localStorage.getItem('TL_TOKEN') || '')
    : null;
  if (tokenTL) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenTL}`,
      'Access-Control-Allow-Origin': '*',
    };
  } else {
    return BasicHeader();
  }
};

export const GetTokenTL = () => {
  const tokenTL = localStorage.getItem('TL_TOKEN') ? JSON.parse(localStorage.getItem('TL_TOKEN') || '') : null;
  return tokenTL;
};

export const GetProjectObjectTL = () => {
  const projectTL = localStorage.getItem('TL_PROJECT') ? JSON.parse(localStorage.getItem('TL_PROJECT') || '') : null;
  return projectTL;
};

export const GetProjectTL = () => {
  const projectTL = localStorage.getItem('TL_PROJECT') ? JSON.parse(localStorage.getItem('TL_PROJECT') || '') : null;
  return projectTL && projectTL.value ? projectTL.value : projectTL;
};

export const GetOrganizationObjectTL = () => {
  const orgTL = localStorage.getItem('TL_ORG') ? JSON.parse(localStorage.getItem('TL_ORG') || '') : null;
  return orgTL;
};

export const GetOrganizationTL = () => {
  const orgTL = localStorage.getItem('TL_ORG') ? JSON.parse(localStorage.getItem('TL_ORG') || '') : null;
  return orgTL && orgTL.label ? orgTL.label : orgTL;
};

export const GetValidationTOKEN = () => {
  if (!GetTokenTL) return Promise.reject(false);
  return GetPublicAlias()
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
};
