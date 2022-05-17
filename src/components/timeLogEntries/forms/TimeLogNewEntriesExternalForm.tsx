import React, { useEffect, useState } from 'react';
import { Flex, Dropdown, Input, TextArea, Button, Header, Divider, Loader } from '@fluentui/react-northstar';
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
import { getHoursAndMinutes, getHoursFromMinutes, getMinutesFromHours, SelectAsyncHelper } from '../../../helpers';
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
import { Box } from '@mui/material';

interface TimeLogNewEntriesExternalFormProps {
  user: UserContext;
}

const TimeLogNewEntriesExternalForm: React.FC<TimeLogNewEntriesExternalFormProps> = (props) => {
  const [workItems, setWorkItems] = useState<any[]>();
  const [workItemsLoading, setWorkItemsLoading] = React.useState(false);
  const [id, setId] = React.useState('');
  const [loading, setLoading] = React.useState(false);

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
        setWorkItems(result);
        setWorkItemsLoading(false);
      })
      .catch(() => {
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
      date: data.date,
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
                window.location.href = `${
                  window.location.href.split('/dist')[0]
                }/dist/TimeLogSuccess/TimeLogSuccess.html`;
              })
              .catch((error) => {
                console.log(error);
                setLoading(false);
              });
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
          });
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };
  return (
    <Flex gap="gap.small">
      <Flex.Item grow>
        <Flex column gap="gap.medium">
          <Header as="h3" styles={{ fontWeight: 'bold' }} content={_VALUES.NEW_TIMELOG_ENTRY} />
          <Divider />
          <Flex gap="gap.small" vAlign="center">
            <EditIcon />
            <Controller
              control={control}
              render={({ field: { onChange, value, name, ref } }) => (
                <TextSimpleComponent
                  helperText={errors.workItemId?.message}
                  error={!!errors.workItemId}
                  value={
                    <Dropdown
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
                          filteredItemsByValue &&
                          filteredItemsByValue.filter((item) => String(item.id).includes(search));
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
          </Flex>
          <Flex gap="gap.small" vAlign="center">
            <ShiftActivityIcon />
            <Controller
              control={control}
              defaultValue={new Date().toLocaleDateString('sv-SE')}
              render={({ field: { onChange, value, name, ref } }) => {
                return (
                  <Input
                    icon={false}
                    name={name}
                    value={value}
                    ref={ref}
                    error={!!errors.date}
                    type="date"
                    inline
                    onChange={(e, data) => {
                      onChange(e);
                    }}
                  />
                );
              }}
              name={'date'}
            />
            <Controller
              control={control}
              defaultValue={'0'}
              render={({ field: { onChange, value, name, ref } }) => {
                if (value === '') setValue(name, '0');
                return (
                  <Input
                    label={_VALUES.HOURS}
                    placeholder={_VALUES.HOURS}
                    name={name}
                    value={value === '' ? '0' : value}
                    ref={ref}
                    labelPosition="inline"
                    inline
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
            <Controller
              control={control}
              defaultValue={'0'}
              render={({ field: { onChange, value, name, ref } }) => {
                if (value === '') setValue(name, '0');
                return (
                  <Input
                    label={_VALUES.MINUTES}
                    placeholder={_VALUES.MINUTES}
                    name={name}
                    value={value === '' ? '0' : value}
                    ref={ref}
                    labelPosition="inline"
                    inline
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
          </Flex>
          {types && types?.length > 0 && !loadingTypes ? (
            <Flex gap="gap.small" vAlign="center">
              <OptionsIcon />
              <Controller
                control={control}
                defaultValue={types[0].label}
                render={({ field: { onChange, value, ref } }) => {
                  return (
                    <Dropdown
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
            </Flex>
          ) : (
            loadingTypes && <Loader />
          )}
          <Flex gap="gap.small" vAlign="center">
            <CalendarAgendaIcon />
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
          </Flex>
          <Divider />
          <Flex>
            <Box mt={2}>
              <Button
                icon={<SaveIcon size="large" />}
                primary={!loading}
                secondary={loading}
                loading={loading}
                disabled={loading}
                content={_VALUES.ADD_TIMELOG}
                onClick={handleSubmit(onSubmit)}
              />
            </Box>
          </Flex>
        </Flex>
      </Flex.Item>
    </Flex>
  );
};

export default TimeLogNewEntriesExternalForm;
