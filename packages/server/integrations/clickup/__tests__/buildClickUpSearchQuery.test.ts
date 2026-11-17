import buildClickUpSearchQuery from '../buildClickUpSearchQuery'

test('buildClickUpSearchQuery trims the query and sorts the list ids', () => {
  expect(buildClickUpSearchQuery(' login ', {listIds: ['2', '1']})).toEqual({
    queryString: 'login',
    listIds: ['1', '2']
  })
})

test('buildClickUpSearchQuery rejects a meta key it does not know, naming it', () => {
  const query = buildClickUpSearchQuery('login', {listIds: [], spaceIds: ['10']})
  expect(query).toBeInstanceOf(Error)
  expect(query).toMatchObject({message: expect.stringContaining('spaceIds')})
})

test.each([
  ['missing listIds', {}],
  ['a non-string list id', {listIds: [1000]}]
])('buildClickUpSearchQuery rejects %s', (_label, meta) => {
  expect(buildClickUpSearchQuery('login', meta)).toBeInstanceOf(Error)
})
