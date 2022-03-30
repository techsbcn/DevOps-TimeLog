import React, { useEffect } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemLoadedArgs,
} from 'azure-devops-extension-api/WorkItemTracking';
import { showRootComponent } from '../..';

export const TimelogEntries: React.FC = () => {
  useEffect(() => {
    SDK.init().then(() => {
      SDK.register(SDK.getContributionId(), () => {
        return {
          // Called when the active work item is modified
          onFieldChanged: (args: IWorkItemFieldChangedArgs) => {},
          // Called when a new work item is being loaded in the UI
          onLoaded: (args: IWorkItemLoadedArgs) => {},

          // Called when the active work item is being unloaded in the UI
          onUnloaded: (args: IWorkItemChangedArgs) => {},

          // Called after the work item has been saved
          onSaved: (args: IWorkItemChangedArgs) => {},

          // Called when the work item is reset to its unmodified state (undo)
          onReset: (args: IWorkItemChangedArgs) => {},

          // Called when the work item has been refreshed from the server
          onRefreshed: (args: IWorkItemChangedArgs) => {},
        };
      });
    });
  }, []);

  return <div>TimelogEntries</div>;
};

showRootComponent(<TimelogEntries />);
