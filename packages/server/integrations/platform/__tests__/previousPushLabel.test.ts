import {previousPushLabelId, previousPushLabelName} from '../previousPushLabel'

describe('previousPushLabel', () => {
  it('reads the GitHub label name', () => {
    const pushResult = {targetKind: 'label', service: 'github', labelName: 'Effort: 3'} as const
    expect(previousPushLabelName(pushResult)).toBe('Effort: 3')
    expect(previousPushLabelId(pushResult)).toBeNull()
  })
  it('reads the GitLab label id', () => {
    const pushResult = {
      targetKind: 'label',
      service: 'gitlab',
      labelId: 'gid://gitlab/Label/1'
    } as const
    expect(previousPushLabelId(pushResult)).toBe('gid://gitlab/Label/1')
    expect(previousPushLabelName(pushResult)).toBeNull()
  })
  it('ignores field pushes and null', () => {
    expect(
      previousPushLabelName({targetKind: 'field', service: 'jira', fieldId: 'customfield_1'})
    ).toBeNull()
    expect(previousPushLabelId(null)).toBeNull()
  })
})
