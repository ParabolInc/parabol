import {Logger} from '../server/utils/Logger'
/*
Every `logEvery` seconds log to the console the number of jobs completed per second for the last `resetEvery` seconds
*/
export const logPerformance = (logEvery: number, resetEvery: number) => {
  const counter = {i: 0}
  let start = performance.now()
  setInterval(() => {
    const duration = performance.now() - start
    Logger.log(`Jobs per second: ${Math.round((counter.i / duration) * 1000)}, ${counter.i}`)
  }, logEvery * 1000)

  setInterval(() => {
    console.log('reset')
    counter.i = 0
    start = performance.now()
  }, resetEvery * 1000)
  return counter
}
