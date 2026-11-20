import graphql from 'babel-plugin-relay/macro'
import {useCallback, useEffect, useRef, useState} from 'react'
import {fetchQuery} from 'react-relay'
import type {
  InspirationSourceInput,
  useGenerateInspirationItemsMutation$data
} from '../../../__generated__/useGenerateInspirationItemsMutation.graphql'
import type {useInspirationDraftIssuesQuery} from '../../../__generated__/useInspirationDraftIssuesQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useLocalStorageState from '../../../hooks/useLocalStorageState'
import useGenerateInspirationItemsMutation from '../../../mutations/useGenerateInspirationItemsMutation'
import getMutationError from '../../../utils/relay/getMutationError'

type Payload = useGenerateInspirationItemsMutation$data['generateInspirationItems']
type DraftedIssue = Payload['issues'][number]

export interface InspirationDraft {
  viewerId: string
  meetingId: string
  createdAt: number
  sources: InspirationSourceInput[]
  items: {
    id: string
    content: string
    promptId: string | null
    issues: Payload['inspirationItems'][number]['issues']
  }[]
  issues: DraftedIssue[]
  nextBefore?: string | null
  // A retro's timeline is listed, and the drafts the AI writes from its whole date range haven't arrived
  awaitingItems?: boolean
  // How many issues a retro's AI read, and how many its sources matched
  readCount?: number
  issueCount?: number
}

interface Options {
  meetingId: string
  isMeetingMember: boolean
  sources: InspirationSourceInput[]
  instructions: string
  canDraft: boolean
  isPaged?: boolean
  lifespanMs?: number
}

const issuesQuery = graphql`
  query useInspirationDraftIssuesQuery(
    $meetingId: ID!
    $sources: [InspirationSourceInput!]!
    $before: DateTime
  ) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on RetrospectiveMeeting {
          viewerInspirationIssues(sources: $sources, before: $before) {
            issues {
              service
              kind
              title
              url
              updatedAt
              importance
              unusedReason
            }
            nextBefore
          }
        }
      }
    }
  }
`

const DRAFT_LIFESPAN_MS = 5 * 60 * 1000

const toKey = (sources: readonly InspirationSourceInput[]) =>
  JSON.stringify(sources.map(({service, searchQuery}) => [service, searchQuery]))

const toItems = (inspirationItems: Payload['inspirationItems']) =>
  inspirationItems.map(({id, content, promptId, issues}) => ({
    id,
    content,
    promptId: promptId ?? null,
    issues
  }))

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong'

// The draft is never saved to the server. It is kept in local storage so a reload within a few
// minutes doesn't spend another AI request; after that, opening the drawer drafts again.
// A retro's timeline is paged: each page of issues shows as soon as it's listed, and older pages join
// the stored draft as the viewer scrolls. Once the newest page is listed, the AI reads the whole date
// range at once for the few things worth raising; a reload before its drafts arrive asks again.
// The draft is stale when the viewer's sources no longer match the searches it was written from.
// Opening the drawer on a stale draft redrafts once; after that a redraft waits for the viewer to
// finish changing a source or the settings, so toggling switches never burns an AI request each.
// Right after a meeting is created the viewer is not a member of it yet, and the server only drafts
// for members, so the first draft waits for the viewer to join.
const useInspirationDraft = (options: Options) => {
  const {
    meetingId,
    isMeetingMember,
    sources,
    instructions,
    canDraft,
    isPaged = false,
    lifespanMs = DRAFT_LIFESPAN_MS
  } = options
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const [generate, generating] = useGenerateInspirationItemsMutation()
  const [listing, setListing] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [olderError, setOlderError] = useState<string | null>(null)
  const [itemsFailure, setItemsFailure] = useState<{createdAt: number; message: string} | null>(
    null
  )
  const [storedDraft, setStoredDraft] = useLocalStorageState<InspirationDraft | null>(
    'Inspiration:draft:v2',
    null
  )
  const [openedAt] = useState(() => Date.now())
  const isKept =
    storedDraft?.viewerId === viewerId &&
    storedDraft.meetingId === meetingId &&
    storedDraft.createdAt > openedAt - lifespanMs
  const draft = isKept ? storedDraft : null
  const isStale = !draft || toKey(draft.sources) !== toKey(sources)
  const isLoadingNewest = isPaged ? listing : generating
  const userPrompt = instructions.trim() || null
  const itemsError =
    itemsFailure && itemsFailure.createdAt === draft?.createdAt ? itemsFailure.message : null
  const isDraftingItems =
    canDraft && !isStale && isMeetingMember && !!draft?.awaitingItems && !itemsError

  const listPage = async (pageSources: InspirationSourceInput[], before: string | null) => {
    const data = await fetchQuery<useInspirationDraftIssuesQuery>(
      atmosphere,
      issuesQuery,
      {meetingId, sources: pageSources, before},
      {fetchPolicy: 'network-only'}
    ).toPromise()
    const page = data?.viewer.meeting?.viewerInspirationIssues
    if (!page) throw new Error('Could not find your work right now. Please try again.')
    return page
  }

  // isLoadingNewest only flips on the next render, so effects that run in the same commit need this
  const isRequestingRef = useRef(false)
  const redraft = () => {
    if (isRequestingRef.current) return
    isRequestingRef.current = true
    setError(null)
    setOlderError(null)
    setItemsFailure(null)
    if (isPaged) {
      setListing(true)
      listPage(sources, null).then(
        (page) => {
          isRequestingRef.current = false
          setListing(false)
          setStoredDraft({
            viewerId,
            meetingId,
            createdAt: Date.now(),
            sources,
            items: [],
            issues: [...page.issues],
            nextBefore: page.nextBefore ?? null,
            awaitingItems: canDraft && page.issues.length > 0
          })
        },
        (e) => {
          isRequestingRef.current = false
          setListing(false)
          setError(toErrorMessage(e))
        }
      )
      return
    }
    generate({
      variables: {input: {meetingId, sources, userPrompt}},
      onError: (e) => {
        isRequestingRef.current = false
        setError(getMutationError(e).message)
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
          items: toItems(inspirationItems),
          issues: [...issues]
        })
      }
    })
  }

  // a redraft while a request was on its way replaced the timeline that request belongs to
  const updateTimeline = (
    createdAt: number,
    update: (prev: InspirationDraft) => InspirationDraft
  ) =>
    setStoredDraft((prev) =>
      prev?.createdAt === createdAt && prev.meetingId === meetingId ? update(prev) : prev
    )

  const draftingItemsRef = useRef<number | null>(null)
  const draftItems = (timeline: InspirationDraft) => {
    const {createdAt} = timeline
    if (draftingItemsRef.current === createdAt) return
    draftingItemsRef.current = createdAt
    const settle = () => {
      if (draftingItemsRef.current === createdAt) draftingItemsRef.current = null
    }
    const fail = (message: string) => {
      settle()
      setItemsFailure({createdAt, message})
    }
    generate({
      variables: {input: {meetingId, sources: timeline.sources, userPrompt}},
      onError: (e) => fail(getMutationError(e).message),
      onCompleted: (res, errors) => {
        if (errors) {
          fail(errors[0]?.message ?? 'Something went wrong')
          return
        }
        settle()
        const {inspirationItems, issues, issueCount} = res.generateInspirationItems
        updateTimeline(createdAt, (prev) => ({
          ...prev,
          items: toItems(inspirationItems),
          awaitingItems: false,
          readCount: issues.length,
          issueCount
        }))
      }
    })
  }

  const loadOlder = () => {
    if (!isPaged || !draft?.nextBefore || isStale || listing || loadingOlder) return
    const {createdAt, nextBefore} = draft
    setLoadingOlder(true)
    setOlderError(null)
    listPage(draft.sources, nextBefore).then(
      (page) => {
        setLoadingOlder(false)
        updateTimeline(createdAt, (prev) => ({
          ...prev,
          issues: [...prev.issues, ...page.issues],
          nextBefore: page.nextBefore ?? null
        }))
      },
      (e) => {
        setLoadingOlder(false)
        setOlderError(toErrorMessage(e))
      }
    )
  }

  const latest = useRef({redraft, draftItems, isStale, isLoadingNewest})
  latest.current = {redraft, draftItems, isStale, isLoadingNewest}
  const pendingRef = useRef(false)

  const [request, setRequest] = useState<{force: boolean} | null>(null)
  const requestRedraft = useCallback((force = false) => setRequest({force}), [])
  useEffect(() => {
    if (!request) return
    setRequest(null)
    if (!isMeetingMember) return
    if (!request.force && !latest.current.isStale) return
    if (latest.current.isLoadingNewest) {
      pendingRef.current = true
      return
    }
    latest.current.redraft()
  }, [request, isMeetingMember])

  useEffect(() => {
    if (isLoadingNewest || !pendingRef.current) return
    pendingRef.current = false
    if (latest.current.isStale) latest.current.redraft()
  }, [isLoadingNewest])

  useEffect(() => {
    if (isMeetingMember && latest.current.isStale) latest.current.redraft()
  }, [isMeetingMember])

  useEffect(() => {
    if (draft && isDraftingItems) latest.current.draftItems(draft)
  }, [draft?.createdAt, isDraftingItems])

  return {
    draft,
    requestRedraft,
    drafting: isLoadingNewest || (!isMeetingMember && isStale),
    draftingItems: isDraftingItems,
    error,
    itemsError,
    retryItems: () => setItemsFailure(null),
    hasOlder: isPaged && !!draft?.nextBefore && !isStale,
    loadOlder,
    loadingOlder,
    olderError
  }
}

export default useInspirationDraft
