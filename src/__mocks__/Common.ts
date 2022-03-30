import { TimeType } from '../Interfaces/TimeType';

// tslint:disable-next-line: no-empty
export function showRootComponent(component: React.ReactElement<any>) {}

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
