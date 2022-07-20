import { IdentityRef } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';

export interface Member extends IdentityRef {
  isTeamAdmin?: boolean;
}
