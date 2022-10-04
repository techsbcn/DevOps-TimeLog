import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContextType } from '../../enums/ContextType';
//import { GetTokenTL, GetProjectObjectTL, GetOrganizationObjectTL } from '../../helpers/RequestHeaders';

interface CoreState {
  config: ConfigState;
  context: ContextType;
}
interface ConfigState {
  token?: string;
  project?: {
    value: string;
    label: string;
  };
  organization?: {
    value: string;
    label: string;
  };
}
const initialStateCore: CoreState = {
  config: {
    token: localStorage.getItem('TL_TOKEN') ? JSON.parse(localStorage.getItem('TL_TOKEN') || '') : null,
    project: localStorage.getItem('TL_PROJECT') ? JSON.parse(localStorage.getItem('TL_PROJECT') || '') : null,
    organization: localStorage.getItem('TL_ORG') ? JSON.parse(localStorage.getItem('TL_ORG') || '') : null,
  },
  context: ContextType.TEAMS,
};

export const coreSlice = createSlice({
  name: 'core',
  initialState: initialStateCore,
  reducers: {
    addAllCoreState: (
      state,
      action: PayloadAction<{
        contextType: ContextType;
        token: string;
        project: { value: string; label: string };
        organization: { value: string; label: string };
      }>
    ) => {
      state.config.token = action.payload.token;
      state.config.organization = action.payload.organization;
      state.config.project = action.payload.project;
      state.context = action.payload.contextType;
    },
    addOrganization: (
      state,
      action: PayloadAction<{ contextType: ContextType; organization: { value: string; label: string } }>
    ) => {
      state.config.organization = action.payload.organization;
      state.context = action.payload.contextType;
    },
    addProject: (
      state,
      action: PayloadAction<{ contextType: ContextType; project: { value: string; label: string } }>
    ) => {
      state.config.project = action.payload.project;
      state.context = action.payload.contextType;
    },
    addToken: (state, action: PayloadAction<{ contextType: ContextType; token: string }>) => {
      state.config.token = action.payload.token;
      state.context = action.payload.contextType;
    },
    addConext: (state, action: PayloadAction<ContextType>) => {
      state.context = action.payload;
    },
  },
});

export const { addOrganization, addProject, addToken, addConext, addAllCoreState } = coreSlice.actions;

export default coreSlice.reducer;
