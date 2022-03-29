export interface TimeLogEntry 
{
  id?: string,
  user: String,
  workItemId: Number,
  date: Date,
  time: number,
  notes: string,
  activity: string
}