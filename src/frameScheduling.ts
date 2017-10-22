let defer: Function;

if ("requestAnimationFrame" in window) {
  defer = requestAnimationFrame.bind(window);
} else {
  defer = setTimeout.bind(window);
}

const timeLifeFrame = 16; // 16ms === 60fps

class Job {
  fn: Function;
  priority: number;
  iterations: number;
  constructor(callback: Function, priority: number) {
    this.fn = callback;
    this.priority = priority;
    this.iterations = 0;
  }
}

export const P_LOWER = 1;
export const P_LOW = 3;
export const P_NORMAL = 5;
export const P_HIGH = 7;
export const P_IMPORTANT = 10;

const sortByPriority = (list: Job[]) => {
  return list.sort(
    (left: Job, right: Job) =>
      right.priority - right.iterations - left.priority - left.iterations
  );
};

const frameScheduling = () => {
  const listJobs: Job[] = [];
  let deferScheduled = false;

  const runDefer = () => {
    if (!deferScheduled) {
      defer(runJobs);
    }

    deferScheduled = true;
  };

  const runJobs = () => {
    const timeRun = Date.now();
    sortByPriority(listJobs);

    while (true) {
      if (listJobs.length === 0 || Date.now() - timeRun > timeLifeFrame) {
        break;
      } else {
        const job = listJobs.shift();

        job && job.fn();
      }
    }

    deferScheduled = false;

    if (listJobs.length !== 0) {
      for (var i = 0; i < listJobs.length; i++) {
        listJobs[i].iterations++;
      }

      runDefer();
    }
  };

  return (callback: Function, { priority = P_NORMAL } = {}) => {
    listJobs.push(new Job(callback, priority));

    runDefer();
  };
};

export default frameScheduling();
