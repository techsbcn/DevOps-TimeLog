import React, { useEffect, useState } from 'react';
import { Grid, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, TextFieldComponent, ButtonComponent, SelectField } from 'techsbcn-storybook';
// eslint-disable-next-line jest/no-mocks-import
import { getAllTimeTypesMock } from '../../../__mocks__/Common';
import { _VALUES } from '../../../resources/_constants/values';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { SelectAsyncHelper, SelectSimpleAsyncHelper } from '../../../helpers';

interface TimelogEntriesFormProps {
  action: (data: any) => void;
  loading: boolean;
}

const TimelogEntriesForm: React.FC<TimelogEntriesFormProps> = (props) => {
  const EntrySchema = yup.object().shape({
    activity: yup.object().default(undefined).shape({
      id: yup.number(),
      name: yup.string(),
    }),
  });

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(EntrySchema) });

  const onSubmit = (data: any) => {
    props.action(data);
  };

  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = React.useState<boolean>(false);

  useEffect(() => {
    setLoadingActivities(true);
    getAllTimeTypesMock()
      .then((result) => {
        setActivities(result);
        setLoadingActivities(false);
      })
      .catch(() => {
        setLoadingActivities(false);
      });
  }, []);

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.NEW_TIMELOG_ENTRY,
      }}
    >
      <Grid container spacing={3}>
        <Grid item md={2}>
          <Controller
            control={control}
            defaultValue={new Date().toLocaleDateString('sv-SE')}
            render={({ field: { onChange, value, name, ref } }) => (
              <TextFieldComponent
                label={_VALUES.DATE}
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
                label={_VALUES.HOURS}
                placeholder={_VALUES.HOURS}
                type="number"
                minNumber={0}
                error={!!errors.timeHours}
                helperText={errors.timeHours?.message}
                name={name}
                inputRef={ref}
                onChange={(e) => {
                  onChange(e);
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
                label={_VALUES.MINUTES}
                placeholder={_VALUES.MINUTES}
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
        {activities && activities?.length > 0 && !loadingActivities ? (
          <Grid item xs={12} md={2}>
            <Controller
              control={control}
              defaultValue={SelectSimpleAsyncHelper(activities[0])}
              render={({ field: { onChange, value, name, ref } }) => {
                value?.value && setValue(name, { id: value.value, name: value.label });
                return (
                  <SelectField
                    label={_VALUES.ACTIVITY}
                    name={name}
                    inputRef={ref}
                    options={activities && activities?.length > 0 ? SelectAsyncHelper(activities) : []}
                    onChangeOption={(option) => {
                      onChange(option ? { id: option.value, name: option.label } : []);
                    }}
                    isClearable={false}
                    defaultOptions={value}
                  />
                );
              }}
              name={'activity'}
            />
          </Grid>
        ) : (
          loadingActivities && <CircularProgress />
        )}
        <Grid item xs={12} md={6}>
          <Controller
            control={control}
            defaultValue={''}
            render={({ field: { onChange, value, name, ref } }) => (
              <TextFieldComponent
                label={_VALUES.NOTES}
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
            label={'Add Time Log'}
            startIcon={<FontAwesomeIcon icon={faFloppyDisk} />}
            onClick={handleSubmit(onSubmit)}
            loading={props.loading}
          />
        </Grid>
      </Grid>
    </MainWrapperComponent>
  );
};

export default TimelogEntriesForm;
