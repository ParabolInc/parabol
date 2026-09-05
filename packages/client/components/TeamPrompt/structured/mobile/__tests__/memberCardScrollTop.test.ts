import memberCardScrollTop, {STICKY_HEADER_OFFSET} from '../memberCardScrollTop'

test('a card below the fold scrolls up to sit under the sticky header', () => {
  expect(memberCardScrollTop({containerScrollTop: 0, containerTop: 100, cardTop: 900})).toBe(
    800 - STICKY_HEADER_OFFSET
  )
})

test('an already scrolled container adds its own offset', () => {
  expect(memberCardScrollTop({containerScrollTop: 400, containerTop: 100, cardTop: 900})).toBe(
    1200 - STICKY_HEADER_OFFSET
  )
})

test('a card above the header offset never scrolls past the top', () => {
  expect(memberCardScrollTop({containerScrollTop: 0, containerTop: 100, cardTop: 120})).toBe(0)
})

test('the sticky header offset clears the chip row plus its padding', () => {
  expect(STICKY_HEADER_OFFSET).toBe(64)
})

test('an explicit offset overrides the sticky header default', () => {
  expect(
    memberCardScrollTop({containerScrollTop: 0, containerTop: 100, cardTop: 900, offset: 0})
  ).toBe(800)
  expect(
    memberCardScrollTop({containerScrollTop: 0, containerTop: 100, cardTop: 900, offset: 200})
  ).toBe(600)
})
