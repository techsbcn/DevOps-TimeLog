export interface TimeLogEntry {
  id?: string;
  user: string;
  userId: string;
  workItemId: number;
  workItemName: string;
  startTime?: string;
  date: string;
  time: number;
  notes: string;
  type?: string;
}
