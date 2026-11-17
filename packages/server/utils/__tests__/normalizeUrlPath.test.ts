import normalizeUrlPath from '../normalizeUrlPath'

test('ids become placeholders and the route around them stays', () => {
  expect(normalizeUrlPath('/meet/UZoObZMXvy/discuss/1')).toBe('/meet/:id/discuss/1')
  expect(normalizeUrlPath('/team/7Xk2abQz9/settings')).toBe('/team/:id/settings')
  expect(normalizeUrlPath('/pages/retro-notes-a1b2c3')).toBe('/pages/:id')
  expect(normalizeUrlPath('/me/organizations')).toBe('/me/organizations')
  expect(normalizeUrlPath('/rest/api/3/issue')).toBe('/rest/api/3/issue')
})
