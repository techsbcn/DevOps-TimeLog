import React, { useEffect, useState } from 'react';
import { Box, Grid, Container } from '@mui/material';
import * as SDK from 'azure-devops-extension-sdk';
import { showRootComponent } from '../..';
// eslint-disable-next-line jest/no-mocks-import
import { getAllTimeTypesMock } from '../../__mocks__/Documents/TimeTypes';
import { WorkItemFormService } from '../../Services/WorkItemService';
import {
  IWorkItemChangedArgs,
  IWorkItemFieldChangedArgs,
  IWorkItemLoadedArgs,
} from 'azure-devops-extension-api/WorkItemTracking/WorkItemTrackingServices';
import { TimeLogEntry } from '../../Interfaces/TimeLogEntry';
//import { addEntry } from '../../Services/TimelogEntriesAPI';
import TimelogEntriesForm from '../../components/compTimelogEntries/forms/TimelogEntriesForm';
import TimelogEntriesTable from '../../components/compTimelogEntries/tables/TimelogEntriesTable';
import { useFetchCreateDocumentMutation } from '../../redux/extensionDataManager/extensionDataManagerSlice';
import { _VALUES } from '../../resources';

export const TimelogEntries: React.FC = () => {
  const [witId, setWitId] = useState<number>(0);

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
      const witId = await workItemFormService.getId();
      setWitId(witId);
    });
  }, []);

  const getHoursFromMinutes = (minutes: number) => {
    return minutes / 60;
  };

  const getMinutesFromHours = (hours: number) => {
    return hours * 60;
  };

  const createNewEntry = async (data: any): Promise<TimeLogEntry> => {
    const userName = SDK.getUser().displayName;
    const workItemFormService = await WorkItemFormService;
    const witId = await workItemFormService.getId();
    const timeEntry: TimeLogEntry = {
      user: userName,
      workItemId: witId,
      date: data.date,
      time: Number(getMinutesFromHours(data.timeHours)) + Number(data.timeMinutes),
      notes: data.notes,
      activity: data.activity.label,
    };
    return timeEntry;
  };

  const updateWitForm = async (entry: TimeLogEntry): Promise<boolean> => {
    const workItemFormService = await WorkItemFormService;
    const remainingWork = Number(await workItemFormService.getFieldValue('Remaining Work'));
    const completedWork = Number(await workItemFormService.getFieldValue('Completed Work'));
    const hours = getHoursFromMinutes(entry.time);
    return (
      (await workItemFormService.setFieldValue('Remaining Work', remainingWork - hours)) &&
      (await workItemFormService.setFieldValue('Completed Work', completedWork + hours))
    );
  };

  const [create, { isLoading: isCreating }] = useFetchCreateDocumentMutation();

  const onSubmit = async (data: any) => {
    const workItemFormService = await WorkItemFormService;

    if (data.timeHours == 0 && data.timeMinutes == 0) return;

    //Crear entry
    const newEntry = await createNewEntry(data);

    //Actualizar formulario
    const success = await updateWitForm(newEntry);

    //Guardar entrada
    if (success) {
      create({ collectionName: 'TimeLogData', doc: newEntry })
        .then(async () => {
          //Salvar formulario
          await workItemFormService.save();
        })
        .catch(async () => {
          //Si falla, reseteamos formulario
          await workItemFormService.reset();
        });
    }
  };

  return (
    <Box>
      <Container maxWidth={false}>
        <TimelogEntriesForm action={onSubmit} loading={isCreating} />
        <TimelogEntriesTable witId={witId} />
      </Container>
    </Box>
  );
};

showRootComponent(<TimelogEntries />);
