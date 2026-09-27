import type { CronJob } from "bun";
import { workerMonitor, type WorkerController } from "../utils/workerMonitor";
import { checkDueReminders } from "../utils/reminderScheduler";

const NAME = "reminder-scheduler";
const INTERVAL_MS = 60_000; // Bun.cron("* * * * *", ...) fires once a minute

let job: CronJob | null = null;

export const reminderWorker: WorkerController = {
  start() {
    if (job) return;

    job = Bun.cron("* * * * *", async () => {
      if (!workerMonitor.startRun(NAME)) {
        console.log(`[reminder-worker] skipped run, already in progress`);
        return;
      }

      const start = performance.now();
      try {
        const due = checkDueReminders();
        const duration = performance.now() - start;
        workerMonitor.endRun(NAME, null, duration);
        console.log(`[reminder-worker] run completed — ${due.length} reminder(s) triggered in ${duration.toFixed(1)}ms`);
      } catch (err) {
        const duration = performance.now() - start;
        workerMonitor.endRun(NAME, err instanceof Error ? err : new Error(String(err)), duration);
        console.error(`[reminder-worker] run failed:`, err);
      }
    });

    console.log(`[reminder-worker] started (interval: every minute)`);
  },

  stop() {
    job?.stop();
    job = null;
    console.log(`[reminder-worker] stopped`);
  },

  isRunning() {
    return job !== null;
  },
};

workerMonitor.register(NAME, INTERVAL_MS);
workerMonitor.registerController(NAME, reminderWorker);
