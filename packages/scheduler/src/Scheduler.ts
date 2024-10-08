// 实现一个单线程任务调度器
import { getCurrentTime, isFn } from "../../shared/utils";
import {
  lowPriorityTimeout,
  maxSigned31BitInt,
  normalPriorityTimeout,
  userBlockingPriorityTimeout,
} from "./SchedulerFeatureFlags";
import { peek, pop, push } from "./SchedulerMinHeap";
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

export type Task = {
  id: number;
  callback: Callback | null;
  priorityLevel: PriorityLevel;
  startTime: number;
  expirationTime: number;
  sortIndex: number;
};

// 任务池，最小堆结构
const taskQueue: Array<Task> = [];

// 标记 task 的唯一性
let taskIdCounter = 0;

let currentTask: Task | null = null;
let currentPriorityLevel: PriorityLevel = NoPriority;

// 记录时间切片的起始值，时间戳
let startTime = -1;
// 时间切片，这个是函数可执行的时间段
let frameInterval = 5;
// 记录是否正在执行任务，是否有work在进行
// 锁，防止重复调度
let isPreformingWork = false;
// 主线程是否被调度
let isHostCallbackScheduled = false;

let isMessageLoopRunning = false;

function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;

  if (timeElapsed < frameInterval) {
    return false;
  }

  return true;
}

// 任务调度器入口函数
function scheduleCallback(priorityLevel: PriorityLevel, callback: Callback) {
  const startTime = getCurrentTime();

  let timeout: number;
  switch (priorityLevel) {
    case ImmediatePriority:
      // 立马超时，SVVVVVVVIP
      timeout = -1;
      break;
    case UserBlockingPriority:
      // 最终超时，VIP
      timeout = userBlockingPriorityTimeout;
      break;
    case IdlePriority:
      // 永不超时
      timeout = maxSigned31BitInt;
      break;
    case LowPriority:
      // 最终超时
      timeout = lowPriorityTimeout;
      break;
    default:
      timeout = normalPriorityTimeout;
      break;
  }

  // 过期时间，理论上是等待任务执行的时间
  const expirationTime = startTime + timeout;

  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime: startTime,
    expirationTime,
    sortIndex: -1,
  };

  newTask.sortIndex = expirationTime;
  push(taskQueue, newTask);

  if (!isHostCallbackScheduled && !isPreformingWork) {
    isHostCallbackScheduled = true;
    requestHostCallback();
  }
}

// 请求主线程调度
function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

// 处理任务队列，执行任务，直到没有任务可以执行
const performWorkUntilDeadline = () => {
  if (!isMessageLoopRunning) {
    const currentTime = getCurrentTime();
    startTime = currentTime; // 记录时间切片(work)的起始值，时间戳
    let hasMoreWork = true;
    try {
      hasMoreWork = flushWork(currentTime);
    } finally {
      if (hasMoreWork) {
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
      }
    }
  }
};

// 创建宏任务
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;
// 执行函数是在这里的
function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}

// 处理任务队列，执行任务，直到没有任务可以执行
function flushWork(initialTime: number): boolean {
  isHostCallbackScheduled = false;
  isPreformingWork = true;
  let previousPriorityLevel = currentPriorityLevel;

  try {
    return workLoop(initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPreformingWork = false;
  }
}

// 取消某个任务，把 callback 设置为 null，当这个任务在堆顶的时候，删掉它
function cancelCallback() {
  currentTask!.callback = null;
}

// 获取当前优先级
function getCurrentPriorityLevel(): PriorityLevel {
  return currentPriorityLevel;
}

// 有很多task，每个task都有callback，执行完callback后，会把自己从堆中删除，然后执行下一个task，直到所有task都执行完
// 一个work就是一个时间切片执行的一些task， workLoop就是一个循环，不断的执行work，直到所有task都执行完
// 返回true表示有任务需要继续执行，false表示没有任务需要继续执行
function workLoop(initialTime: number): boolean {
  let currentTime = initialTime;
  currentTask = peek(taskQueue); // 取出当前任务

  while (currentTask !== null) {
    // 判断任务是否过期，过期则控制权交还给主线程
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break;
    }

    // 执行任务
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      // 有效的任务
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout);
      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback;
        return true;
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
    } else {
      pop(taskQueue);
    }
    currentTask = peek(taskQueue); // 更新 currentTask
  }

  if (currentTask !== null) {
    return true;
  } else {
    return false;
  }
}

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
