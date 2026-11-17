import isEmptyTipTapDoc from '../../../shared/tiptap/isEmptyTipTapDoc'

interface DraftCandidate {
  userId: string
  sharedAt?: string | null
  content: string
}

const countUnsharedDrafts = (responses: readonly DraftCandidate[], viewerId: string) =>
  responses.filter(
    ({userId, sharedAt, content}) =>
      userId === viewerId && !sharedAt && !isEmptyTipTapDoc(JSON.parse(content))
  ).length

export default countUnsharedDrafts
