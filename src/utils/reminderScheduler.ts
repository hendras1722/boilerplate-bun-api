import { sql } from "../database/sqlite";
import type { Reminder } from "../models/reminder.model";

export function checkDueReminders() {
  const due = sql
    .query(
      "SELECT * FROM reminders WHERE status = 'pending' AND remind_at <= CURRENT_TIMESTAMP"
    )
    .all() as Reminder[];

  for (const reminder of due) {
    console.log(`⏰ Reminder due: [${reminder.id}] ${reminder.title}${reminder.note ? ` - ${reminder.note}` : ""}`);

    sql
      .query(
        "UPDATE reminders SET status = 'triggered', triggered_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .run(reminder.id);
  }

  return due;
}
