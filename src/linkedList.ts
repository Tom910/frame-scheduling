interface ListNode {
  value: () => void;
  next: ListNode | null;
}

export class LinkedList {
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
      value
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
