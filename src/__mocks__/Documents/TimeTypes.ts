import { TimeType } from '../../Interfaces/TimeType';

export const getAllTimeTypesMock = async (): Promise<TimeType[]> => {
  return [
    {
      id: '1',
      name: 'Development',
    },
    {
      id: '2',
      name: 'Business',
    },
    {
      id: '3',
      name: 'UAT',
    },
  ];
};
