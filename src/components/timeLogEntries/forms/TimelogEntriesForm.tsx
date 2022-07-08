import React, { useEffect, useState } from 'react';
import { Grid, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, TextFieldComponent, ButtonComponent, SelectField } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { GetDocuments } from '../../../redux/extensionDataManager/extensionDataManagerAPI';
import { SelectAsyncHelper } from '../../../helpers/SelectHelper';

interface TimelogEntriesFormProps {
  action: (data: any) => void;
  loading: boolean;
}

const TimelogEntriesForm: React.FC<TimelogEntriesFormProps> = (props) => {
  const EntrySchema = yup.object().shape(
    {
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
      type: yup.object().default(undefined).shape({
        id: yup.string(),
        name: yup.string(),
      }),
    },
    [['timeHours', 'timeMinutes']]
  );

  const {
    handleSubmit,
    setValue,
    control,
    reset,
    trigger,
    formState: { errors },
  } = useForm({ resolver: yupResolver(EntrySchema), reValidateMode: 'onChange' });

  const onSubmit = (data: any) => {
    props.action(data);
    reset();
  };

  const [types, setTypes] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = React.useState<boolean>(false);

  useEffect(() => {
    setLoadingTypes(true);
    GetDocuments(process.env.ACTIVITIES_COLLECTION_NAME as string)
      .then((result: any[]) => {
        setTypes(SelectAsyncHelper(result));
        setLoadingTypes(false);
      })
      .catch(() => {
        setLoadingTypes(false);
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
                  trigger('timeMinutes');
                  trigger('timeHours');
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
                  trigger('timeHours');
                  trigger('timeMinutes');
                }}
                value={!value ? 0 : value}
              />
            )}
            name={'timeMinutes'}
          />
        </Grid>
        {types && types?.length > 0 && !loadingTypes ? (
          <Grid item xs={12} md={2}>
            <Controller
              control={control}
              defaultValue={types[0]}
              render={({ field: { onChange, value, name, ref } }) => {
                value?.value && setValue(name, { id: value.value, name: value.label });
                return (
                  <SelectField
                    label={_VALUES.ACTIVITY}
                    name={name}
                    inputRef={ref}
                    options={types && types?.length > 0 ? types : []}
                    onChangeOption={(option) => {
                      onChange(option ? { id: option.value, name: option.label } : []);
                    }}
                    isClearable={false}
                    defaultOptions={value}
                  />
                );
              }}
              name={'type'}
            />
          </Grid>
        ) : (
          loadingTypes && <CircularProgress />
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
            label={_VALUES.ADD_TIMELOG}
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
