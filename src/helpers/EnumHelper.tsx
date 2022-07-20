import { _VALUES } from '../resources/_constants/values';

export const EnumToSelect = (myEnum: any, suffix?: string) => {
  const options: any[] = [];

  Object.keys(myEnum)
    .filter((key) => isNaN(Number(myEnum[key])))
    .forEach((key) => {
      options.push({
        value: key,
        label: suffix ? _VALUES[`${myEnum[key].toUpperCase()}_${suffix}`] : _VALUES[myEnum[key].toUpperCase()],
      });
    });

  return options;
};
export const SelectEnum = (myEnum: any, strEnum: string[], suffix?: string) => {
  const options: any[] = [];
  strEnum.forEach((value) => {
    if (value !== '')
      options.push({
        value: `${myEnum[value]}`,
        label: suffix ? _VALUES[`${value.toUpperCase()}_${suffix}`] : _VALUES[value.toUpperCase()],
      });
  });
  return options;
};

export const EnumToSelectExcluded = (myEnum: any, excludeEnums: string[]) => {
  const options: any[] = [];

  Object.keys(myEnum)
    .filter((key) => isNaN(Number(myEnum[key])))
    .forEach((key) => {
      if (!excludeEnums.includes(key)) {
        options.push({ value: key, label: _VALUES[myEnum[key].toUpperCase()] });
      }
    });

  return options;
};

export const getEnumKeyByEnumValue = (myEnum: any, enumValue: string) => {
  return (myEnum as { [key: string]: any })[enumValue];
};

export const getArrayEnumKeyByEnumValue = (myEnum: any, enumValue: string[]) => {
  const keys: number[] = [];

  enumValue.forEach((value) => {
    keys.push((myEnum as { [key: string]: any })[value]);
  });
  return keys;
};
