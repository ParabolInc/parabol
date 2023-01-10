import Legitity from '../Legitity'

test('Legitity.max succeeds with undefined', async () => {
  const legitity = new Legitity(undefined).max(12, 'too long')
  expect(legitity.error).toBe(undefined)
})

test('Legitity.max fails with message when too long', async () => {
  const legitity = new Legitity('Haftpflichtversicherung').max(12, 'too long')
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
