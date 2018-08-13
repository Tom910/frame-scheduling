/* tslint:disable no-bitwise */
const context = typeof window !== "undefined" ? window : global;

let defer: (f: () => void) => void;
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

interface QueueItem<T> { priority: number; value: T; }
class PriorityQueue<T> {
  private data: Array<QueueItem<T>>;
  private length: number;

  constructor() {
    this.data = [];
    this.length = 0;
  }

  public push(priority: number, value: T) {
    this.data.push({ priority, value });
    this.length++;
    this.up(this.length - 1);
  }

  public pop() {
    const top = this.data[0];
    this.length--;

    if (this.length > 0) {
      this.data[0] = this.data[this.length];
      this.down(0);
    }
    this.data.pop();

    return top.value;
  }

  public peek() {
    return this.data[0].value;
  }

  public get(priority: number) {
    for (const item of this.data) {
      if (item.priority === priority) {
        return item.value;
      }
    }

    return null;
  }

  public forEach(callback: (item: QueueItem<T>) => void) {
    this.data.forEach(callback);
  }

  public isEmpty() {
    return this.data.length === 0;
  }

  private compare(a: QueueItem<T>, b: QueueItem<T>) {
    return a.priority > b.priority ? -1 : 1;
  }

  private up(pos: number) {
    const data = this.data;
    const compare = this.compare;
    const item = data[pos];

    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const current = data[parent];
      if (compare(item, current) >= 0) {
        break;
      }
      data[pos] = current;
      pos = parent;
    }

    data[pos] = item;
  }

  private down(pos: number) {
    const data = this.data;
    const compare = this.compare;
    const halfLength = this.length >> 1;
    const item = data[pos];

    while (pos < halfLength) {
      const left = (pos << 1) + 1;
      const best = data[left];

      if (compare(best, item) >= 0) {
        break;
      }

      data[pos] = best;
      pos = left;
    }

    data[pos] = item;
  }
}

interface ListNode {
  value: () => void;
  next: ListNode | null;
}

class LinkedList {
  private length: number;
  private head: ListNode | null;
  private last: ListNode | null;

  constructor() {
    this.head = null;
    this.last = null;
    this.length = 0;
  }

  public push(value: () => void) {
    const node: ListNode = {
      next: null,
      value,
    };

    if (this.length === 0) {
      this.head = node;
      this.last = node;
    } else {
      (this.last as ListNode).next = node;
      this.last = node;
    }

    this.length++;
  }

  public shift() {
    const currentHead = this.head as ListNode;
    const value = currentHead.value;

    this.head = currentHead.next;
    this.length--;

    return value;
  }

  public isEmpty() {
    return this.length === 0;
  }
}

const frameScheduling = () => {
  const heapJobs = new PriorityQueue<LinkedList>();
  let deferScheduled = false;

  const runDefer = () => {
    if (!deferScheduled) {
      defer(runJobs);
    }

    deferScheduled = true;
  };

  const addJob = (callback: () => void, priority: number) => {
    const getJob = heapJobs.get(priority);
    let newLinkedList;

    if (!getJob) {
      newLinkedList = new LinkedList();
      heapJobs.push(priority, newLinkedList);
    }

    ((getJob || newLinkedList) as LinkedList).push(callback);
  };

  const runJobs = () => {
    const timeRun = Date.now();

    while (true) {
      if (heapJobs.isEmpty() || Date.now() - timeRun > TIME_LIFE_FRAME) {
        break;
      } else {
        const jobs = heapJobs.peek();
        const job = jobs.shift();

        try {
          job();
        } catch (e) {
          console.error(e); // tslint:disable-line
        }

        if (jobs.isEmpty()) {
          heapJobs.pop();
        }
      }
    }

    deferScheduled = false;

    if (!heapJobs.isEmpty()) {
      heapJobs.forEach((item) => {
        item.priority += 1;
      });

      runDefer();
    }
  };

  return function scheduling(callback: () => void, { priority = P_NORMAL } = {}) {
    addJob(callback, priority);

    runDefer();
  };
};

export default frameScheduling();
