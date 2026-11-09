import parseClickUpIntegrationHash from '../parseClickUpIntegrationHash'

test('parseClickUpIntegrationHash reads the workspace and task ids', () => {
  expect(parseClickUpIntegrationHash('9012345::86abc123')).toEqual({
    service: 'clickup',
    workspaceId: '9012345',
    taskId: '86abc123'
  })
})

test.each(['1::../../x', 'abc::x', '1::', ':::', '1::a::b', '1::../../team/2'])(
  'parseClickUpIntegrationHash rejects %p',
  (integrationHash) => {
    expect(parseClickUpIntegrationHash(integrationHash)).toBeNull()
  }
)
