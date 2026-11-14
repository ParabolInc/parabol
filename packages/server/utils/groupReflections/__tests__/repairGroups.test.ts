import {repairGroups} from '../repairGroups'

const inputs = (...ids: string[]) => ids.map((id) => ({id, text: id}))

test('passes a well-formed answer through untouched', () => {
  const parsed = {
    groups: [
      {title: 'Speed Up Reviews', reflectionIds: ['a', 'b']},
      {title: 'Fix Flaky Tests', reflectionIds: ['c']}
    ]
  }
  const result = repairGroups(parsed, inputs('a', 'b', 'c'))
  expect(result).toEqual({groups: parsed.groups, repaired: 0})
})

test('adds a forgotten reflection as its own group rather than failing the batch', () => {
  const parsed = {groups: [{title: 'Speed Up Reviews', reflectionIds: ['a', 'b']}]}
  const result = repairGroups(parsed, inputs('a', 'b', 'c'))
  expect(result).toEqual({
    groups: [
      {title: 'Speed Up Reviews', reflectionIds: ['a', 'b']},
      {title: '', reflectionIds: ['c']}
    ],
    repaired: 1
  })
})

test('drops ids that were never in the input', () => {
  const parsed = {groups: [{title: 'Speed Up Reviews', reflectionIds: ['a', 'hallucinated']}]}
  const result = repairGroups(parsed, inputs('a'))
  expect(result).toEqual({groups: [{title: 'Speed Up Reviews', reflectionIds: ['a']}], repaired: 0})
})

test('keeps only the first placement of a duplicated id', () => {
  const parsed = {
    groups: [
      {title: 'First', reflectionIds: ['a', 'b']},
      {title: 'Second', reflectionIds: ['b', 'c']}
    ]
  }
  const result = repairGroups(parsed, inputs('a', 'b', 'c'))
  expect(result).toEqual({
    groups: [
      {title: 'First', reflectionIds: ['a', 'b']},
      {title: 'Second', reflectionIds: ['c']}
    ],
    repaired: 0
  })
})

test('drops a group left empty after its ids were claimed elsewhere', () => {
  const parsed = {
    groups: [
      {title: 'First', reflectionIds: ['a']},
      {title: 'Duplicate', reflectionIds: ['a']}
    ]
  }
  const result = repairGroups(parsed, inputs('a'))
  expect(result).toEqual({groups: [{title: 'First', reflectionIds: ['a']}], repaired: 0})
})

test('splits an untitled group into singletons, since discuss has nothing to show', () => {
  const parsed = {groups: [{title: '', reflectionIds: ['a', 'b']}]}
  const result = repairGroups(parsed, inputs('a', 'b'))
  expect(result).toEqual({
    groups: [
      {title: '', reflectionIds: ['a']},
      {title: '', reflectionIds: ['b']}
    ],
    repaired: 0
  })
})

test('returns every reflection as a singleton when the model returns nothing usable', () => {
  const result = repairGroups({groups: []}, inputs('a', 'b'))
  expect(result).toEqual({
    groups: [
      {title: '', reflectionIds: ['a']},
      {title: '', reflectionIds: ['b']}
    ],
    repaired: 2
  })
})

test('gives up only when groups is not an array', () => {
  expect(repairGroups({groups: undefined as any}, inputs('a'))).toBeNull()
  expect(repairGroups({groups: 'nope' as any}, inputs('a'))).toBeNull()
})

test('skips a group whose reflectionIds is not an array', () => {
  const parsed = {groups: [{title: 'Bad', reflectionIds: 'a' as any}]}
  const result = repairGroups(parsed, inputs('a'))
  expect(result).toEqual({groups: [{title: '', reflectionIds: ['a']}], repaired: 1})
})

test('every input id appears exactly once no matter how mangled the answer is', () => {
  const parsed = {
    groups: [
      {title: 'A', reflectionIds: ['a', 'a', 'ghost']},
      {title: '', reflectionIds: ['b']},
      {title: 'C', reflectionIds: []}
    ]
  }
  const result = repairGroups(parsed, inputs('a', 'b', 'c', 'd'))!
  const placed = result.groups.flatMap((g) => g.reflectionIds)
  expect(placed.sort()).toEqual(['a', 'b', 'c', 'd'])
  expect(new Set(placed).size).toBe(4)
})
