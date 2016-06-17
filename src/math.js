export const abs = Math.abs;
export const floor = Math.floor;
export const log = Math.log;
export const maxOf = (arr) => arr.reduce((m, c) => { return (c > m ? c : m); });
export const minOf = (arr) => arr.reduce((m, c) => { return (c < m ? c : m); });
export const pow = Math.pow;
export const sqrt = Math.sqrt;
export const medianOf = (arr) => {
  //arr = arr.sort((a, b) => { return (a > b ? a : b); });
  arr = arr.sort();
  const mid = floor(arr.length / 2);
  if (arr.length % 2 === 0) {
    return (arr[mid - 1] + arr[mid]) / 2;
  } else {
    return arr[mid];
  }
};
