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

// 删除堆顶元素
export function pop() {}

function compare(a: Node, b: Node) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
