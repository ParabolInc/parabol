import {legacyPushProvenance} from '../legacyPushProvenance'

describe('legacyPushProvenance', () => {
  it('mirrors a Jira field push onto jiraFieldId', () => {
    expect(legacyPushProvenance('jira', {targetKind: 'field', fieldId: 'customfield_1'})).toEqual({
      jiraFieldId: 'customfield_1'
    })
  })

  it('mirrors a GitHub label push onto githubLabelName', () => {
    expect(legacyPushProvenance('github', {targetKind: 'label', labelName: 'Effort: 3'})).toEqual({
      githubLabelName: 'Effort: 3'
    })
  })

  it('mirrors a GitLab label push onto gitlabLabelId', () => {
    expect(
      legacyPushProvenance('gitlab', {targetKind: 'label', labelId: 'gid://gitlab/Label/1'})
    ).toEqual({gitlabLabelId: 'gid://gitlab/Label/1'})
  })

  it('has no legacy column for an Azure DevOps field push', () => {
    expect(
      legacyPushProvenance('azureDevOps', {targetKind: 'field', fieldId: 'StoryPoints'})
    ).toEqual({})
  })

  it('writes nothing when the push left no provenance', () => {
    expect(legacyPushProvenance('jira', null)).toEqual({})
  })
})
