import {getSecondaryStatusValidationError} from '../validateTaskSecondaryStatus'

const row = {teamId: 'teamA', status: 'active'}

test('null row (id not provided) is valid', () => {
  expect(getSecondaryStatusValidationError(null, 'teamA', 'active')).toBeUndefined()
})

test('matching team and status is valid', () => {
  expect(getSecondaryStatusValidationError(row, 'teamA', 'active')).toBeUndefined()
})

test('missing row errors', () => {
  expect(getSecondaryStatusValidationError(undefined, 'teamA', 'active')).toBe(
    'Secondary status not found'
  )
})

test('wrong team errors', () => {
  expect(getSecondaryStatusValidationError(row, 'teamB', 'active')).toBe(
    'Secondary status belongs to a different team'
  )
})

test('wrong primary status errors', () => {
  expect(getSecondaryStatusValidationError(row, 'teamA', 'done')).toBe(
    'Secondary status is nested under a different primary status'
  )
})
