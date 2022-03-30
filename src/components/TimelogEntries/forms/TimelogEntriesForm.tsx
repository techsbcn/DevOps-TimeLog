import React from 'react';
import { Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { MainWrapperComponent, TextFieldComponent, SelectAsyncField, ButtonComponent } from 'techsbcn-storybook';
// eslint-disable-next-line jest/no-mocks-import
import { getAllTimeTypesMock } from '../../../__mocks__/Common';

interface TimelogEntriesFormProps {
  action: (data: any) => void;
}

const TimelogEntriesForm: React.FC<TimelogEntriesFormProps> = (props) => {
  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    props.action(data);
  };

  return (
    <MainWrapperComponent
      headerProps={{
        title: `New Time Log`,
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
                  label={'Activity'}
                  name={name}
                  inputRef={ref}
                  searchPromise={getAllTimeTypesMock}
                  onChangeOption={(value, label) => {
                    console.log('OnChangeOption', label);
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
            defaultValue={''}
            render={({ field: { onChange, value, name, ref } }) => (
              <TextFieldComponent
                label={'Notes'}
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
          />
        </Grid>
      </Grid>
    </MainWrapperComponent>
  );
};

export default TimelogEntriesForm;
