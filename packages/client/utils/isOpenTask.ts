import isTaskPrivate from './isTaskPrivate'

export interface ReviewableTask {
  readonly status: string
  readonly tags: readonly string[]
}

const isOpenTask = ({status, tags}: ReviewableTask) =>
  status !== 'done' && !isTaskPrivate(tags) && !tags.includes('archived')

export default isOpenTask
