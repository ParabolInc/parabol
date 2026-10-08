import RepoAccess from '../../platform/RepoAccess'
import resolveAzureDevOpsWorkItemProject from '../resolveAzureDevOpsWorkItemProject'

const INSTANCE_ID = 'dev.azure.com/acme'
const WEB_PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const BILLING_PROJECT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'

const sharesWeb = new RepoAccess('selected', [
  {id: `${INSTANCE_ID}:${WEB_PROJECT_ID}`, name: 'Web'}
])
const sharesEverything = new RepoAccess('all', [])

const workItemIn = (projectSegment: string | null, projectName: string | null) => ({
  url: projectSegment
    ? `https://${INSTANCE_ID}/${projectSegment}/_apis/wit/workItems/42`
    : `https://${INSTANCE_ID}/_apis/wit/workItems/42`,
  fields: projectName === null ? {} : {'System.TeamProject': projectName}
})

describe('resolveAzureDevOpsWorkItemProject', () => {
  it('resolves a work item whose URL names a shared project by GUID', () => {
    expect(
      resolveAzureDevOpsWorkItemProject(sharesWeb, INSTANCE_ID, workItemIn(WEB_PROJECT_ID, 'Web'))
    ).toEqual({projectId: WEB_PROJECT_ID, projectName: 'Web'})
  })

  it('reports the current project name, not the one saved with the grant', () => {
    expect(
      resolveAzureDevOpsWorkItemProject(
        sharesWeb,
        INSTANCE_ID,
        workItemIn(WEB_PROJECT_ID, 'Web Renamed')
      )
    ).toEqual({projectId: WEB_PROJECT_ID, projectName: 'Web Renamed'})
  })

  it('rejects a GUID that is not shared, even when its name matches a shared project', () => {
    expect(
      resolveAzureDevOpsWorkItemProject(
        sharesWeb,
        INSTANCE_ID,
        workItemIn(BILLING_PROJECT_ID, 'Web')
      )
    ).toBeNull()
  })

  it('rejects a shared GUID reached through another organization', () => {
    expect(
      resolveAzureDevOpsWorkItemProject(
        sharesWeb,
        'dev.azure.com/globex',
        workItemIn(WEB_PROJECT_ID, 'Web')
      )
    ).toBeNull()
  })

  it.each([
    ['the URL has no project segment', null],
    ['the URL names the project instead of its GUID', 'Web']
  ])('falls back to the shared project of the same name when %s', (_label, projectSegment) => {
    expect(
      resolveAzureDevOpsWorkItemProject(sharesWeb, INSTANCE_ID, workItemIn(projectSegment, 'web'))
    ).toEqual({projectId: WEB_PROJECT_ID, projectName: 'web'})
  })

  it('rejects a name that matches a shared project of another organization', () => {
    expect(
      resolveAzureDevOpsWorkItemProject(sharesWeb, 'dev.azure.com/globex', workItemIn(null, 'Web'))
    ).toBeNull()
  })

  it.each([
    ['names an unshared project', 'Billing'],
    ['carries no project name', null]
  ])('rejects a work item without a GUID that %s', (_label, projectName) => {
    expect(
      resolveAzureDevOpsWorkItemProject(sharesWeb, INSTANCE_ID, workItemIn(null, projectName))
    ).toBeNull()
  })

  it('accepts any project when the connection shares everything', () => {
    expect(
      resolveAzureDevOpsWorkItemProject(
        sharesEverything,
        INSTANCE_ID,
        workItemIn(BILLING_PROJECT_ID, 'Billing')
      )
    ).toEqual({projectId: BILLING_PROJECT_ID, projectName: 'Billing'})
    expect(
      resolveAzureDevOpsWorkItemProject(sharesEverything, INSTANCE_ID, workItemIn(null, 'Billing'))
    ).toEqual({projectId: 'Billing', projectName: 'Billing'})
  })

  it('cannot place a work item with neither a GUID nor a name, even when sharing everything', () => {
    expect(
      resolveAzureDevOpsWorkItemProject(sharesEverything, INSTANCE_ID, workItemIn(null, null))
    ).toBeNull()
  })

  it('compares the instance id and the GUID without regard to case', () => {
    const sharesMixedCase = new RepoAccess('selected', [
      {id: `dev.azure.com/Acme:${WEB_PROJECT_ID.toUpperCase()}`, name: 'Web'}
    ])
    expect(
      resolveAzureDevOpsWorkItemProject(
        sharesMixedCase,
        'dev.azure.com/ACME',
        workItemIn(WEB_PROJECT_ID, 'Web')
      )
    ).toEqual({projectId: WEB_PROJECT_ID, projectName: 'Web'})
    expect(
      resolveAzureDevOpsWorkItemProject(
        sharesMixedCase,
        'dev.azure.com/ACME',
        workItemIn(null, 'Web')
      )
    ).toEqual({projectId: WEB_PROJECT_ID.toUpperCase(), projectName: 'Web'})
  })
})
