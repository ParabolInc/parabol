import {buildMeetingSeriesSlug, parseMeetingSeriesIdFromSlug} from '../meetingSeriesSlug'

// The gcal description URL embeds `<title-slug>-<id>` for a meeting series.
// `parseMeetingSeriesIdFromSlug` must always recover the original DB id regardless of
// what the title looks like, otherwise the link breaks after a rename and any
// historical slug becomes unreachable. These tests pin that round-trip invariant.

describe('buildMeetingSeriesSlug / parseMeetingSeriesIdFromSlug', () => {
  test('round-trips a simple id+title', () => {
    const slug = buildMeetingSeriesSlug(42, 'Weekly Standup')
    expect(slug).toBe('weekly-standup-42')
    expect(parseMeetingSeriesIdFromSlug(slug)).toBe(42)
  })

  test.each([
    ['title with hyphens', 'sprint-retro-q4'],
    ['title with double hyphens', 'foo--bar'],
    ['title that is all hyphens', '---'],
    ['title with numbers', 'standup 2026'],
    ['title with unicode', 'café meeting 🎉'],
    ['title with leading/trailing spaces', '  trim me  '],
    ['empty title', ''],
    ['title that slugs to empty', '   '],
    ['title with just punctuation', '!@#$%'],
    ['very long title', 'a'.repeat(200)]
  ])('round-trips id with %s', (_label, title) => {
    const id = 9999
    const slug = buildMeetingSeriesSlug(id, title)
    expect(parseMeetingSeriesIdFromSlug(slug)).toBe(id)
  })

  test.each([
    ['minimum id', 1],
    ['small id', 100],
    ['large id near uint32 ceiling', 0xfffffffe]
  ])('round-trips id across the uint32 range: %s', (_label, id) => {
    const slug = buildMeetingSeriesSlug(id, 'test')
    expect(parseMeetingSeriesIdFromSlug(slug)).toBe(id)
  })

  test('emits a bare id when the title produces no slug chars', () => {
    const slug = buildMeetingSeriesSlug(7, '   ')
    expect(slug).toBe('7')
    expect(parseMeetingSeriesIdFromSlug(slug)).toBe(7)
  })

  test('survives a title change: old slug still resolves to the same id', () => {
    const id = 12345
    const oldSlug = buildMeetingSeriesSlug(id, 'Weekly Standup')
    const newSlug = buildMeetingSeriesSlug(id, 'Sprint Retro')

    expect(parseMeetingSeriesIdFromSlug(oldSlug)).toBe(id)
    expect(parseMeetingSeriesIdFromSlug(newSlug)).toBe(id)

    const idFromOld = oldSlug.slice(oldSlug.lastIndexOf('-') + 1)
    const idFromNew = newSlug.slice(newSlug.lastIndexOf('-') + 1)
    expect(idFromOld).toBe(idFromNew)
  })
})

describe('parseMeetingSeriesIdFromSlug — rejects malformed input', () => {
  test('returns null for slug with non-numeric trailing segment', () => {
    expect(parseMeetingSeriesIdFromSlug('weekly-standup-foo')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(parseMeetingSeriesIdFromSlug('')).toBeNull()
  })

  test('returns null for slug with no numeric portion', () => {
    expect(parseMeetingSeriesIdFromSlug('only-words-no-number')).toBeNull()
  })

  test('returns null for slug ending in trailing dash', () => {
    expect(parseMeetingSeriesIdFromSlug('weekly-standup-')).toBeNull()
  })
})
