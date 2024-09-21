import { describe, expect, it } from "vitest";
import {
  scheduleCallback,
  NormalPriority,
  UserBlockingPriority,
  ImmediatePriority,
} from "../src/Scheduler";

describe("任务", () => {
  it("2个相同优先级任务", () => {
    let eventTasks: string[] = [];

    scheduleCallback(NormalPriority, () => {
      eventTasks.push("Task1");

      expect(eventTasks).toEqual(["Task1"]);

      return undefined;
    });

    scheduleCallback(NormalPriority, () => {
      eventTasks.push("Task2");

      expect(eventTasks).toEqual(["Task1", "Task2"]);

      return undefined;
    });
  });

  it("3个不同优先级任务", () => {
    let eventTasks: string[] = [];

    scheduleCallback(NormalPriority, () => {
      eventTasks.push("Task1");

      expect(eventTasks).toEqual(["Task3", "Task2", "Task1"]);

      return undefined;
    });

    scheduleCallback(UserBlockingPriority, () => {
      eventTasks.push("Task2");

      expect(eventTasks).toEqual(["Task3", "Task2"]);

      return undefined;
    });

    scheduleCallback(ImmediatePriority, () => {
      eventTasks.push("Task3");

      expect(eventTasks).toEqual(["Task3"]);

      return undefined;
    });
  });

  it("4个不同优先级的任务", () => {
    let eventTasks: string[] = [];

    scheduleCallback(NormalPriority, () => {
      eventTasks.push("Task1");

      expect(eventTasks).toEqual(["Task3", "Task2", "Task1"]);

      return undefined;
    });

    scheduleCallback(UserBlockingPriority, () => {
      eventTasks.push("Task2");

      expect(eventTasks).toEqual(["Task3", "Task2"]);

      return undefined;
    });

    scheduleCallback(ImmediatePriority, () => {
      eventTasks.push("Task3");

      expect(eventTasks).toEqual(["Task3"]);

      return undefined;
    });

    scheduleCallback(NormalPriority, () => {
      eventTasks.push("Task4");

      expect(eventTasks).toEqual(["Task3", "Task2", "Task1", "Task4"]);

      return undefined;
    });
  });
});
