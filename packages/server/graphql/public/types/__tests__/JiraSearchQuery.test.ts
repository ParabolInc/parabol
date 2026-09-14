jest.mock('../../rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import JiraSearchQuery from '../JiraSearchQuery'

const resolve = (resolver: unknown, source: unknown) => {
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(source)
}

test('Jira Cloud filter ids resolve to their project keys', () => {
  const source = {
    service: 'jira',
    query: {queryString: '', isJQL: false, projectKeyFilters: ['cloud1:WEB', 'cloud1:OPS']}
  }
  expect(resolve(JiraSearchQuery.projectKeyFilterLabels, source)).toEqual(['WEB', 'OPS'])
})

test('Jira Data Center filter ids resolve to their project keys', () => {
  const source = {
    service: 'jiraServer',
    query: {queryString: '', isJQL: false, projectKeyFilters: ['jiraServer:9:10001:WEB']}
  }
  expect(resolve(JiraSearchQuery.projectKeyFilterLabels, source)).toEqual(['WEB'])
})

test('a malformed Jira Data Center filter falls back to the raw filter', () => {
  const source = {
    service: 'jiraServer',
    query: {queryString: '', isJQL: false, projectKeyFilters: ['jiraServer:9']}
  }
  expect(resolve(JiraSearchQuery.projectKeyFilterLabels, source)).toEqual(['jiraServer:9'])
})
