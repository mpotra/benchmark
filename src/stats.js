import {tTable} from './tables';
import {maxOf, minOf, medianOf, pow, sqrt} from './math';

/*******************************************************************************
 * computeStats
 ******************************************************************************/

function computeStats(times) {
  
  if (times.length <= 0) {
    return null;
  }
  
  const count = times.length;
  
  const totalTime = times.reduce((p, c) => p + c, 0);
  
  // Compute the sample mean (estimate of the population mean).
  const mean = totalTime / count;
  
  // Compute the sample variance (estimate of the population variance).
  const variance =
        times.reduce((sum, x) => sum + pow(x - mean, 2), 0) / (count - 1) || 0;

  // Compute the sample standard deviation
  // (estimate of the population standard deviation).
  const sd = sqrt(variance);
  
  // Compute the standard error of the mean (a.k.a. the standard deviation of
  // the sampling distribution of the sample mean).
  const sem = sd / sqrt(count);
  
  // Compute the degrees of freedom.
  const df = count - 1;
  
  // Compute the critical value.
  const critical = tTable[Math.round(df) || 1] || tTable.infinity;
  
  // Compute the margin of error.
  const moe = sem * critical;
  
  // Compute the relative margin of error.
  const rme = (moe / mean) * 100 || 0;
  
  // Compute the minimum of execution times.
  const minTime = minOf(times);
  
  // Compute the maximum of execution times.
  const maxTime = maxOf(times);
  
  // Compute the median of execution times.
  const mdn = medianOf(times);
  
  // Create samples from measurements closest to minimum, maximum and median,
  // accounting for margin of error.
  const minTimes = times.filter((v) => v <= minTime + moe);
  const maxTimes = times.filter((v) => v >= maxTime - moe);
  const mdnTimes = times.filter((v) => v >= mdn - moe && v <= mdn + moe);
  
  // Compute the number of total items used in samples.
  const totalTimesLength = minTimes.length + maxTimes.length + mdnTimes.length;
  
  // Sum measurements on all three samples.
  const minTimeSum = minTimes.reduce((p, c) => p + c, 0);
  const maxTimeSum = maxTimes.reduce((p, c) => p + c, 0);
  const mdnSum = mdnTimes.reduce((p, c) => p + c, 0);
  
  // Compute averages for each sample pool.
  const minTimeAvg = minTimeSum / minTimes.length;
  const maxTimeAvg = maxTimeSum / maxTimes.length;
  const mdnAvg = mdnSum / mdnTimes.length;
  
  // Compute the weight of minTime
  const minTimeWeight = (100 * minTimes.length / totalTimesLength) / 100;
  const maxTimeWeight = (100 * maxTimes.length / totalTimesLength) / 100;
  const mdnWeight = (100 * mdnTimes.length / totalTimesLength) / 100;
        
  // Compute the average, based on weights.
  const avg = (minTimeAvg * minTimeWeight +
              maxTimeAvg * maxTimeWeight +
              mdnAvg * mdnWeight);

  // Compute operations per second.
  const ops = 1e3 / avg;
  
  return {count, mean, variance,
          sd, sem, critical, moe, rme,
          minTime, minTimeWeight, maxTime, maxTimeWeight, totalTime, ops, avg};
}

export {computeStats};
