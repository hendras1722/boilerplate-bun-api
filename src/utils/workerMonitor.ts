export interface WorkerController {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

export interface ActiveJob {
  id: number;
  details: string;
  startedAt: Date;
}

export type WorkerRunStatus = "success" | "error" | "";

export interface WorkerState {
  name: string;
  interval: number;
  isRunning: boolean;
  lastRunTime: Date | null;
  lastDuration: number;
  lastStatus: WorkerRunStatus;
  lastError: string;
  totalRuns: number;
}

class WorkerMonitor {
  private states = new Map<string, WorkerState>();
  private controllers = new Map<string, WorkerController>();
  private activeJobs = new Map<string, Map<number, ActiveJob>>();

  register(name: string, interval: number) {
    this.states.set(name, {
      name,
      interval,
      isRunning: false,
      lastRunTime: null,
      lastDuration: 0,
      lastStatus: "",
      lastError: "",
      totalRuns: 0,
    });
  }

  registerController(name: string, controller: WorkerController) {
    this.controllers.set(name, controller);
  }

  addActiveJob(workerName: string, jobId: number, details: string) {
    let jobs = this.activeJobs.get(workerName);
    if (!jobs) {
      jobs = new Map();
      this.activeJobs.set(workerName, jobs);
    }
    jobs.set(jobId, { id: jobId, details, startedAt: new Date() });
  }

  removeActiveJob(workerName: string, jobId: number) {
    this.activeJobs.get(workerName)?.delete(jobId);
  }

  getActiveJobs(workerName: string): ActiveJob[] {
    const jobs = this.activeJobs.get(workerName);
    return jobs ? Array.from(jobs.values()) : [];
  }

  /** Returns false if the worker is already running or unregistered. */
  startRun(name: string): boolean {
    const state = this.states.get(name);
    if (!state || state.isRunning) return false;
    state.isRunning = true;
    return true;
  }

  endRun(name: string, error: Error | null, duration: number) {
    const state = this.states.get(name);
    if (!state) return;
    state.isRunning = false;
    state.lastRunTime = new Date();
    state.lastDuration = duration;
    state.totalRuns++;
    if (error) {
      state.lastStatus = "error";
      state.lastError = error.message;
    } else {
      state.lastStatus = "success";
      state.lastError = "";
    }
  }

  getStates(): WorkerState[] {
    return Array.from(this.states.values()).map((state) => {
      const controller = this.controllers.get(state.name);
      return controller ? { ...state, isRunning: controller.isRunning() } : { ...state };
    });
  }

  async restart(name: string): Promise<boolean> {
    const controller = this.controllers.get(name);
    if (!controller) return false;
    controller.stop();
    await Bun.sleep(200); // give the previous loop time to exit before restarting
    controller.start();
    return true;
  }
}

export const workerMonitor = new WorkerMonitor();
