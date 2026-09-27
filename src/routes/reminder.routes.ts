import type { BunRequest } from "bun";
import { ReminderController } from "../controllers/reminder.controller";
import { withLogger } from "../middlewares/logger.middleware";

export const reminderRoutes = {
  "/api/v2/reminders": {
    GET: withLogger(ReminderController.getAllReminders),
    POST: withLogger(ReminderController.createReminder),
  },
  "/api/v2/reminders/worker": {
    GET: withLogger(ReminderController.getWorkerStatus),
  },
  "/api/v2/reminders/worker/start": {
    POST: withLogger(ReminderController.startWorker),
  },
  "/api/v2/reminders/worker/stop": {
    POST: withLogger(ReminderController.stopWorker),
  },
  "/api/v2/reminders/worker/restart": {
    POST: withLogger(ReminderController.restartWorker),
  },
  "/api/v2/reminders/:id": {
    GET: withLogger((req: BunRequest<"/api/v2/reminders/:id">) =>
      ReminderController.getReminderById(req.params.id)
    ),
    DELETE: withLogger((req: BunRequest<"/api/v2/reminders/:id">) =>
      ReminderController.deleteReminder(req.params.id)
    ),
  },
};
