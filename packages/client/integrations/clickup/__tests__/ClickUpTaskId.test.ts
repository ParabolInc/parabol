import ClickUpTaskId from '../shared/ClickUpTaskId'

describe('ClickUpTaskId', () => {
  it('round-trips join and split', () => {
    const integrationHash = ClickUpTaskId.join('9012345', '86abc123')
    expect(integrationHash).toBe('9012345::86abc123')
    expect(ClickUpTaskId.split(integrationHash)).toEqual({
      workspaceId: '9012345',
      taskId: '86abc123'
    })
  })

  it.each(['1::../../x', 'abc::x', '1::', ':::', '1::a::b'])('rejects %p', (integrationHash) => {
    expect(ClickUpTaskId.split(integrationHash)).toBeNull()
  })
})
