interface DownloadFromWorkerDataInit {
  status: 'initiate'
  name: string
  file: string
}

interface DownloadFromWorkerDataProgress {
  status: 'progress'
  progress: number
  loaded: number
  total: number
  url: string
}

interface DownloadFromWorkerDataDone {
  status: 'done'
  file: string
  name: string
}

interface DownloadFromWorkerDataReady {
  status: 'ready'
}

type DownloadFromWorkerData =
  | DownloadFromWorkerDataInit
  | DownloadFromWorkerDataProgress
  | DownloadFromWorkerDataDone
  | DownloadFromWorkerDataReady

interface DownloadFromWorkerEvent {
  type: 'download'
  data: DownloadFromWorkerData
}

export type JobCompleteFromWorkerSimilarityData = {
  text: string
  score: number
  word: string
}[]

type JobCompleteFromWorkerData = JobCompleteFromWorkerSimilarityData

interface JobCompleteFromWorkerEvent {
  type: 'jobComplete'
  id: string
  data?: JobCompleteFromWorkerData
}

interface LoadToWorkerEvent {
  type: 'load'
}

interface ReadyFromWorkerEvent {
  type: 'ready'
}

interface EmbedToWorkerEvent {
  type: 'embedCorpus'
  id: string
  docs: string[]
}

interface SimilarityToWorkerEvent {
  type: 'similarity'
  id: string
  query: string
  // max number of results to return to the main thread
  k: number
}

export type TextEmbedderToWorkerEvent =
  | LoadToWorkerEvent
  | EmbedToWorkerEvent
  | SimilarityToWorkerEvent

export type TextEmbedderFromWorkerEvent =
  | DownloadFromWorkerEvent
  | ReadyFromWorkerEvent
  | JobCompleteFromWorkerEvent
