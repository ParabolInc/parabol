import {toPrefixTsQuery} from '../toPrefixTsQuery'

it.each([
  ['retro notes', 'retro:* & notes:*'],
  ['Retr', 'retr:*'],
  ['retro retro', 'retro:*'],
  [`'"); DROP & | !:*`, 'drop:*'],
  ['会議 メモ', '会議:* & メモ:*'],
  [
    'one two three four five six seven eight nine',
    'one:* & two:* & three:* & four:* & five:* & six:* & seven:* & eight:*'
  ],
  ['हिंदी', 'हिंदी:*'],
  ['नमस्ते दुनिया', 'नमस्ते:* & दुनिया:*'],
  ['ค้นหา', 'ค้นหา:*'],
  ['İstanbul', 'istanbul:*']
])('turns %p into %p', (query, expected) => expect(toPrefixTsQuery(query)).toBe(expected))

it.each(['', '   ', 'a b', '𠮷'])('returns null for %p', (query) =>
  expect(toPrefixTsQuery(query)).toBeNull()
)
