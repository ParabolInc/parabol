import {buildMeetingSeriesSlug, parseMeetingSeriesSlug} from '../meetingSeriesSlug'

// The gcal description URL embeds `<title-slug>-<cipher>` for a meeting series.
// `parseMeetingSeriesSlug` must always recover the original DB id regardless of
// what the title looks like, otherwise the link breaks after a rename and any
// historical slug becomes unreachable. These tests pin that round-trip invariant.

describe('buildMeetingSeriesSlug / parseMeetingSeriesSlug', () => {
  test('round-trips a simple id+title', () => {
    const slug = buildMeetingSeriesSlug(42, 'Weekly Standup')
    expect(slug).toMatch(/^weekly-standup-\d+$/)
    expect(parseMeetingSeriesSlug(slug)).toBe(42)
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
    expect(parseMeetingSeriesSlug(slug)).toBe(id)
  })

  test.each([
    ['minimum id', 1],
    ['small id', 100],
    ['large id near uint32 ceiling', 0xfffffffe]
  ])('round-trips id across the uint32 range: %s', (_label, id) => {
    const slug = buildMeetingSeriesSlug(id, 'test')
    expect(parseMeetingSeriesSlug(slug)).toBe(id)
  })

  test('emits a slug-less form when the title produces no slug chars', () => {
    // When title is empty/whitespace-only/punctuation-only the function omits the
    // leading dash to avoid `-1234567890` (which parseMeetingSeriesSlug would still
    // accept, but is uglier). Verify the shape explicitly.
    const slug = buildMeetingSeriesSlug(7, '   ')
    expect(slug).toMatch(/^\d+$/)
    expect(parseMeetingSeriesSlug(slug)).toBe(7)
  })

  test('survives a title change: old slug still resolves to the same id', () => {
    const id = 12345
    const oldSlug = buildMeetingSeriesSlug(id, 'Weekly Standup')
    const newSlug = buildMeetingSeriesSlug(id, 'Sprint Retro')

    // Both slugs share the trailing cipher (the only field that matters for routing).
    expect(parseMeetingSeriesSlug(oldSlug)).toBe(id)
    expect(parseMeetingSeriesSlug(newSlug)).toBe(id)

    const cipherFromOld = oldSlug.slice(oldSlug.lastIndexOf('-') + 1)
    const cipherFromNew = newSlug.slice(newSlug.lastIndexOf('-') + 1)
    expect(cipherFromOld).toBe(cipherFromNew)
  })
})

describe('parseMeetingSeriesSlug — rejects malformed input', () => {
  test('returns null for slug with non-numeric trailing segment', () => {
    expect(parseMeetingSeriesSlug('weekly-standup-foo')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(parseMeetingSeriesSlug('')).toBeNull()
  })

  test('returns null for slug with no cipher portion', () => {
    expect(parseMeetingSeriesSlug('only-words-no-number')).toBeNull()
  })

  test('returns null for slug ending in trailing dash', () => {
    expect(parseMeetingSeriesSlug('weekly-standup-')).toBeNull()
  })
})
