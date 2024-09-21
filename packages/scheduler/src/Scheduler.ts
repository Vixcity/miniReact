// 实现一个单线程任务调度器
import {
  PriorityLevel,
  NoPriority,
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
} from "./SchedulerPriorities";

type Callback = (args: boolean) => Callback | null | undefined;

// 任务池，最小堆结构
const taskQueue: Array<Task> = [];

let currentTask: Task | null = null;
let currentPriorityLevel: PriorityLevel = NoPriority;

// 任务调度器入口函数
function scheduleCallback(priorityLevel: PriorityLevel, callback: Callback) {
  // TODO: 实现调度器入口函数
}

// 取消某个任务，把 callback 设置为 null，当这个任务在堆顶的时候，删掉它
function cancelCallback() {
  currentTask.callback = null;
}

// 获取当前优先级
function getCurrentPriorityLevel(): PriorityLevel {
  return currentPriorityLevel;
}

// TODO: 实现 shouldYieldToHost 函数
function shouldYieldToHost() {}

export {
  PriorityLevel,
  NoPriority,
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
  scheduleCallback, // 某个任务进入调度器，等待调度
  cancelCallback, // 取消某个任务，由于最小堆没发直接删除，因此只能初步设置 task.callback 为 null
  getCurrentPriorityLevel, // 获取当前在执行任务的优先级
  shouldYieldToHost as shouldYield, // 把控制权交给主线程
};
