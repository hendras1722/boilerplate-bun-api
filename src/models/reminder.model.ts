export type ReminderStatus = "pending" | "triggered" | "cancelled";

export interface Reminder {
  id: number;
  title: string;
  note: string | null;
  remind_at: string;
  status: ReminderStatus;
  created_at?: string;
  triggered_at?: string | null;
}

export interface CreateReminderInput {
  title: string;
  note?: string;
  remind_at: string;
}
