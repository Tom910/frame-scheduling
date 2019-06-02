interface QueueItem<T> {
  priority: number;
  value: T;
}

const getParentIndex = (childIndex: number) => Math.floor((childIndex - 1) / 2);
const getRightChildIndex = (parentIndex: number) => 2 * parentIndex + 2;
const hasParent = (childIndex: number) => getParentIndex(childIndex) >= 0;
const getLeftChildIndex = (parentIndex: number) => 2 * parentIndex + 1;

export class PriorityUniqQueue<T> {
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
      item = this.heapContainer.pop() as QueueItem<T>;
    } else {
      item = this.heapContainer[0];

      this.heapContainer[0] = this.heapContainer.pop() as QueueItem<T>;

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
      hasParent(currentIndex) &&
      !this.pairIsInCorrectOrder(
        this.heapContainer[getParentIndex(currentIndex)],
        this.heapContainer[currentIndex]
      )
    ) {
      this.swap(currentIndex, getParentIndex(currentIndex));
      currentIndex = getParentIndex(currentIndex);
    }
  }

  private heapifyDown(customStartIndex?: number) {
    let currentIndex = customStartIndex || 0;
    let nextIndex = null;

    while (getLeftChildIndex(currentIndex) < this.heapContainer.length) {
      if (
        getRightChildIndex(currentIndex) < this.heapContainer.length &&
        this.pairIsInCorrectOrder(
          this.heapContainer[getRightChildIndex(currentIndex)],
          this.heapContainer[getLeftChildIndex(currentIndex)]
        )
      ) {
        nextIndex = getRightChildIndex(currentIndex);
      } else {
        nextIndex = getLeftChildIndex(currentIndex);
      }

      if (
        this.pairIsInCorrectOrder(
          this.heapContainer[currentIndex],
          this.heapContainer[nextIndex]
        )
      ) {
        break;
      }

      this.swap(currentIndex, nextIndex);
      currentIndex = nextIndex;
    }
  }

  private pairIsInCorrectOrder(
    firstElement: QueueItem<T>,
    secondElement: QueueItem<T>
  ) {
    return firstElement.priority >= secondElement.priority;
  }

  private swap(indexOne: number, indexTwo: number) {
    const tmp = this.heapContainer[indexTwo];
    this.heapContainer[indexTwo] = this.heapContainer[indexOne];
    this.heapContainer[indexOne] = tmp;
  }
}
