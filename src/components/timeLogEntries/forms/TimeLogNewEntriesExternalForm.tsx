import React, { useEffect, useState } from 'react';
import { Flex, Dropdown, Input, TextArea, Button, Header, Divider } from '@fluentui/react-northstar';
import { EditIcon, ShiftActivityIcon, OptionsIcon, CalendarAgendaIcon } from '@fluentui/react-icons-northstar';
import { _VALUES } from '../../../resources/_constants/values';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as microsoftTeams from '@microsoft/teams-js';
import { getMinutesFromHours } from '../../../helpers';
import { TimeLogEntry, UserContext } from '../../../interfaces';
import { GetWorkItems } from '../../../redux/workItem/workItemAPI';
import bug from './../../../../static/bug.png';
import epic from './../../../../static/epic.png';
import feature from './../../../../static/feature.png';
import task from './../../../../static/task.png';
import product from './../../../../static/backlogitem.png';
import { WorkItemType } from '../../../enums/WorkItemType';
import { TextSimpleComponent } from 'techsbcn-storybook';

interface TimeLogNewEntriesExternalFormProps {
  user: UserContext;
}

const TimeLogNewEntriesExternalForm: React.FC<TimeLogNewEntriesExternalFormProps> = (props) => {
  const [workItems, setWorkItems] = useState<any[]>();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [workItemId, setWorkItemId] = React.useState(undefined);
  const [workItemError, setWorkItemError] = React.useState(false);
  const [id, setId] = React.useState('');

  const EntrySchema = yup.object().shape(
    {
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
      type: yup.object().default(undefined).shape({
        id: yup.string(),
        name: yup.string(),
      }),
    },
    [['timeHours', 'timeMinutes']]
  );

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(EntrySchema),
  });

  useEffect(() => {
    GetWorkItems(id).then((result) => {
      setWorkItems(result);
    });
  }, [id]);

  const onSubmit2 = (data: any) => {
    microsoftTeams.initialize(() => {
      const timeEntry: TimeLogEntry = {
        user: props.user.displayName,
        userId: props.user.id,
        workItemId: data.workItemId ?? 0,
        date: data.date,
        time: Number(getMinutesFromHours(data.timeHours)) + Number(data.timeMinutes),
        notes: data.notes,
        type: data.type ? data.type.name : undefined,
      };
      microsoftTeams.tasks.submitTask(timeEntry);
      return true;
    });
  };
  const onSubmit = (data: any) => {
    if (!workItemId || (workItems && workItems.filter((item) => String(item.id) === workItemId).length === 0)) {
      setWorkItemError(true);
    }
    console.log(data);
  };
  return (
    <Flex gap="gap.small">
      <Flex.Item grow>
        <Flex column gap="gap.medium">
          <Header as="h3" styles={{ fontWeight: 'bold' }} content={_VALUES.NEW_TIMELOG_ENTRY} />
          <Divider />
          <Flex gap="gap.small" vAlign="center">
            <EditIcon />
            <TextSimpleComponent
              helperText={workItemError && _VALUES.REQUIRED.REQUIRED_FIELD}
              error={workItemError}
              value={
                <Dropdown
                  error={workItemError}
                  value={workItemId}
                  searchQuery={searchQuery}
                  onChange={(e, data) => {
                    const val = data.value
                      ? data.value['id']
                        ? data.value['id'].toString()
                        : data.value
                        ? data.value.toString()
                        : ''
                      : '';
                    val && setWorkItemError(false);
                    setWorkItemId(val);
                  }}
                  onSearchQueryChange={(e, data) => {
                    setSearchQuery(
                      data.searchQuery
                        ? data.searchQuery === '[object Object]'
                          ? data.value
                            ? data.value['id']
                              ? data.value['id'].toString()
                              : data.value
                              ? data.value.toString()
                              : ''
                            : ''
                          : data.searchQuery
                        : ''
                    );
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
                        {...props}
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
                  items={workItems}
                  placeholder="Select WorkItem..."
                  noResultsMessage="We couldn't find any matches."
                />
              }
            />
          </Flex>
          <Flex gap="gap.small" vAlign="center">
            <ShiftActivityIcon />
            <Input inline type="date" icon={false} value={new Date().toLocaleDateString('sv-SE')} />
            <Input label={_VALUES.HOURS} name="timeHours" labelPosition="inline" type="number" min={0} />
            <Input
              label={_VALUES.MINUTES}
              name="timeMinutes"
              labelPosition="inline"
              inline
              type="number"
              min={0}
              step={15}
            />
          </Flex>
          <Flex gap="gap.small" vAlign="center">
            <OptionsIcon />
            <Dropdown
              placeholder="Select Activity..."
              noResultsMessage="We couldn't find any matches."
              getA11ySelectionMessage={{
                onAdd: (item) => `${item} has been selected.`,
              }}
            />
          </Flex>
          <Flex gap="gap.small" vAlign="center">
            <CalendarAgendaIcon />
            <TextArea fluid />
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
