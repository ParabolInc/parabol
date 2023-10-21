import {
  JobCompleteFromWorkerSimilarityData,
  TextEmbedderFromWorkerEvent,
  TextEmbedderToWorkerEvent
} from './TextEmbedder.d'

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export class TextEmbedder {
  worker: Worker
  workerPromise: Promise<void>
  jobs: Record<string, (value: any) => void> = {}
  doneCount = 0
  async loadWorker() {
    if (this.workerPromise) return this.workerPromise
    this.worker = new Worker(new URL('./textEmbedderWorker.ts', import.meta.url), {type: 'module'})
    this.workerPromise = new Promise<void>((resolveWorker) => {
      this.worker.onmessage = (e: MessageEvent<TextEmbedderFromWorkerEvent>) => {
        const {data} = e
        if (!data) return
        const {type} = data
        switch (type) {
          case 'ready':
            resolveWorker()
          case 'jobComplete':
            const {id, ...payload} = data
            const resolveJob = this.jobs[id]
            delete this.jobs[id]
            resolveJob?.(data.data)
            break
          default:
        }
      }
      this.worker.postMessage({type: 'load'})
    })
    return this.workerPromise
  }

  async dispatch<TReturn>(payload: DistributiveOmit<TextEmbedderToWorkerEvent, 'id'>) {
    await this.loadWorker()
    return new Promise<TReturn>((resolve) => {
      const id = Math.random().toString(36).substring(5)
      this.jobs[id] = resolve
      this.worker.postMessage({...payload, id})
    })
  }

  // `terminate` is not needed because the worker will be GC'd when the last reference to it is removed
  async embedCorpus(docs: string[]) {
    return this.dispatch({type: 'embedCorpus', docs})
  }

  async similarity(query: string) {
    return this.dispatch<JobCompleteFromWorkerSimilarityData>({
      type: 'similarity',
      query,
      k: 5
    })
  }
}
