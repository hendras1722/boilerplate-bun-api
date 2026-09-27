import type { BunRequest } from "bun";
import { sql } from "../database/sqlite";
import type { CreateReminderInput, Reminder } from "../models/reminder.model";
import { ApiResponse } from "../utils/response";
import { toSqliteDatetime, parseRemindAt } from "../utils/datetime";
import { workerMonitor } from "../utils/workerMonitor";
import { reminderWorker } from "../workers/reminder.worker";

const WORKER_NAME = "reminder-scheduler";

export const ReminderController = {
  async createReminder(req: BunRequest<"/api/v2/reminders">) {
    try {
      const data = (await req.json()) as CreateReminderInput;

      if (!data.title || !data.remind_at) {
        return ApiResponse.error("title and remind_at are required", null, 400);
      }

      const remindAt = parseRemindAt(data.remind_at);
      if (!remindAt) {
        return ApiResponse.error(
          "remind_at must be a valid ISO date or a relative string like '1 jam', '30 menit', '2 hari', '1 minggu', '3 bulan'",
          null,
          400
        );
      }

      const result = sql
        .query(
          "INSERT INTO reminders (title, note, remind_at) VALUES (?, ?, ?) RETURNING *"
        )
        .get(data.title, data.note ?? null, toSqliteDatetime(remindAt));

      return ApiResponse.success(result, 201);
    } catch (err) {
      return ApiResponse.error(
        "Failed to create reminder",
        err instanceof Error ? err.message : String(err),
        500
      );
    }
  },

  async getAllReminders() {
    const reminders = sql
      .query("SELECT * FROM reminders ORDER BY remind_at ASC")
      .all() as Reminder[];
    return ApiResponse.success(reminders);
  },

  async getReminderById(id: string) {
    const reminder = sql
      .query("SELECT * FROM reminders WHERE id = ?")
      .get(id) as Reminder | null;

    if (!reminder) {
      return ApiResponse.error("Reminder not found", null, 404);
    }

    return ApiResponse.success(reminder);
  },

  async deleteReminder(id: string) {
    const result = sql.query("DELETE FROM reminders WHERE id = ?").run(id);

    if (result.changes === 0) {
      return ApiResponse.error("Reminder not found", null, 404);
    }

    return ApiResponse.success({ message: "Reminder deleted successfully", id });
  },

  getWorkerStatus() {
    const state = workerMonitor.getStates().find((s) => s.name === WORKER_NAME);
    return ApiResponse.success({
      ...state,
      activeJobs: workerMonitor.getActiveJobs(WORKER_NAME),
    });
  },

  startWorker() {
    reminderWorker.start();
    return ApiResponse.success({ isRunning: reminderWorker.isRunning() });
  },

  stopWorker() {
    reminderWorker.stop();
    return ApiResponse.success({ isRunning: reminderWorker.isRunning() });
  },

  async restartWorker() {
    const restarted = await workerMonitor.restart(WORKER_NAME);
    return ApiResponse.success({ restarted, isRunning: reminderWorker.isRunning() });
  },
};
