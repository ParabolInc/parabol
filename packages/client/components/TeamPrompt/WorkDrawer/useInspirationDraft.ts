import {useCallback, useEffect, useRef, useState} from 'react'
import type {
  InspirationSourceInput,
  useGenerateInspirationItemsMutation$data
} from '../../../__generated__/useGenerateInspirationItemsMutation.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useLocalStorageState from '../../../hooks/useLocalStorageState'
import useGenerateInspirationItemsMutation from '../../../mutations/useGenerateInspirationItemsMutation'

type Payload = useGenerateInspirationItemsMutation$data['generateInspirationItems']

export interface InspirationDraft {
  viewerId: string
  meetingId: string
  createdAt: number
  sources: InspirationSourceInput[]
  items: {id: string; content: string; promptId: string | null}[]
  issues: Payload['issues'][number][]
}

interface Options {
  meetingId: string
  isMeetingMember: boolean
  sources: InspirationSourceInput[]
  instructions: string
}

const DRAFT_LIFESPAN_MS = 5 * 60 * 1000

const toKey = (sources: readonly InspirationSourceInput[]) =>
  JSON.stringify(sources.map(({service, searchQuery}) => [service, searchQuery]))

// The draft is never saved to the server. It is kept in local storage so a reload within a few
// minutes doesn't spend another AI request; after that, opening the drawer drafts again.
// The draft is stale when the viewer's sources no longer match the searches it was written from.
// Opening the drawer on a stale draft redrafts once; after that a redraft waits for the viewer to
// finish changing a source or the settings, so toggling switches never burns an AI request each.
// Right after a meeting is created the viewer is not a member of it yet, and the server only drafts
// for members, so the first draft waits for the viewer to join.
const useInspirationDraft = (options: Options) => {
  const {meetingId, isMeetingMember, sources, instructions} = options
  const {viewerId} = useAtmosphere()
  const [generate, drafting] = useGenerateInspirationItemsMutation()
  const [error, setError] = useState<string | null>(null)
  const [storedDraft, setStoredDraft] = useLocalStorageState<InspirationDraft | null>(
    'Inspiration:draft',
    null
  )
  const [openedAt] = useState(() => Date.now())
  const isKept =
    storedDraft?.viewerId === viewerId &&
    storedDraft.meetingId === meetingId &&
    storedDraft.createdAt > openedAt - DRAFT_LIFESPAN_MS
  const draft = isKept ? storedDraft : null
  const isStale = !draft || toKey(draft.sources) !== toKey(sources)

  // drafting only flips on the next render, so effects that run in the same commit need this
  const isRequestingRef = useRef(false)
  const redraft = () => {
    if (isRequestingRef.current) return
    isRequestingRef.current = true
    setError(null)
    generate({
      variables: {input: {meetingId, sources, userPrompt: instructions.trim() || null}},
      onError: (e) => {
        isRequestingRef.current = false
        setError(e.message)
      },
      onCompleted: (res, errors) => {
        isRequestingRef.current = false
        if (errors) {
          setError(errors[0]?.message ?? 'Something went wrong')
          return
        }
        const {inspirationItems, issues} = res.generateInspirationItems
        setStoredDraft({
          viewerId,
          meetingId,
          createdAt: Date.now(),
          sources,
          items: inspirationItems.map(({id, content, promptId}) => ({
            id,
            content,
            promptId: promptId ?? null
          })),
          issues: [...issues]
        })
      }
    })
  }
  const latest = useRef({redraft, isStale, drafting})
  latest.current = {redraft, isStale, drafting}
  const pendingRef = useRef(false)

  const [request, setRequest] = useState<{force: boolean} | null>(null)
  const requestRedraft = useCallback((force = false) => setRequest({force}), [])
  useEffect(() => {
    if (!request) return
    setRequest(null)
    if (!isMeetingMember) return
    if (!request.force && !latest.current.isStale) return
    if (latest.current.drafting) {
      pendingRef.current = true
      return
    }
    latest.current.redraft()
  }, [request, isMeetingMember])

  useEffect(() => {
    if (drafting || !pendingRef.current) return
    pendingRef.current = false
    if (latest.current.isStale) latest.current.redraft()
  }, [drafting])

  useEffect(() => {
    if (isMeetingMember && latest.current.isStale) latest.current.redraft()
  }, [isMeetingMember])

  return {draft, requestRedraft, drafting: drafting || (!isMeetingMember && isStale), error}
}

export default useInspirationDraft
