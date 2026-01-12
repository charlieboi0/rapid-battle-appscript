/**
 * Wraps a function to log its execution time.
 * @param fn The function to wrap.
 * @returns A wrapped function.
 */
function timeLogger(fn: Function): Function {
  return function(...args: any) {
    const name = fn.name || 'anonymous';
    const start = new Date().getTime();
    const result = fn(...args);
    const end = new Date().getTime();
    Logger.log(`Function "${name}" executed in ${end - start} ms`);
    return result;
  }
}