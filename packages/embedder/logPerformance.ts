import {Logger} from '../server/utils/Logger'
/*
Every `logEvery` seconds log to the console the number of jobs completed per second for the last `resetEvery` logs
*/
export const logPerformance = (logEvery: number, resetEvery: number) => {
  const counter = {i: 0}
  let start = performance.now()
  let logs = 0
  let lastJobs = 0
  setInterval(() => {
    const duration = performance.now() - start
    const jobs = Math.round((counter.i / duration) * 1000)
    if (jobs !== lastJobs) {
      Logger.log(`Jobs per second: ${jobs}`)
    }
    lastJobs = jobs
    if (++logs >= resetEvery) {
      counter.i = 0
      logs = 0
      start = performance.now()
    }
  }, logEvery * 1000).unref()
  return counter
}
