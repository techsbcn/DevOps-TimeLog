import React, { useEffect, useState } from 'react';
import { Flex, Dropdown, Input, TextArea, Button, Header, Divider, Loader } from '@fluentui/react-northstar';
import { EditIcon, ShiftActivityIcon, OptionsIcon, CalendarAgendaIcon } from '@fluentui/react-icons-northstar';
import { _VALUES } from '../../../resources/_constants/values';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as microsoftTeams from '@microsoft/teams-js';
import { getHoursFromMinutes, getMinutesFromHours, SelectAsyncHelper } from '../../../helpers';
import { TimeLogEntry, UserContext } from '../../../interfaces';
import { GetWorkItems } from '../../../redux/workItem/workItemAPI';
import bug from './../../../../static/bug.png';
import epic from './../../../../static/epic.png';
import feature from './../../../../static/feature.png';
import task from './../../../../static/task.png';
import product from './../../../../static/backlogitem.png';
import { WorkItemType } from '../../../enums/WorkItemType';
import { TextSimpleComponent } from 'techsbcn-storybook';
import { GetDocumentsAPI } from '../../../redux/extensionDataManager/extensionDataManagerAPI';

interface TimeLogNewEntriesExternalFormProps {
  user: UserContext;
}

const TimeLogNewEntriesExternalForm: React.FC<TimeLogNewEntriesExternalFormProps> = (props) => {
  const [workItems, setWorkItems] = useState<any[]>();
  const [workItemsLoading, setWorkItemsLoading] = React.useState(false);
  const [id, setId] = React.useState('');

  const EntrySchema = yup.object().shape(
    {
      workItemId: yup.string().required(_VALUES.REQUIRED.REQUIRED_FIELD),
      timeHours: yup
        .number()
        .transform((currentValue, originalValue) => {
          return originalValue === '' ? 0 : currentValue;
        })
        .when('timeMinutes', {
          is: 0,
          then: yup.number().positive().min(1, _VALUES.NOT_ZERO_TIME),
          otherwise: yup.number().min(0),
        }),
      timeMinutes: yup
        .number()
        .transform((currentValue, originalValue) => {
          return originalValue === '' ? 0 : currentValue;
        })
        .when('timeHours', {
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
    microsoftTeams.initialize(() => {
      const timeEntry: TimeLogEntry = {
        user: props.user.displayName,
        userId: props.user.id,
        workItemId: data.workItemId ?? 0,
        date: data.date,
        time: Number(getMinutesFromHours(data.timeHours)) + Number(data.timeMinutes),
        notes: data.notes,
        type: data.type ? data.type : undefined,
      };
      const hours = getHoursFromMinutes(timeEntry.time);

      /*PatchWorkItem(['Completed Work', 'Remaining Work'], (item: any) => {
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
      });*/

      microsoftTeams.tasks.submitTask({ user: timeEntry.user, workItemId: timeEntry.workItemId, time: hours });
      return true;
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
                      placeholder="Select WorkItem..."
                      noResultsMessage="We couldn't find any matches."
                    />
                  }
                />
              )}
              name={'workItemId'}
            />
          </Flex>
          <Flex gap="gap.small" vAlign="center">
            <ShiftActivityIcon />
            <Input inline type="date" icon={false} value={new Date().toLocaleDateString('sv-SE')} />
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
                      console.log(e, data);
                      onChange(e);
                      if (!data || (data && data.value === '')) setValue(name, '0');
                      trigger('timeHours');
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
                      placeholder="Select Activity..."
                      noResultsMessage="We couldn't find any matches."
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
            <Button primary content={_VALUES.CONTINUE} onClick={handleSubmit(onSubmit)} />
          </Flex>
        </Flex>
      </Flex.Item>
    </Flex>
  );
};

export default TimeLogNewEntriesExternalForm;
