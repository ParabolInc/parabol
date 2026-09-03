import {previousPushLabelId, previousPushLabelName} from '../previousPushLabel'

describe('previousPushLabel', () => {
  it('reads the GitHub label name', () => {
    const estimate = {pushService: 'github', pushTargetId: 'Effort: 3'} as const
    expect(previousPushLabelName(estimate)).toBe('Effort: 3')
    expect(previousPushLabelId(estimate)).toBeNull()
  })
  it('reads the GitLab label id', () => {
    const estimate = {pushService: 'gitlab', pushTargetId: 'gid://gitlab/Label/1'} as const
    expect(previousPushLabelId(estimate)).toBe('gid://gitlab/Label/1')
    expect(previousPushLabelName(estimate)).toBeNull()
  })
  it('ignores field pushes and unpushed estimates', () => {
    expect(previousPushLabelName({pushService: 'jira', pushTargetId: 'customfield_1'})).toBeNull()
    expect(previousPushLabelId({pushService: null, pushTargetId: null})).toBeNull()
  })
})
