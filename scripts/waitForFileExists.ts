import fs from 'fs'

const waitForFileExists = async (filePath: string, timeout = 5000, interval = 100) => {
  if (fs.existsSync(filePath)) return true
  if (timeout <= 0) return false
  await new Promise((resolve) => setTimeout(resolve, interval))
  return waitForFileExists(filePath, interval, timeout - interval)
}

export default waitForFileExists
