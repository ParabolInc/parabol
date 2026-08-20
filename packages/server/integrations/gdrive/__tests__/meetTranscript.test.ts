import {fetchMeetTranscript, processMeetTranscript} from '../meetTranscript'

const names = {'p/1': 'Ada Lovelace', 'p/2': 'Alan Turing'}

describe('processMeetTranscript', () => {
  it('groups consecutive entries by speaker and labels them', () => {
    const page = processMeetTranscript(
      [
        {participant: 'p/1', text: 'Hello there'},
        {participant: 'p/1', text: 'second line'},
        {participant: 'p/2', text: 'Hi Ada'},
        {participant: 'p/unknown', text: 'anon speaks'}
      ],
      names
    )!
    const s = JSON.stringify(page)
    expect(page.content[0]).toEqual({
      type: 'heading',
      attrs: {level: 1},
      content: [{type: 'text', text: 'Transcript'}]
    })
    expect(s).toContain('Ada Lovelace:')
    expect(s).toContain('Hello there second line')
    expect(s).toContain('Alan Turing:')
    expect(s).toContain('anon speaks')
    expect(page.content.filter((n) => n.type === 'paragraph')).toHaveLength(3)
  })

  it('returns null when there are no non-empty entries', () => {
    expect(processMeetTranscript([], names)).toBeNull()
    expect(processMeetTranscript([{participant: 'p/1', text: '   '}], names)).toBeNull()
  })
})

const makeFetch = (routes: Record<string, unknown>) =>
  (async (url: string) => {
    const key = Object.keys(routes)
      .filter((k) => url.includes(k))
      .sort((a, b) => b.length - a.length)[0]
    if (!key) return {ok: false, status: 404, json: async () => ({}), text: async () => 'no route'}
    return {
      ok: true,
      status: 200,
      json: async () => routes[key],
      text: async () => JSON.stringify(routes[key])
    }
  }) as unknown as typeof fetch

describe('fetchMeetTranscript', () => {
  const endedAt = new Date('2026-08-19T16:02:50Z')
  const twoRecords = {
    conferenceRecords: [
      {name: 'conferenceRecords/A', endTime: '2026-08-19T16:03:33Z'},
      {name: 'conferenceRecords/B', endTime: '2026-08-19T15:40:00Z'}
    ]
  }
  const transcriptRoutes = {
    'conferenceRecords/A/transcripts/t1/entries': {
      transcriptEntries: [{participant: 'conferenceRecords/A/participants/p1', text: 'hello world'}]
    },
    'conferenceRecords/A/transcripts': {
      transcripts: [
        {
          name: 'conferenceRecords/A/transcripts/t1',
          state: 'FILE_GENERATED',
          docsDestination: {document: 'doc1'}
        }
      ]
    },
    'conferenceRecords/A/participants': {
      participants: [
        {name: 'conferenceRecords/A/participants/p1', signedinUser: {displayName: 'Ada'}}
      ]
    }
  }

  it('finds the record whose transcript doc matches the Drive file and returns a page', async () => {
    const fetchImpl = makeFetch({'conferenceRecords?filter': twoRecords, ...transcriptRoutes})
    const page = await fetchMeetTranscript('tok', 'doc1', endedAt, {fetchImpl})
    expect(JSON.stringify(page)).toContain('Ada:')
    expect(JSON.stringify(page)).toContain('hello world')
  })

  it('scans past a nearer record whose transcript belongs to a different doc', async () => {
    const fetchImpl = makeFetch({
      'conferenceRecords?filter': {
        conferenceRecords: [
          {name: 'conferenceRecords/B', endTime: '2026-08-19T16:02:00Z'},
          {name: 'conferenceRecords/A', endTime: '2026-08-19T15:30:00Z'}
        ]
      },
      'conferenceRecords/B/transcripts': {
        transcripts: [
          {
            name: 'conferenceRecords/B/transcripts/t9',
            state: 'FILE_GENERATED',
            docsDestination: {document: 'otherDoc'}
          }
        ]
      },
      ...transcriptRoutes
    })
    const page = await fetchMeetTranscript('tok', 'doc1', endedAt, {fetchImpl})
    expect(JSON.stringify(page)).toContain('hello world')
  })

  it('returns null when no transcript points at the Drive file (e.g. the Gemini notes doc)', async () => {
    const fetchImpl = makeFetch({
      'conferenceRecords?filter': {conferenceRecords: twoRecords.conferenceRecords.slice(0, 1)},
      'conferenceRecords/A/transcripts': transcriptRoutes['conferenceRecords/A/transcripts']
    })
    expect(await fetchMeetTranscript('tok', 'notesDoc1', endedAt, {fetchImpl})).toBeNull()
  })

  it('returns null when no transcript is ready yet', async () => {
    const fetchImpl = makeFetch({
      'conferenceRecords?filter': {
        conferenceRecords: [{name: 'conferenceRecords/A', endTime: '2026-08-19T16:03:33Z'}]
      },
      'conferenceRecords/A/transcripts': {
        transcripts: [{name: 'x', state: 'STARTED', docsDestination: {document: 'doc1'}}]
      }
    })
    expect(await fetchMeetTranscript('tok', 'doc1', endedAt, {fetchImpl})).toBeNull()
  })

  it('returns null when there is no conference record in the window', async () => {
    const fetchImpl = makeFetch({'conferenceRecords?filter': {conferenceRecords: []}})
    expect(await fetchMeetTranscript('tok', 'doc1', endedAt, {fetchImpl})).toBeNull()
  })

  it('throws a status-tagged error on a non-2xx response', async () => {
    const fetchImpl = makeFetch({})
    await expect(fetchMeetTranscript('tok', 'doc1', endedAt, {fetchImpl})).rejects.toMatchObject({
      status: 404
    })
  })
})
