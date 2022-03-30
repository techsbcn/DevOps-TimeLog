import React, { useEffect, useState } from 'react';
import { Box, Grid, Container} from '@mui/material';
import * as SDK from "azure-devops-extension-sdk";
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, TextFieldComponent, SelectAsyncField, ButtonComponent } from 'techsbcn-storybook';
import { showRootComponent } from "../../Common";
import { getAllTimeTypesMock } from '../../__mocks__/Documents/TimeTypes';
import { WorkItemFormService } from '../../Services/WorkItemService';
import { IWorkItemChangedArgs, IWorkItemFieldChangedArgs, IWorkItemLoadedArgs } from 'azure-devops-extension-api/WorkItemTracking/WorkItemTrackingServices';
import { TimeLogEntry } from '../../Interfaces/TimeLogEntry';
import { addEntry, getEntriesByWorkItemId } from '../../Services/TimelogEntriesAPI';

export const TimelogEntries: React.FC = () => {

    const [witEntries, setWitEntries] = useState<TimeLogEntry[]>([]);

    useEffect(() => {
        SDK.init().then(async () => {
          SDK.register(SDK.getContributionId(), () => {                
            return {
              // Called when the active work item is modified
              onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
              },
              // Called when a new work item is being loaded in the UI
              onLoaded: (args: IWorkItemLoadedArgs) => {
              },
      
              // Called when the active work item is being unloaded in the UI
              onUnloaded: (args: IWorkItemChangedArgs) => {
              },
      
              // Called after the work item has been saved
              onSaved: (args: IWorkItemChangedArgs) => {                  
              },
      
              // Called when the work item is reset to its unmodified state (undo)
              onReset: (args: IWorkItemChangedArgs) => {
              },
      
              // Called when the work item has been refreshed from the server
              onRefreshed: (args: IWorkItemChangedArgs) => {
              }
            };
          })

          const workItemFormService = await WorkItemFormService;
          const witId = await workItemFormService.getId()
          setWitEntries(await getEntriesByWorkItemId(witId))

        })

    }, [])
  
    const {
      handleSubmit,
      setValue,
      control,
      formState: { errors },
    } = useForm();


    const getHoursAndMinutes = (minutes: number)  => {
      var hours = (minutes / 60);
      var rhours = Math.floor(hours);
      var minutes = (hours - rhours) * 60;
      var rminutes = Math.round(minutes);
      return {hours: rhours, minutes: rminutes}
    }

    const getHoursFromMinutes = (minutes: number) => {
      return minutes / 60
    }

    const getMinutesFromHours = (hours: number) => {
      return hours * 60
    }

    const createNewEntry = async (data: any) : Promise<TimeLogEntry> => {
      const userName = SDK.getUser().displayName;
      const workItemFormService = await WorkItemFormService;
      const witId = await workItemFormService.getId()
      const timeEntry: TimeLogEntry =
        {
          user: userName,
          workItemId: witId,
          date: data.date,
          time: Number(getMinutesFromHours(data.timeHours)) + Number(data.timeMinutes),
          notes: data.notes,
          activity: data.activity.label
        }
      return timeEntry
    }

    const updateWitForm = async (entry: TimeLogEntry) : Promise<Boolean> => {
      const workItemFormService = await WorkItemFormService;
      const remainingWork =  Number(await workItemFormService.getFieldValue("Remaining Work"))
      const completedWork = Number(await workItemFormService.getFieldValue("Completed Work"))
      var hours = getHoursFromMinutes(entry.time)
      return await workItemFormService.setFieldValue("Remaining Work", remainingWork - hours) 
      && await workItemFormService.setFieldValue("Completed Work", completedWork + hours) 
    }

    const onSubmit = async (data: any) => {

      const workItemFormService = await WorkItemFormService;
      
      if(data.timeHours == 0 && data.timeMinutes == 0 ) return

      //Crear entry
      const newEntry = await createNewEntry(data)

      //Actualizar formulario
      const success = await updateWitForm(newEntry)

      //Guardar entrada
      /*if(success) {
        addEntry(newEntry).then(async () => {
          //Salvar formulario
          await workItemFormService.save()
        }).catch(async() => {
           //Si falla, reseteamos formulario
          await workItemFormService.reset()
        })*/
    };

    return (
      <Box>
          <Container maxWidth={false}>
            <MainWrapperComponent
              headerProps={{
                title: `New Time Log`                    
              }}
              >
              <Grid container spacing={3}>
                <Grid item md={2}>
                  <Controller
                    control={control}
                    defaultValue={new Date().toLocaleDateString('sv-SE')}
                    render={({ field: { onChange, value, name, ref } }) => (
                      <TextFieldComponent
                        label="Date"
                        placeholder="Date"
                        type="date"
                        error={!!errors.date}
                        helperText={errors.date?.message}
                        name={name}
                        inputRef={ref}
                        onChange={(e) => {
                          onChange(e);
                        }}
                        value={value}
                      />
                    )}
                    name={'date'}
                  />
                </Grid>
                <Grid item md={1}>
                  <Controller
                    control={control}
                    defaultValue={0}
                    render={({ field: { onChange, value, name, ref } }) => (
                      <TextFieldComponent
                        label="Hours"
                        placeholder="Hours"
                        type="number"
                        minNumber={0}
                        error={!!errors.timeHours}
                        helperText={errors.timeHours?.message}
                        name={name}
                        inputRef={ref}
                        onChange={(e) => {
                          onChange(e)
                          if (!e.target.value) setValue(name, 0);
                        }}
                        value={!value ? 0 : value}
                      />
                    )}
                    name={'timeHours'}
                  />
                </Grid>
                <Grid item md={1}>
                  <Controller
                    control={control}
                    defaultValue={0}
                    render={({ field: { onChange, value, name, ref } }) => (
                      <TextFieldComponent
                        label="Minutes"
                        placeholder="Minutes"
                        type="number"
                        minNumber={0}
                        step={15}
                        error={!!errors.timeMinutes}
                        helperText={errors.timeMinutes?.message}
                        name={name}
                        inputRef={ref}
                        onChange={(e) => {
                          onChange(e);
                          if (!e.target.value) setValue(name, 0);
                        }}
                        value={!value ? 0 : value}
                      />
                    )}
                    name={'timeMinutes'}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Controller
                    control={control}
                    render={({ field: { onChange, value, name, ref } }) => {
                      return (
                        <SelectAsyncField
                          label={"Activity"}
                          name={name}
                          inputRef={ref}
                          searchPromise={getAllTimeTypesMock}
                          onChangeOption={(value, label) => {
                            console.log("OnChangeOption", label)
                            onChange(value ? { value: value, label: label } : []);                            
                          }}
                          isClearable={false}
                          value={value ?? []}
                        />
                      );
                    }}
                    name={'activity'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    control={control}
                    defaultValue={""}
                    render={({ field: { onChange, value, name, ref } }) => (
                      <TextFieldComponent
                        label={"Notes"}
                        name={name}
                        inputRef={ref}
                        onChange={(e) => {
                          onChange(e);
                        }}
                        value={value}
                      />
                    )}
                    name={'notes'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ButtonComponent
                              label={"Add Time Log"}
                              startIcon={<FontAwesomeIcon icon={faFloppyDisk} />}
                              onClick={handleSubmit(onSubmit)}
                  />
                 </Grid>
              </Grid>
          </MainWrapperComponent>
        </Container>
      </Box>
        
    );
}

showRootComponent(<TimelogEntries />);