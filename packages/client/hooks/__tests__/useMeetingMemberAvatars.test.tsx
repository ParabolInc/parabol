import {Window} from 'happy-dom'
import {useState} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {FRAGMENTS_KEY} from 'relay-runtime'
import mockMeetingFragment, {
  type useMeetingMemberAvatars_meeting$key
} from '../../__generated__/useMeetingMemberAvatars_meeting.graphql'
import {providerManager} from '../../tiptap/providerManager'
import useMeetingMemberAvatars from '../useMeetingMemberAvatars'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => mockMeetingFragment
}))
jest.mock('@hocuspocus/provider', () => {
  type Listener = (payload?: unknown) => void
  class HocuspocusProvider {
    awareness = null
    isAttached = false
    listeners: Record<string, Set<Listener>> = {}
    constructor({onAuthenticationFailed}: {onAuthenticationFailed?: Listener}) {
      if (onAuthenticationFailed) this.on('authenticationFailed', onAuthenticationFailed)
    }
    on(eventName: string, listener: Listener) {
      this.listeners[eventName] ??= new Set()
      this.listeners[eventName].add(listener)
    }
    off(eventName: string, listener: Listener) {
      this.listeners[eventName]?.delete(listener)
    }
    emit(eventName: string, payload?: unknown) {
      this.listeners[eventName]?.forEach((listener) => listener(payload))
    }
    attach() {
      this.isAttached = true
    }
    detach() {
      this.isAttached = false
    }
    destroy() {
      this.listeners = {}
      this.isAttached = false
    }
  }
  class HocuspocusProviderWebsocket {}
  return {HocuspocusProvider, HocuspocusProviderWebsocket}
})
jest.mock('../../Atmosphere', () => ({
  __esModule: true,
  default: {closeHandlers: new Set(), current: null}
}))
jest.mock('../useAtmosphere', () => ({
  __esModule: true,
  default: () => ({authObj: null, viewerId: 'viewer'})
}))

type IntersectionCallback = (entries: {intersectionRatio: number}[]) => void
const intersectionCallbacks = new Map<Element, IntersectionCallback>()
class MockIntersectionObserver {
  callback: IntersectionCallback
  constructor(callback: IntersectionCallback) {
    this.callback = callback
  }
  observe(element: Element) {
    intersectionCallbacks.set(element, this.callback)
  }
  unobserve(element: Element) {
    intersectionCallbacks.delete(element)
  }
  disconnect() {}
}

const happyWindow = new Window({url: 'https://parabol.test/'})
const tick = () => new Promise((resolve) => setTimeout(resolve, 10))
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const waitUntil = async (isDone: () => boolean, timeoutMs = 3000) => {
  const deadline = Date.now() + timeoutMs
  while (!isDone() && Date.now() < deadline) await tick()
}

const meetingIds = Array.from({length: 150}, (_, idx) => `meeting${idx}`)
const meetingRefFor = (meetingId: string): useMeetingMemberAvatars_meeting$key => ({
  ' $fragmentSpreads': {useMeetingMemberAvatars_meeting: true},
  [FRAGMENTS_KEY]: {useMeetingMemberAvatars_meeting: {id: meetingId, meetingMembers: []}}
})
const MeetingCardStandIn = ({meetingId}: {meetingId: string}) => {
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null)
  useMeetingMemberAvatars(meetingRefFor(meetingId), cardElement)
  return <div ref={setCardElement} data-meeting-id={meetingId} />
}

let container: HTMLDivElement
let root: Root
const setOnScreen = (onScreenMeetingIds: string[], isOnScreen: boolean) => {
  onScreenMeetingIds.forEach((meetingId) => {
    const cardElement = container.querySelector(`[data-meeting-id="${meetingId}"]`)!
    intersectionCallbacks.get(cardElement)?.([{intersectionRatio: isOnScreen ? 1 : 0}])
  })
}
const getRegisteredMeetingDocs = () =>
  Object.entries(providerManager.providers)
    .filter(([documentName, {count}]) => documentName.startsWith('meeting:') && count > 0)
    .map(([documentName]) => documentName)
    .sort()
const toMeetingDocs = (someMeetingIds: string[]) =>
  someMeetingIds.map((meetingId) => `meeting:${meetingId}`).sort()
const isRegisteredExactly = (someMeetingIds: string[]) =>
  getRegisteredMeetingDocs().join() === toMeetingDocs(someMeetingIds).join()

beforeAll(() => {
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
    IntersectionObserver: MockIntersectionObserver
  })
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

beforeEach(async () => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  root.render(
    <>
      {meetingIds.map((meetingId) => (
        <MeetingCardStandIn key={meetingId} meetingId={meetingId} />
      ))}
    </>
  )
  await waitUntil(() => intersectionCallbacks.size === meetingIds.length)
})

afterEach(() => {
  root.unmount()
  container.remove()
  intersectionCallbacks.clear()
  Object.values(providerManager.providers).forEach((entry) => {
    entry.count = 0
  })
  Object.keys(providerManager.providers).forEach((documentName) => {
    providerManager.destroy(documentName)
  })
})

test('a dashboard of 150 open meetings only opens the meeting docs of the cards on screen', async () => {
  expect(intersectionCallbacks.size).toBe(150)
  const firstScreen = meetingIds.slice(0, 12)
  setOnScreen(firstScreen, true)
  await sleep(100)
  expect(getRegisteredMeetingDocs()).toEqual([])
  await waitUntil(() => isRegisteredExactly(firstScreen))
  expect(getRegisteredMeetingDocs()).toEqual(toMeetingDocs(firstScreen))
  expect(Object.keys(providerManager.providers)).toHaveLength(firstScreen.length)
})

test('scrolling opens the docs of the cards that stay in view and releases the ones that left', async () => {
  const firstScreen = meetingIds.slice(0, 12)
  const secondScreen = meetingIds.slice(12, 24)
  const scrolledPast = meetingIds.slice(100, 112)
  setOnScreen(firstScreen, true)
  await waitUntil(() => isRegisteredExactly(firstScreen))
  setOnScreen(firstScreen, false)
  setOnScreen(secondScreen, true)
  setOnScreen(scrolledPast, true)
  await sleep(100)
  setOnScreen(scrolledPast, false)
  await waitUntil(() => isRegisteredExactly(secondScreen))
  expect(getRegisteredMeetingDocs()).toEqual(toMeetingDocs(secondScreen))
  firstScreen.forEach((meetingId) => {
    expect(providerManager.providers[`meeting:${meetingId}`]?.count).toBe(0)
  })
  scrolledPast.forEach((meetingId) => {
    expect(providerManager.providers[`meeting:${meetingId}`]).toBeUndefined()
  })
})

test('a meeting doc the server denies stops sending, but a denied page keeps its place on the socket', () => {
  const meetingProvider = providerManager.register('meeting:denied')
  const pageProvider = providerManager.register('page:9')
  expect(meetingProvider.isAttached).toBe(true)
  expect(pageProvider.isAttached).toBe(true)
  const deny = (provider: typeof meetingProvider) => {
    ;(provider as unknown as {emit: (eventName: string, payload: unknown) => void}).emit(
      'authenticationFailed',
      {reason: 'Unauthorized'}
    )
  }
  deny(meetingProvider)
  deny(pageProvider)
  expect(meetingProvider.isAttached).toBe(false)
  expect(pageProvider.isAttached).toBe(true)
})
