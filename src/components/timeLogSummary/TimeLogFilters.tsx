import React, { useEffect, useState } from 'react';
import { MainWrapperComponent, SelectField, TextFieldComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../resources/_constants/values';
import { GetTeams, GetTeamMembers } from '../../redux/core/coreAPI';
import * as _ from 'lodash';
import { TimeLogEntryFilters, UserContext } from '../../interfaces';
import { SelectAsyncHelper } from '../../helpers/SelectHelper';
import { ContextType } from '../../enums/ContextType';
import { usePrevious } from '../../helpers';

interface TimeLogFiltersProps {
  onFiltersChange: (value: any, name: string) => void;
  user?: UserContext;
  filters?: TimeLogEntryFilters;
  projectId?: string;
  contextType: ContextType;
}

const TimeLogFilters: React.FC<TimeLogFiltersProps> = (props) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [teamSelected, setTeamSelected] = useState<any>();
  const [memberSelected, setMemberSelected] = useState<any[]>();
  const [loadingFilters, setLoadingFilters] = useState<boolean>(false);

  const prevMembersState = usePrevious(JSON.stringify(members));

  useEffect(() => {
    setLoadingFilters(true);
    GetTeams(props.contextType, props.projectId)
      .then((result) => {
        const resultTransform = SelectAsyncHelper(result);
        setTeams(resultTransform);
        setTeamSelected(resultTransform[0]);
      })
      .catch(() => {
        setLoadingFilters(false);
      });
  }, [props.contextType, props.projectId]);

  useEffect(() => {
    if (prevMembersState && prevMembersState !== JSON.stringify(members)) {
      props.onFiltersChange(
        members.length === 0
          ? undefined
          : memberSelected
          ? memberSelected.some((option: any) => option.value === 'all')
            ? members.map((member: any) => member.id)
            : memberSelected.map((item: any) => item.value)
          : undefined,
        'userIds'
      );
    }
  }, [members, prevMembersState, props, memberSelected]);

  const loadMembers = React.useCallback(() => {
    if (teamSelected) {
      GetTeamMembers(teamSelected.value, props.contextType, props.projectId).then((members) => {
        if (props.user && members.some((member) => props.user && member.id === props.user.id)) {
          setMembers(members);
          setMemberSelected([{ value: props.user.id, label: props.user.displayName }]);
          setLoadingFilters(false);
        } else {
          setMembers(members);
          setMemberSelected([{ value: 'all', label: _VALUES.ALL }]);
          setLoadingFilters(false);
        }
      });
    }
  }, [teamSelected, props.contextType, props.projectId, props.user]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const ListFilters = () => {
    const filterList: any[] = [];
    const allOption = { value: 'all', label: _VALUES.ALL };
    teams &&
      teams?.length > 0 &&
      filterList.push({
        singleFilter: (
          <SelectField
            name="teams"
            label={_VALUES.TEAMS}
            options={teams}
            value={teamSelected && teamSelected}
            isClearable={false}
            onChangeOption={(options) => {
              setTeamSelected(options);
            }}
          />
        ),
      });

    members &&
      members?.length > 0 &&
      filterList.push({
        singleFilter: (
          <SelectField
            name="userIds"
            label={_VALUES.USERS}
            options={members && members?.length > 0 ? SelectAsyncHelper(members) : []}
            addExtraOption={members && members.length > 1 && allOption}
            value={memberSelected}
            isClearable={false}
            isMulti
            onChangeOption={(value) => {
              const name = 'userIds';
              if (value.length > 0) {
                if (
                  memberSelected &&
                  memberSelected.some((option: any) => option.value === 'all') &&
                  value.some((option: any) => option.value === 'all')
                ) {
                  const result = value.filter((option: any) => option.value !== 'all');
                  setMemberSelected(result);
                  props.onFiltersChange(
                    result.map((item: any) => item.value),
                    name
                  );
                } else if (Array.isArray(value) && value.some((option: any) => option.value === 'all')) {
                  props.onFiltersChange(
                    members.map((member: any) => member.id),
                    name
                  );
                  setMemberSelected([allOption]);
                } else {
                  props.onFiltersChange(
                    value.map((item: any) => item.value),
                    name
                  );
                  setMemberSelected(value);
                }
              } else if (Array.isArray(value) && value.length === 0) {
                props.onFiltersChange(
                  members.map((member: any) => member.id),
                  name
                );
                setMemberSelected([allOption]);
              }
            }}
          />
        ),
      });
    filterList.push({
      doubleFilter: {
        firstFilter: (
          <TextFieldComponent
            label={_VALUES.FROM}
            name="timeFrom"
            defaultValue={props.filters?.timeFrom && new Date(props.filters.timeFrom).toLocaleDateString('sv-SE')}
            type="date"
            onChange={_.debounce(async (e) => props.onFiltersChange(e.target.value, e.target.name), 1000)}
          />
        ),
        secondFilter: (
          <TextFieldComponent
            label={_VALUES.TO}
            name="timeTo"
            type="date"
            defaultValue={props.filters?.timeTo && new Date(props.filters.timeTo).toLocaleDateString('sv-SE')}
            onChange={_.debounce(async (e) => {
              const date = new Date(new Date(e.target.value).setHours(23, 59, 59));
              props.onFiltersChange(
                !isNaN(date.valueOf()) ? date.toLocaleDateString('sv-SE') : e.target.value,
                e.target.name
              );
            }, 1000)}
          />
        ),
      },
    });

    return filterList;
  };

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.FILTERS,
        filters: !loadingFilters ? ListFilters() : [],
      }}
      loading={loadingFilters}
    />
  );
};

export default TimeLogFilters;
