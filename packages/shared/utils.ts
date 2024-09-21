export function getCurrentTime(): number {
  return performance.now();
}

export function isArray(sth: any) {
  return Array.isArray(sth);
}

export function isObject(sth: any) {
  return typeof sth === "object" && sth !== null;
}

export function isFn(sth: any) {
  return typeof sth === "function";
}

export function isStr(sth: any) {
  return typeof sth === "string";
}
