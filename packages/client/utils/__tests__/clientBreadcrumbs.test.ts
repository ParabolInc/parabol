const loadBreadcrumbs = () => {
  jest.resetModules()
  return import('../clientBreadcrumbs')
}

test('keeps only the 30 most recent breadcrumbs', async () => {
  const {addBreadcrumb, getBreadcrumbs} = await loadBreadcrumbs()
  for (let i = 0; i < 35; i++) addBreadcrumb('navigation', `/team/${i}`)
  const breadcrumbs = getBreadcrumbs()
  expect(breadcrumbs).toHaveLength(30)
  expect(breadcrumbs[0]).toMatchObject({type: 'navigation', message: '/team/5'})
  expect(breadcrumbs.at(-1)).toMatchObject({message: '/team/34'})
})

test('the last trace id is the one from the most recent operation', async () => {
  const {addBreadcrumb, getLastTraceId} = await loadBreadcrumbs()
  expect(getLastTraceId()).toBeUndefined()
  addBreadcrumb('operation', 'query TeamQuery', '4bf92f3577b34da6a3ce929d0e0e4736')
  addBreadcrumb('operation', 'mutation UpdateTeamName', '0af7651916cd43dd8448eb211c80319c')
  addBreadcrumb('navigation', '/team/abc')
  expect(getLastTraceId()).toBe('0af7651916cd43dd8448eb211c80319c')
})
