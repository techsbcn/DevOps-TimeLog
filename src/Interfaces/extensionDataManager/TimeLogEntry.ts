export interface TimeLogEntry {
  id?: string;
  user: string;
  userId: string;
  workItemId: number;
  workItemName: string;
  date: string;
  time: number;
  notes: string;
  type?: string;
}
