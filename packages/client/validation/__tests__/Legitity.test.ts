import Legitity from '../Legitity'

test('Legitity.max succeeds with undefined', async () => {
  const legitity = new Legitity(undefined).max(12, 'too long')
  expect(legitity.error).toBe(undefined)
})

test('Legitity.max fails with message when too long', async () => {
  const legitity = new Legitity('Haftpflichtversicherung').max(12, 'too long')
  expect(legitity.error).toBe('too long')
})

test('Legitity.max passes with max length', async () => {
  const legitity = new Legitity('123').max(3, 'too long')
  expect(legitity.error).toBe(undefined)
})

test('Legitity.max fails with max length + 1', async () => {
  const legitity = new Legitity('1234').max(3, 'too long')
  expect(legitity.error).toBe('too long')
})

test('Legitity.min succeeds with undefined', async () => {
  const legitity = new Legitity(undefined).min(2, 'too short')
  expect(legitity.error).toBe(undefined)
})

test('Legitity.min fails with message when too long', async () => {
  const legitity = new Legitity('a').min(2, 'too short')
  expect(legitity.error).toBe('too short')
})

test('Legitity.min succeeds with min length', async () => {
  const legitity = new Legitity('123').min(3, 'too short')
  expect(legitity.error).toBe(undefined)
})

test('Legitity.min fails with min length - 1', async () => {
  const legitity = new Legitity('12').min(3, 'too short')
  expect(legitity.error).toBe('too short')
})
