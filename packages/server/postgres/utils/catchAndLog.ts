import sendToSentry from '../../utils/sendToSentry'

const catchAndLog = async <T extends (...args: any[]) => any>(riskyFn: T) => {
  try {
    return (await riskyFn()) as ReturnType<T>
  } catch (e) {
    sendToSentry(e, {tags: {migration: 'postgres'}})
  }
  return null
}

export default catchAndLog
