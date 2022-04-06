export interface TimeLogEntry {
  id?: string;
  user: string;
  userId: string;
  workItemId: number;
  date: Date;
  time: number;
  notes: string;
  type?: string;
}
