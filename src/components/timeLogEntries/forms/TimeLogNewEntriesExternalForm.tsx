import React, { useEffect, useState } from 'react';
import { Dropdown, Input, TextArea, Button, Header, Divider, Loader, Datepicker } from '@fluentui/react-northstar';
import {
  EditIcon,
  ShiftActivityIcon,
  OptionsIcon,
  CalendarAgendaIcon,
  SaveIcon,
} from '@fluentui/react-icons-northstar';
import { _VALUES } from '../../../resources/_constants/values';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TimeLogEntry, UserContext } from '../../../interfaces';
import { GetWorkItemNodeAPI, GetWorkItems, UpdateWorkItemNodeAPI } from '../../../redux/workItem/workItemAPI';
import bug from './../../../../static/bug.png';
import epic from './../../../../static/epic.png';
import feature from './../../../../static/feature.png';
import task from './../../../../static/task.png';
import product from './../../../../static/backlogitem.png';
import { WorkItemType } from '../../../enums/WorkItemType';
import { TextSimpleComponent } from 'techsbcn-storybook';
import { CreateDocumentNodeAPi, GetDocumentsAPI } from '../../../redux/extensionDataManager/extensionDataManagerAPI';
import * as VSSInterfaces from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { Box, Grid } from '@mui/material';
import { TimeLogSuccess } from '../../../Contributions/TimeLogSuccess/TimeLogSuccess';
import * as microsoftTeams from '@microsoft/teams-js';
import { getHoursAndMinutes, getHoursFromMinutes, getMinutesFromHours } from '../../../helpers/TimeHelper';
import { SelectAsyncHelper } from '../../../helpers/SelectHelper';

interface TimeLogNewEntriesExternalFormProps {
  user: UserContext;
}

const TimeLogNewEntriesExternalForm: React.FC<TimeLogNewEntriesExternalFormProps> = (props) => {
  const [workItems, setWorkItems] = useState<any[]>();
  const [workItemsLoading, setWorkItemsLoading] = React.useState(false);
  const [id, setId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [timeLogEntryState, setTimeLogEntry] = React.useState<TimeLogEntry>();
  const [error, setError] = React.useState('');

  const EntrySchema = yup.object().shape(
    {
      workItemId: yup.string().required(_VALUES.REQUIRED.REQUIRED_FIELD),
      date: yup.string().required(_VALUES.REQUIRED.REQUIRED_FIELD),
      timeHours: yup.number().when('timeMinutes', {
        is: 0,
        then: yup.number().positive().min(1, _VALUES.NOT_ZERO_TIME),
        otherwise: yup.number().min(0),
      }),
      timeMinutes: yup.number().when('timeHours', {
        is: 0,
        then: yup.number().positive().min(1, _VALUES.NOT_ZERO_TIME),
        otherwise: yup.number().min(0),
      }),
    },
    [['timeHours', 'timeMinutes']]
  );

  const {
    control,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(EntrySchema),
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    setWorkItemsLoading(true);
    GetWorkItems(id)
      .then((result) => {
        setError('');
        setWorkItems(result);
        setWorkItemsLoading(false);
      })
      .catch((error) => {
        setError(error.Message);
        setWorkItems([]);
        setWorkItemsLoading(false);
      });
  }, [id]);

  const [types, setTypes] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = React.useState<boolean>(false);
  useEffect(() => {
    setLoadingTypes(true);
    GetDocumentsAPI(process.env.ACTIVITIES_COLLECTION_NAME as string)
      .then((result: any[]) => {
        setTypes(SelectAsyncHelper(result));
        setLoadingTypes(false);
      })
      .catch(() => {
        setLoadingTypes(false);
      });
  }, []);

  const onSubmit = (data: any) => {
    setLoading(true);
    const timeEntry: TimeLogEntry = {
      user: props.user.displayName,
      userId: props.user.id,
      workItemId: Number(data.workItemId) ?? 0,
      workItemName:
        workItems && Number(data.workItemId)
          ? workItems.find((workitem) => workitem.id === Number(data.workItemId)).fields['System.Title']
          : '',
      date: new Date(data.date).toLocaleDateString('sv-SE'),
      time: Number(getMinutesFromHours(data.timeHours)) + Number(data.timeMinutes),
      notes: data.notes,
      type: data.type ? data.type : undefined,
    };
    const hours = getHoursFromMinutes(timeEntry.time);

    GetWorkItemNodeAPI(Number(data.workItemId), [
      'Microsoft.VSTS.Scheduling.CompletedWork',
      'Microsoft.VSTS.Scheduling.RemainingWork',
    ])
      .then((result) => {
        let completedWork = (result.fields && result.fields['Microsoft.VSTS.Scheduling.CompletedWork']) ?? 0;
        let remainingWork = (result.fields && result.fields['Microsoft.VSTS.Scheduling.RemainingWork']) ?? 0;
        completedWork += hours;
        remainingWork -= hours;
        if (remainingWork < 0) remainingWork = 0;
        const patch: VSSInterfaces.JsonPatchOperation[] = [
          {
            op: VSSInterfaces.Operation.Replace,
            path: '/fields/Microsoft.VSTS.Scheduling.CompletedWork',
            value: completedWork,
          },
          {
            op: VSSInterfaces.Operation.Replace,
            path: '/fields/Microsoft.VSTS.Scheduling.RemainingWork',
            value: remainingWork,
          },
        ];
        UpdateWorkItemNodeAPI(Number(data.workItemId), patch)
          .then(() => {
            CreateDocumentNodeAPi(process.env.ENTRIES_COLLECTION_NAME as string, timeEntry)
              .then(() => {
                setLoading(false);
                setTimeLogEntry(timeEntry);
                setSuccess(true);
              })
              .catch((error) => {
                setError(_VALUES.CREATE_DOCUMENT_FAILED);
                setLoading(false);
              });
          })
          .catch((error) => {
            setError(error.Message);
            setLoading(false);
          });
      })
      .catch((error) => {
        setError(error.Message);
        setLoading(false);
      });
  };

  const postMessage = () => {
    timeLogEntryState &&
      microsoftTeams.tasks.submitTask({
        user: timeLogEntryState.user,
        workItem: `${timeLogEntryState.workItemId} - ${timeLogEntryState.workItemName}`,
        time: getHoursAndMinutes(timeLogEntryState.time),
        type: timeLogEntryState.type,
        note: timeLogEntryState.notes,
      });
  };

  return success ? (
    <TimeLogSuccess actionButton={{ title: _VALUES.POST_MESSAGE, action: postMessage }} />
  ) : (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Header as="h3" styles={{ fontWeight: 'bold' }} content={_VALUES.NEW_TIMELOG_ENTRY} />
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" alignItems="center">
          <Box mr={1}>
            <EditIcon />
          </Box>
          <Controller
            control={control}
            render={({ field: { onChange, value, name, ref } }) => (
              <TextSimpleComponent
                helperText={
                  errors.workItemId?.message ?? (workItems && workItems.length === 0 && _VALUES.UNABLE_WORKITEMS)
                }
                error={!!errors.workItemId}
                value={
                  <Dropdown
                    fluid
                    loading={workItemsLoading}
                    itemToString={(item) => {
                      return item && item['id'] ? JSON.stringify(item['id']) : '';
                    }}
                    error={!!errors.workItemId}
                    value={value}
                    ref={ref}
                    onChange={(e, data) => {
                      const val = data.value
                        ? data.value['id']
                          ? data.value['id'].toString()
                          : data.value
                          ? data.value.toString()
                          : ''
                        : '';
                      onChange(val);
                      setValue('workItemId', val);
                      trigger('workItemId');
                    }}
                    renderItem={(Component: React.ElementType, props: any): React.ReactNode => {
                      let image = '';
                      switch (props.fields['System.WorkItemType']) {
                        case WorkItemType.bug:
                          image = bug;
                          break;
                        case WorkItemType.epic:
                          image = epic;
                          break;
                        case WorkItemType.feature:
                          image = feature;
                          break;
                        case WorkItemType.product:
                          image = product;
                          break;
                        case WorkItemType.task:
                          image = task;
                          break;
                      }
                      const assignedTo = props.fields['System.AssignedTo']
                        ? props.fields['System.AssignedTo'].displayName
                        : 'Undefined';
                      return (
                        <Component
                          active={props.active}
                          selected={props.selected}
                          accessibilityItemProps={props.accessibilityItemProps}
                          className="cursor-pointer"
                          key={props.id}
                          image={image}
                          header={`${props.id} | ${props.fields['System.Title']}`}
                          content={assignedTo}
                        />
                      );
                    }}
                    search={(filteredItemsByValue: any[], searchQuery: string) => {
                      const search = searchQuery ? searchQuery.toString() : '';
                      const result =
                        filteredItemsByValue && filteredItemsByValue.filter((item) => String(item.id).includes(search));
                      if ((!result && workItems) || (result && result.length === 0 && workItems)) {
                        setId(search);
                      } else {
                        if (id !== search) {
                          setId('');
                        }
                      }
                      return result;
                    }}
                    items={workItems && workItems.length > 0 ? workItems : []}
                    placeholder={_VALUES.CHOOSE_WORKITEM}
                    noResultsMessage={_VALUES.NO_RESULTS_MESSAGE}
                  />
                }
              />
            )}
            name={'workItemId'}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center">
              <Box mr={1}>
                <ShiftActivityIcon />
              </Box>
              <Controller
                control={control}
                defaultValue={new Date()}
                render={({ field: { onChange, value, ref } }) => {
                  return (
                    <Datepicker
                      input={{
                        error: !!errors.date,
                        value: new Date(value).toLocaleDateString(),
                      }}
                      ref={ref}
                      onDateChange={(e, data) => {
                        onChange(e);
                        setValue('date', data && data?.value ? data.value.toLocaleDateString('sv-SE') : '');
                      }}
                    />
                  );
                }}
                name={'date'}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box ml={3} sx={{ display: { xs: 'block', md: 'none' } }}>
              <Grid container flexDirection="column">
                <Grid item xs={3}>
                  {_VALUES.HOURS}
                </Grid>
                <Grid item xs={9}>
                  <Controller
                    control={control}
                    defaultValue={'0'}
                    render={({ field: { onChange, value, name, ref } }) => {
                      if (value === '') setValue(name, '0');
                      return (
                        <Input
                          placeholder={_VALUES.HOURS}
                          name={name}
                          value={value === '' ? '0' : value}
                          ref={ref}
                          error={!!errors.timeHours}
                          type="number"
                          min={0}
                          onChange={(e, data) => {
                            onChange(e);
                            if (!data || (data && data.value === '')) setValue(name, '0');
                            trigger('timeMinutes');
                            trigger('timeHours');
                          }}
                        />
                      );
                    }}
                    name={'timeHours'}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Box mr={1}>{_VALUES.HOURS}</Box>
              <Controller
                control={control}
                defaultValue={'0'}
                render={({ field: { onChange, value, name, ref } }) => {
                  if (value === '') setValue(name, '0');
                  return (
                    <Input
                      placeholder={_VALUES.HOURS}
                      name={name}
                      value={value === '' ? '0' : value}
                      ref={ref}
                      error={!!errors.timeHours}
                      type="number"
                      min={0}
                      onChange={(e, data) => {
                        onChange(e);
                        if (!data || (data && data.value === '')) setValue(name, '0');
                        trigger('timeMinutes');
                        trigger('timeHours');
                      }}
                    />
                  );
                }}
                name={'timeHours'}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box ml={3} sx={{ display: { xs: 'block', md: 'none' } }}>
              <Grid container flexDirection="column">
                <Grid item xs={3}>
                  {_VALUES.MINUTES}
                </Grid>
                <Grid item xs={9}>
                  <Controller
                    control={control}
                    defaultValue={'0'}
                    render={({ field: { onChange, value, name, ref } }) => {
                      if (value === '') setValue(name, '0');
                      return (
                        <Input
                          placeholder={_VALUES.MINUTES}
                          name={name}
                          value={value === '' ? '0' : value}
                          ref={ref}
                          error={!!errors.timeMinutes}
                          type="number"
                          min={0}
                          step={15}
                          onChange={(e, data) => {
                            onChange(e);
                            if (!data || (data && data.value === '')) setValue(name, '0');
                            trigger('timeHours');
                            trigger('timeMinutes');
                          }}
                        />
                      );
                    }}
                    name={'timeMinutes'}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Box mr={1}>{_VALUES.MINUTES}</Box>
              <Controller
                control={control}
                defaultValue={'0'}
                render={({ field: { onChange, value, name, ref } }) => {
                  if (value === '') setValue(name, '0');
                  return (
                    <Input
                      placeholder={_VALUES.MINUTES}
                      name={name}
                      value={value === '' ? '0' : value}
                      ref={ref}
                      error={!!errors.timeMinutes}
                      type="number"
                      min={0}
                      step={15}
                      onChange={(e, data) => {
                        onChange(e);
                        if (!data || (data && data.value === '')) setValue(name, '0');
                        trigger('timeHours');
                        trigger('timeMinutes');
                      }}
                    />
                  );
                }}
                name={'timeMinutes'}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
      {types && types?.length > 0 && !loadingTypes ? (
        <Grid item xs={12}>
          <Box display="flex" alignItems="center">
            <Box mr={1}>
              <OptionsIcon />
            </Box>
            <Controller
              control={control}
              defaultValue={types[0].label}
              render={({ field: { onChange, value, ref } }) => {
                return (
                  <Dropdown
                    fluid
                    loading={loadingTypes}
                    itemToString={(item) => {
                      return item ? (item['label'] ? item['label'] : item.toString()) : '';
                    }}
                    value={value}
                    ref={ref}
                    onChange={(e, data) => {
                      const val = data.value
                        ? data.value['label']
                          ? data.value['label'].toString()
                          : data.value
                          ? data.value.toString()
                          : ''
                        : '';
                      onChange(val);
                      setValue('type', val);
                    }}
                    renderItem={(Component: React.ElementType, props: any): React.ReactNode => {
                      return (
                        <Component
                          active={props.active}
                          selected={props.selected}
                          accessibilityItemProps={props.accessibilityItemProps}
                          className="cursor-pointer"
                          key={props.value}
                          header={`${props.label}`}
                        />
                      );
                    }}
                    items={types && types?.length > 0 ? types : []}
                    placeholder={_VALUES.CHOOSE_ACTIVITY}
                    noResultsMessage={_VALUES.NO_RESULTS_MESSAGE}
                  />
                );
              }}
              name={'type'}
            />
          </Box>
        </Grid>
      ) : (
        loadingTypes && <Loader />
      )}
      <Grid item xs={12}>
        <Box display="flex" alignItems="center">
          <Box mr={1}>
            <CalendarAgendaIcon />
          </Box>
          <Controller
            control={control}
            defaultValue={''}
            render={({ field: { onChange, value, name, ref } }) => (
              <TextArea
                fluid
                name={name}
                ref={ref}
                onChange={(e) => {
                  onChange(e);
                }}
                value={value}
              />
            )}
            name={'notes'}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Divider />
        <Box mt={2} display="flex" alignItems="center">
          <Button
            icon={<SaveIcon size="large" />}
            primary={!loading}
            secondary={loading}
            loading={loading}
            disabled={loading}
            content={_VALUES.ADD_TIMELOG}
            onClick={handleSubmit(onSubmit)}
          />
          {error && (
            <Box ml={2} color="red">
              {error}
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default TimeLogNewEntriesExternalForm;
