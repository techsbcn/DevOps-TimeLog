export const SelectAsyncHelper = (strEnum: any[]) => {
  const options: any[] = [];
  strEnum.forEach((value) => {
    options.push({ value: value.id, label: value.name || value.description });
  });
  return options;
};

export const SelectSimpleAsyncHelper = (item: any) => {
  return { value: item.id, label: item.name || item.description };
};
