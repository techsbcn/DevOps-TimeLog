import { TimeType } from './TimeType';

export interface TimeLogEntry {
  id?: string;
  user: string;
  workItemId: number;
  date: Date;
  time: number;
  notes: string;
  activity?: TimeType;
}
