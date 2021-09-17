import sendToSentry from '../../utils/sendToSentry'

const catchAndLog = async <T extends (...args: any[]) => any>(riskyFn: T) => {
  try {
    return (await riskyFn()) as ReturnType<T>
  } catch (e) {
    const error = e instanceof Error ? e : new Error('catchAndLog failed')
    sendToSentry(error, {tags: {migration: 'postgres'}})
  }
  return null
}

export default catchAndLog
