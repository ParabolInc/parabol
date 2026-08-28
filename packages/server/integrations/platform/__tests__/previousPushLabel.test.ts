import {previousPushLabelId, previousPushLabelName} from '../previousPushLabel'

describe('previousPushLabel', () => {
  it('reads the GitHub label name', () => {
    expect(previousPushLabelName({targetKind: 'label', labelName: 'Effort: 3'})).toBe('Effort: 3')
    expect(previousPushLabelId({targetKind: 'label', labelName: 'Effort: 3'})).toBeNull()
  })
  it('reads the GitLab label id', () => {
    expect(previousPushLabelId({targetKind: 'label', labelId: 'gid://gitlab/Label/1'})).toBe(
      'gid://gitlab/Label/1'
    )
    expect(previousPushLabelName({targetKind: 'label', labelId: 'gid://gitlab/Label/1'})).toBeNull()
  })
  it('ignores field pushes and null', () => {
    expect(previousPushLabelName({targetKind: 'field', fieldId: 'customfield_1'})).toBeNull()
    expect(previousPushLabelId(null)).toBeNull()
  })
})
