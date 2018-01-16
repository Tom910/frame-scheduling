const context = typeof window !== "undefined" ? window : global;

let defer: Function;
if ("requestAnimationFrame" in context) {
  defer = requestAnimationFrame.bind(context);
} else if ("setImmediate" in context) {
  defer = setImmediate.bind(context);
} else {
  defer = setTimeout.bind(context);
}

const TIME_LIFE_FRAME = 16; // 16ms === 60fps

export const P_LOWER = 1;
export const P_LOW = 3;
export const P_NORMAL = 5;
export const P_HIGH = 7;
export const P_IMPORTANT = 10;

interface listNode {
  value: Function;
  next: listNode | null;
}

class LinkedList {
  private length: number;
  private head: listNode | null;
  private last: listNode;

  constructor() {
    this.head = null;
    this.length = 0;
  }

  push(value: Function) {
    const node: listNode = {
      value: value,
      next: null
    };

    if (this.length === 0) {
      this.head = node;
      this.last = node;
    } else {
      this.last.next = node;
      this.last = node;
    }

    this.length++;
  }

  shift() {
    const currentHead = <listNode>this.head;
    const value = currentHead.value;

    this.head = currentHead.next;
    this.length--;

    return value;
  }

  isEmpty() {
    return this.length === 0;
  }
}

const frameScheduling = () => {
  const listJobs: { [l: string]: LinkedList } = {};
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
      listJobs[priority] = new LinkedList();
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
    const keysJobs = sortJobsByNumber(listJobs);
    let empty = false;

    while (true) {
      if (!keysJobs.length) {
        empty = true;
      }
      if (empty || Date.now() - timeRun > TIME_LIFE_FRAME) {
        break;
      } else {
        const keyJob = keysJobs[keysJobs.length - 1];
        const jobs = listJobs[keyJob];
        const job = jobs.shift();

        try {
          job();
        } catch (e) {
          console.error(e);
        }

        if (jobs.isEmpty()) {
          delete listJobs[keyJob];
          keysJobs.length = keysJobs.length - 1;
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

  return function scheduling(callback: Function, { priority = P_NORMAL } = {}) {
    addJob(callback, priority);

    runDefer();
  };
};

export default frameScheduling();
