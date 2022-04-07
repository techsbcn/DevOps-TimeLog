import { IdentityRef } from 'azure-devops-extension-api/WebApi';

export interface Member extends IdentityRef {
  isTeamAdmin: boolean;
}
