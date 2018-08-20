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
class PriorityUniqQueue<T> {
  private heapContainer: Array<QueueItem<T>>;
  private hashPriority: Record<string, T>;

  constructor() {
    this.heapContainer = [];
    this.hashPriority = Object.create(null);
  }

  public peek() {
    return this.heapContainer[0].value;
  }

  public poll() {
    let item;

    if (this.heapContainer.length === 1) {
      item = (this.heapContainer.pop() as QueueItem<T>);
    } else {
      item = this.heapContainer[0];

      this.heapContainer[0] = (this.heapContainer.pop() as QueueItem<T>);

      this.heapifyDown();
    }

    delete this.hashPriority[item.priority];

    return item.value;
  }

  public add(priority: number, value: T) {
    this.heapContainer.push({ priority, value });
    this.heapifyUp();
    this.hashPriority[priority] = value;
  }

  public isEmpty() {
    return !this.heapContainer.length;
  }

  public get(priority: number) {
    return this.hashPriority[priority];
  }

  public rising() {
    const keys = Object.keys(this.hashPriority);

    for (let i = keys.length; i > 0; i--) {
      const key = keys[i - 1];

      this.hashPriority[Number(key) + 1] = this.hashPriority[key];
      delete this.hashPriority[key];
    }

    for (let j = 0; j < this.heapContainer.length; j++) {
      this.heapContainer[j].priority += 1;
    }
  }

  private heapifyUp(customStartIndex?: number) {
    let currentIndex = customStartIndex || this.heapContainer.length - 1;

    while (
      this.hasParent(currentIndex)
      && !this.pairIsInCorrectOrder(
        this.heapContainer[this.getParentIndex(currentIndex)],
        this.heapContainer[currentIndex],
      )
    ) {
      this.swap(currentIndex, this.getParentIndex(currentIndex));
      currentIndex = this.getParentIndex(currentIndex);
    }
  }

  private heapifyDown(customStartIndex?: number) {
    let currentIndex = customStartIndex || 0;
    let nextIndex = null;

    while (this.hasLeftChild(currentIndex)) {
      if (
        this.hasRightChild(currentIndex)
        && this.pairIsInCorrectOrder(this.rightChild(currentIndex), this.leftChild(currentIndex))
      ) {
        nextIndex = this.getRightChildIndex(currentIndex);
      } else {
        nextIndex = this.getLeftChildIndex(currentIndex);
      }

      if (this.pairIsInCorrectOrder(
        this.heapContainer[currentIndex],
        this.heapContainer[nextIndex],
      )) {
        break;
      }

      this.swap(currentIndex, nextIndex);
      currentIndex = nextIndex;
    }
  }

  private pairIsInCorrectOrder(firstElement: QueueItem<T>, secondElement: QueueItem<T>) {
    return firstElement.priority >= secondElement.priority;
  }

  private getLeftChildIndex(parentIndex: number) {
    return (2 * parentIndex) + 1;
  }

  private getRightChildIndex(parentIndex: number) {
    return (2 * parentIndex) + 2;
  }

  private getParentIndex(childIndex: number) {
    return Math.floor((childIndex - 1) / 2);
  }

  private hasParent(childIndex: number) {
    return this.getParentIndex(childIndex) >= 0;
  }

  private hasLeftChild(parentIndex: number) {
    return this.getLeftChildIndex(parentIndex) < this.heapContainer.length;
  }

  private hasRightChild(parentIndex: number) {
    return this.getRightChildIndex(parentIndex) < this.heapContainer.length;
  }

  private leftChild(parentIndex: number) {
    return this.heapContainer[this.getLeftChildIndex(parentIndex)];
  }

  private rightChild(parentIndex: number) {
    return this.heapContainer[this.getRightChildIndex(parentIndex)];
  }

  private swap(indexOne: number, indexTwo: number) {
    const tmp = this.heapContainer[indexTwo];
    this.heapContainer[indexTwo] = this.heapContainer[indexOne];
    this.heapContainer[indexOne] = tmp;
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
  const heapJobs = new PriorityUniqQueue<LinkedList>();
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
      heapJobs.add(priority, newLinkedList);
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

  return function scheduling(callback: () => void, { priority = P_NORMAL } = {}) {
    addJob(callback, priority);

    runDefer();
  };
};

export default frameScheduling();
