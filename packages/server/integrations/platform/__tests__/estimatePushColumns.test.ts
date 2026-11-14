import {estimatePushColumns} from '../estimatePushColumns'

describe('estimatePushColumns', () => {
  it('writes a Jira field push to the typed columns and jiraFieldId', () => {
    expect(
      estimatePushColumns({service: 'jira', target: 'field', targetId: 'customfield_1'})
    ).toEqual({
      pushService: 'jira',
      pushTarget: 'field',
      pushTargetId: 'customfield_1',
      jiraFieldId: 'customfield_1'
    })
  })

  it('writes a GitHub label push to the typed columns and githubLabelName', () => {
    expect(
      estimatePushColumns({service: 'github', target: 'label', targetId: 'Effort: 3'})
    ).toEqual({
      pushService: 'github',
      pushTarget: 'label',
      pushTargetId: 'Effort: 3',
      githubLabelName: 'Effort: 3'
    })
  })

  it('writes a GitLab label push to the typed columns and gitlabLabelId', () => {
    expect(
      estimatePushColumns({service: 'gitlab', target: 'label', targetId: 'gid://gitlab/Label/1'})
    ).toEqual({
      pushService: 'gitlab',
      pushTarget: 'label',
      pushTargetId: 'gid://gitlab/Label/1',
      gitlabLabelId: 'gid://gitlab/Label/1'
    })
  })

  it.each(['jiraServer', 'azureDevOps', 'linear'] as const)(
    'has no legacy column for a %s field push',
    (service) => {
      expect(estimatePushColumns({service, target: 'field', targetId: 'estimate'})).toEqual({
        pushService: service,
        pushTarget: 'field',
        pushTargetId: 'estimate'
      })
    }
  )

  it('writes nulls when the push left no provenance', () => {
    expect(estimatePushColumns(null)).toEqual({
      pushService: null,
      pushTarget: null,
      pushTargetId: null
    })
  })
})
