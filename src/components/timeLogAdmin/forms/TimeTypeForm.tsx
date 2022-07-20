import React from 'react';
import { MainWrapperComponent, TextFieldComponent, ButtonComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../../resources/_constants/values';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

interface TimeTypeFormProps {
  action: (data: any) => void;
  loading: boolean;
}

const TimeTypeForm: React.FC<TimeTypeFormProps> = (props) => {
  const TypeSchema = yup.object().shape({ name: yup.string().required(_VALUES.REQUIRED.REQUIRED_FIELD) });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(TypeSchema) });

  const onSubmit = (data: any) => {
    props.action(data);
    reset();
  };
  return (
    <MainWrapperComponent
      loadingProgressBar={props.loading}
      headerProps={{
        title: _VALUES.NEW_ACTIVITY,
        filters: [
          {
            singleFilter: (
              <Controller
                control={control}
                defaultValue=""
                render={({ field: { onChange, value, name, ref } }) => (
                  <TextFieldComponent
                    placeholder={_VALUES.DESCRIPTION}
                    name={name}
                    inputRef={ref}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    onChange={(e) => {
                      onChange(e);
                    }}
                    value={value}
                  />
                )}
                name={'name'}
              />
            ),
          },
          {
            singleFilter: (
              <ButtonComponent
                label={_VALUES.ADD_ACTIVITY}
                startIcon={<FontAwesomeIcon icon={faFloppyDisk} />}
                onClick={handleSubmit(onSubmit)}
              />
            ),
          },
        ],
      }}
    />
  );
};

export default TimeTypeForm;
