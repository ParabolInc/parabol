import {legacyPushProvenance} from '../legacyPushProvenance'

describe('legacyPushProvenance', () => {
  it('mirrors a Jira field push onto jiraFieldId', () => {
    expect(
      legacyPushProvenance({targetKind: 'field', service: 'jira', fieldId: 'customfield_1'})
    ).toEqual({jiraFieldId: 'customfield_1'})
  })

  it('mirrors a GitHub label push onto githubLabelName', () => {
    expect(
      legacyPushProvenance({targetKind: 'label', service: 'github', labelName: 'Effort: 3'})
    ).toEqual({githubLabelName: 'Effort: 3'})
  })

  it('mirrors a GitLab label push onto gitlabLabelId', () => {
    expect(
      legacyPushProvenance({
        targetKind: 'label',
        service: 'gitlab',
        labelId: 'gid://gitlab/Label/1'
      })
    ).toEqual({gitlabLabelId: 'gid://gitlab/Label/1'})
  })

  it.each(['jiraServer', 'azureDevOps', 'linear'] as const)(
    'has no legacy column for a %s field push',
    (service) => {
      expect(legacyPushProvenance({targetKind: 'field', service, fieldId: 'estimate'})).toEqual({})
    }
  )

  it('writes nothing when the push left no provenance', () => {
    expect(legacyPushProvenance(null)).toEqual({})
  })
})
