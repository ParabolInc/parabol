import planSuggestedGroupMerges, {type MergeableGroup} from '../smartGroup/planSuggestedGroupMerges'

const group = (
  id: string,
  reflectionIds: string[],
  sortOrder: number,
  titleIsUserDefined = false
): MergeableGroup => ({
  id,
  titleIsUserDefined,
  sortOrder,
  reflections: reflectionIds.map((reflectionId) => ({id: reflectionId}))
})

test('merges single cards into the first one on the board, with the suggested title', () => {
  const groups = [group('g1', ['a'], 2), group('g2', ['b'], 1), group('g3', ['c'], 3)]
  expect(
    planSuggestedGroupMerges([{title: 'Flaky Tests', reflectionIds: ['a', 'b', 'c']}], groups)
  ).toEqual([{targetGroupId: 'g2', sourceGroupIds: ['g1', 'g3'], title: 'Flaky Tests'}])
})

test('keeps a stack the team made whole and merges into it', () => {
  const groups = [group('g1', ['a'], 0), group('g2', ['b', 'c'], 1)]
  expect(planSuggestedGroupMerges([{title: 'CI', reflectionIds: ['a', 'b', 'c']}], groups)).toEqual(
    [{targetGroupId: 'g2', sourceGroupIds: ['g1'], title: 'CI'}]
  )
})

test('skips a suggestion that would split a stack', () => {
  const groups = [group('g1', ['a'], 0), group('g2', ['b', 'c'], 1)]
  expect(planSuggestedGroupMerges([{title: 'CI', reflectionIds: ['a', 'b']}], groups)).toEqual([])
})

test('keeps the name a team gave its group', () => {
  const groups = [group('g1', ['a'], 0), group('g2', ['b'], 1, true)]
  expect(planSuggestedGroupMerges([{title: 'CI', reflectionIds: ['a', 'b']}], groups)).toEqual([
    {targetGroupId: 'g2', sourceGroupIds: ['g1'], title: null}
  ])
})

test('skips a suggestion that would merge two groups the team named', () => {
  const groups = [group('g1', ['a'], 0, true), group('g2', ['b'], 1, true)]
  expect(planSuggestedGroupMerges([{title: 'CI', reflectionIds: ['a', 'b']}], groups)).toEqual([])
})

test('skips suggestions already satisfied and ignores deleted cards', () => {
  const groups = [group('g1', ['a', 'b'], 0), group('g2', ['c'], 1)]
  expect(
    planSuggestedGroupMerges(
      [
        {title: 'Done', reflectionIds: ['a', 'b']},
        {title: null, reflectionIds: ['c', 'gone']}
      ],
      groups
    )
  ).toEqual([])
})
