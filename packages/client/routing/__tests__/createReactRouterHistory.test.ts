import {createMemoryHistory} from '@tanstack/react-router'
import {NavigationType} from 'react-router'
import createReactRouterHistory from '../createReactRouterHistory'

const setup = () => {
  const routerHistory = createMemoryHistory({initialEntries: ['/meetings']})
  return {routerHistory, history: createReactRouterHistory(routerHistory)}
}

test('a react-router push lands in the shared history with its state', () => {
  const {routerHistory, history} = setup()
  const updates: unknown[] = []
  history.listen((update) => updates.push(update))
  history.push({pathname: '/team/abc', search: '?archived=true', hash: '#tasks'}, {from: 'menu'})
  expect(routerHistory.location.href).toBe('/team/abc?archived=true#tasks')
  expect(history.action).toBe(NavigationType.Push)
  expect(history.location).toMatchObject({
    pathname: '/team/abc',
    search: '?archived=true',
    hash: '#tasks',
    state: {from: 'menu'}
  })
  expect(updates).toHaveLength(1)
})

test('a navigation made through TanStack Router reaches react-router listeners', () => {
  const {routerHistory, history} = setup()
  const pathnames: string[] = []
  history.listen(({action, location}) => pathnames.push(`${action} ${location.pathname}`))
  routerHistory.push('/me/tasks')
  routerHistory.replace('/me/profile')
  routerHistory.back()
  expect(pathnames).toEqual(['PUSH /me/tasks', 'REPLACE /me/profile', 'POP /meetings'])
  expect(history.location.state).toBeNull()
})

test('the location object stays the same until the history moves', () => {
  const {routerHistory, history} = setup()
  const before = history.location
  expect(history.location).toBe(before)
  routerHistory.push('/pages')
  expect(history.location).not.toBe(before)
  expect(history.createHref({pathname: '/pages', search: '?q=1'})).toBe('/pages?q=1')
})
