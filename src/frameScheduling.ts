import { PriorityUniqQueue } from "./priorityUniqQueue";
import { LinkedList } from "./linkedList";
import { defer as defaultDefer, Defer } from "./defer";

const TIME_LIFE_FRAME = 16; // 16ms === 60fps

export const P_LOWER = 1;
export const P_LOW = 3;
export const P_NORMAL = 5;
export const P_HIGH = 7;
export const P_IMPORTANT = 10;

export const createFrameScheduling = (
  defer: Defer = defaultDefer,
  lifeFrame: number = TIME_LIFE_FRAME
) => {
  const heapJobs = new PriorityUniqQueue<LinkedList>();
  let deferScheduled = false;

  const runDefer = () => {
    if (!deferScheduled) {
      deferScheduled = true;
      defer(runJobs);
    }
  };

  const addJob = (callback: () => void, priority: number) => {
    let job = heapJobs.get(priority);

    if (!job) {
      job = new LinkedList();
      heapJobs.add(priority, job);
    }

    job.push(callback);
  };

  const runJobs = () => {
    const timeRun = Date.now();

    while (true) {
      if (heapJobs.isEmpty() || Date.now() - timeRun > lifeFrame) {
        break;
      } else {
        const jobs = heapJobs.peek();

        try {
          (jobs.shift())();
        } catch (e) {
          console.error(e); // tslint:disable-line
        }

        if (jobs.isEmpty()) {
          heapJobs.poll();
        }
      }
    }

    deferScheduled = false;

    if (!heapJobs.isEmpty()) {
      heapJobs.rising();

      runDefer();
    }
  };

  return function scheduling(
    callback: () => void,
    { priority = P_NORMAL } = {}
  ) {
    addJob(callback, priority);

    runDefer();
  };
};

export default createFrameScheduling();
