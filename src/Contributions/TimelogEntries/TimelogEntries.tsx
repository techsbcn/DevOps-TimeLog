import React, { useEffect, useState } from 'react';
import { Grid, Container } from '@mui/material';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemLoadedArgs,
} from 'azure-devops-extension-api/WorkItemTracking/WorkItemTrackingServices';
import { TimeLogEntry } from '../../Interfaces/extensionDataManager/TimeLogEntry';
import TimelogEntriesForm from '../../components/timeLogEntries/forms/TimelogEntriesForm';
import TimelogEntriesTable from '../../components/timeLogEntries/tables/TimelogEntriesTable';
import { useFetchCreateDocumentMutation } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { _VALUES } from '../../resources';
import { getHoursFromMinutes, getMinutesFromHours } from '../../helpers/TimeHelper';
import { PatchWorkItem, WorkItemFormService } from '../../redux/workItem/workItemAPI';

export const TimelogEntries: React.FC = () => {
  const [workItemId, setWorkItemId] = useState<number>();
  const [workItemName, setWorkItemName] = useState<string>();

  useEffect(() => {
    SDK.init().then(async () => {
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

      const workItemFormService = await WorkItemFormService;
      const workItemId = await workItemFormService.getId();
      setWorkItemId(workItemId);
      const workItemName = await workItemFormService.getFieldValue('System.Title', { returnOriginalValue: false });
      setWorkItemName(String(workItemName));
    });
  }, []);

  const createNewEntry = async (data: any): Promise<TimeLogEntry> => {
    const user = SDK.getUser();
    const timeEntry: TimeLogEntry = {
      user: user.displayName,
      userId: user.id,
      workItemId: workItemId ?? 0,
      workItemName: workItemName ?? '',
      date: data.date,
      time: Number(getMinutesFromHours(data.timeHours)) + Number(data.timeMinutes),
      notes: data.notes,
      type: data.type ? data.type.name : undefined,
    };
    return timeEntry;
  };

  const [create, { isLoading: isCreating }] = useFetchCreateDocumentMutation();

  const onSubmit = async (data: any) => {
    const workItemFormService = await WorkItemFormService;
    const newEntry = await createNewEntry(data);
    const hours = getHoursFromMinutes(newEntry.time);

    PatchWorkItem(['Completed Work', 'Remaining Work'], (item: any) => {
      item['Completed Work'] += hours;
      item['Remaining Work'] -= hours;
      if (item['Remaining Work'] < 0) item['Remaining Work'] = 0;
      return item;
    }).then(() => {
      create({ collectionName: process.env.ENTRIES_COLLECTION_NAME as string, doc: newEntry })
        .then(async () => {
          await workItemFormService.save();
        })
        .catch(async () => {
          await workItemFormService.reset();
        });
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TimelogEntriesForm action={onSubmit} loading={isCreating} />
      </Grid>
      <Grid item xs={12}>
        {workItemId && <TimelogEntriesTable workItemId={workItemId} />}
      </Grid>
    </Grid>
  );
};

showRootComponent(<TimelogEntries />);
