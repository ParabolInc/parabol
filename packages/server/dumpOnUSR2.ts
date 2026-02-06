import dumpHeap from './graphql/private/mutations/dumpHeap'

process.on('SIGUSR2', () => {
  dumpHeap({}, {isDangerous: true}, {} as any, {} as any)
})
