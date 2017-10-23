let defer: Function;
const context = typeof window !== "undefined" ? window : global;

if ("requestAnimationFrame" in context) {
  defer = requestAnimationFrame.bind(context);
} else {
  defer = setTimeout.bind(context);
}

const timeLifeFrame = 16; // 16ms === 60fps

export const P_LOWER = 1;
export const P_LOW = 3;
export const P_NORMAL = 5;
export const P_HIGH = 7;
export const P_IMPORTANT = 10;

const frameScheduling = () => {
  const listJobs: { [l: string]: Function[] } = {};
  let deferScheduled = false;
  let jobsSortCached: string[];
  let jobsSortActual = false;

  const sortJobsByNumber = (jobs: Object) => {
    if (!jobsSortActual) {
      jobsSortCached = Object.keys(jobs).sort(
        (left: string, right: string) => Number(left) - Number(right)
      );
      jobsSortActual = true;
    }

    return jobsSortCached;
  };

  const runDefer = () => {
    if (!deferScheduled) {
      defer(runJobs);
    }

    deferScheduled = true;
  };

  const addJob = (callback: Function, priority: number) => {
    if (!listJobs[priority]) {
      listJobs[priority] = [];
      jobsSortActual = false;
    }
    listJobs[priority].push(callback);
  };

  const raisingOfJob = () => {
    const keys = sortJobsByNumber(listJobs);

    for (var i = keys.length; i > 0; i--) {
      const key = keys[i - 1];

      listJobs[Number(key) + 1] = listJobs[key];
      delete listJobs[key];
    }

    jobsSortActual = false;
  };

  const runJobs = () => {
    const timeRun = Date.now();
    const keys = sortJobsByNumber(listJobs);
    let empty = false;

    while (true) {
      if (!keys.length) {
        empty = true;
      }
      if (empty || Date.now() - timeRun > timeLifeFrame) {
        break;
      } else {
        const key = keys[keys.length - 1];
        const jobs = listJobs[key];
        const job = jobs.shift();

        try {
          job && job();
        } catch (e) {
          console.error(e);
        }

        if (!jobs.length) {
          delete listJobs[key];
          keys.length = keys.length - 1;
          jobsSortActual = false;
        }
      }
    }

    deferScheduled = false;

    if (!empty) {
      raisingOfJob();

      runDefer();
    }
  };

  return (callback: Function, { priority = P_NORMAL } = {}) => {
    addJob(callback, priority);

    runDefer();
  };
};

export default frameScheduling();
