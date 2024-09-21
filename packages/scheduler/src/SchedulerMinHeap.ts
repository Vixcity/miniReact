export type Heap<T extends Node> = Array<T>;
export type Node = {
  sortIndex: number; // 排序依据
  id: number; // 唯一标识符
};

// 获取堆顶元素
export function peek<T extends Node>(heap: Heap<T>): T | null {
  return heap.length > 0 ? heap[0] : null;
}

// 给堆添加元素
export function push<T extends Node>(heap: Heap<T>, node: T): void {
  // 1. 把 node 放到堆的最后
  const index = heap.length;
  heap.push(node);
  // 2. 调整最小堆，自下而上堆化
  siftUP(heap, node, index);
}

// 自下而上堆化
function siftUP<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i;
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (compare(parent, node) > 0) {
      // 子节点小于父节点，交换位置
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

function siftDown<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i;
  const length = heap.length;
  const halfLength = length >>> 1;
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex]; // 左子节点
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex]; // 右子节点, 不一定存在，需要判断是否存在
    if (compare(left, node) < 0) {
      // left < node
      if (rightIndex < length && compare(right, left) < 0) {
        // right 存在，且 right < left
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // right 不存在或 right >= left
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      // right 存在，且 right < node
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // 根节点最小
      return;
    }
  }
}

// 删除堆顶元素
export function pop<T extends Node>(heap: Heap<T>): T | null {
  if (heap.length === 0) return null;

  // 1. 取出堆顶元素
  const first = heap[0];
  // 2. 把最后一个元素放到堆顶
  const last = heap.pop()!;
  if (first !== last) {
    // heap 中有2个或者多个元素
    heap[0] = last;
    siftDown(heap, last, 0);
  }

  return first;
}

function compare(a: Node, b: Node) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
