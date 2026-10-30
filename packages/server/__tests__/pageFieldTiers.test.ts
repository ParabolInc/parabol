import type {Doc, XmlElement, YXmlEvent} from 'yjs'
import {createPageLinkElement} from '../../client/shared/tiptap/createPageLinkElement'
import getKysely from '../postgres/getKysely'
import {sendPublic, sendTipTap, signUp} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const createLinkedChildPage = async (cookie: string, parentPageId: string) => {
  const childPageCode = await sendTipTap({cookie, pageId: parentPageId}, async (document: Doc) => {
    return new Promise((resolve) => {
      const frag = document.getXmlFragment('default')
      const pageLinkBlock = createPageLinkElement(-1, '<Untitled>', false)
      pageLinkBlock.observe((e: YXmlEvent) => {
        for (const [key] of e.keys) {
          if (key === 'pageCode') {
            resolve(pageLinkBlock.getAttribute('pageCode'))
          }
        }
      })
      frag.insert(1, [pageLinkBlock as XmlElement])
    })
  })
  return `page:${childPageCode}`
}

const shareWithOutsider = async () => {
  const [owner, outsider] = await Promise.all([signUp(), signUp()])
  const parentPage = await sendPublic({
    query: `
      mutation CreatePage($teamId: ID) {
        createPage(teamId: $teamId) {
          page {
            id
          }
        }
      }
    `,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const parentPageId = parentPage.data.createPage.page.id as string
  const childPageId = await createLinkedChildPage(owner.cookie, parentPageId)
  const shared = await sendPublic({
    query: `
      mutation UpdatePageAccess($pageId: ID!, $subjectId: ID!) {
        updatePageAccess(pageId: $pageId, subjectType: user, subjectId: $subjectId, role: viewer) {
          pageSection
        }
      }
    `,
    variables: {pageId: childPageId, subjectId: outsider.userId},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  return {owner, outsider, parentPageId, childPageId}
}

test('An outsider sees only the preview fields of an ancestor page', async () => {
  const {owner, outsider, parentPageId, childPageId} = await shareWithOutsider()
  const res = await sendPublic({
    query: `
      query Breadcrumbs($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            id
            ancestors {
              id
              title
              teamId
              userId
              isPrivate
              sortOrder
              ancestorIds
              access {
                viewer
                users {
                  role
                }
                pendingRequests {
                  role
                }
              }
              team {
                id
                name
                isViewerOnTeam
                teamMembers {
                  id
                }
                agendaItems {
                  id
                }
              }
            }
          }
        }
      }
    `,
    variables: {pageId: childPageId},
    cookie: outsider.cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.public.page.ancestors).toEqual([
    {
      id: parentPageId,
      title: '',
      teamId: owner.teamId,
      userId: null,
      isPrivate: null,
      sortOrder: null,
      ancestorIds: [],
      access: {viewer: null, users: [], pendingRequests: []},
      team: {
        id: owner.teamId,
        name: expect.toBeString(),
        isViewerOnTeam: false,
        teamMembers: [],
        agendaItems: []
      }
    }
  ])
})

const ACCESS_LIST_USERS = `
  query AccessList($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        access {
          users {
            user {
              id
              preferredName
              email
              lastSeenAt
              isConnected
              inactive
              tms
              organizations {
                id
              }
            }
          }
        }
      }
    }
  }
`

type AccessListUser = {user: {id: string}}

test('An outsider sees only the profile of another user and the identity of their org', async () => {
  const {owner, outsider, childPageId} = await shareWithOutsider()
  const res = await sendPublic({
    query: ACCESS_LIST_USERS,
    variables: {pageId: childPageId},
    cookie: outsider.cookie
  })
  expect(res.errors).toBeUndefined()
  const {users} = res.data.public.page.access
  const ownerEntry = users.find(({user}: AccessListUser) => user.id === owner.userId)
  expect(ownerEntry.user).toEqual({
    id: owner.userId,
    preferredName: expect.toBeString(),
    email: expect.toBeString(),
    lastSeenAt: null,
    isConnected: null,
    inactive: null,
    tms: [],
    organizations: []
  })
  const outsiderEntry = users.find(({user}: AccessListUser) => user.id === outsider.userId)
  expect(outsiderEntry.user).toMatchObject({
    lastSeenAt: expect.toBeString(),
    tms: [outsider.teamId]
  })
})

const joinTeam = async (
  host: {cookie: string; teamId: string},
  guest: {cookie: string; email: string}
) => {
  const invited = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          invitees {
            status
          }
        }
      }
    `,
    variables: {teamId: host.teamId, invitees: [guest.email]},
    cookie: host.cookie
  })
  expect(invited.errors).toBeUndefined()
  const invitation = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('teamId', '=', host.teamId)
    .where('email', '=', guest.email)
    .executeTakeFirstOrThrow()
  const accepted = await sendPublic({
    query: `
      mutation AcceptTeamInvitation($invitationToken: ID!) {
        acceptTeamInvitation(invitationToken: $invitationToken) {
          error {
            message
          }
        }
      }
    `,
    variables: {invitationToken: invitation.token},
    cookie: guest.cookie
  })
  expect(accepted.data.acceptTeamInvitation.error).toBeNull()
  // the new token carries the team, & the response's set-cookie isn't a valid cookie header
  const setCookie: string = accepted.cookie ?? guest.cookie
  const token = setCookie.split('__Host-Http-authToken=')[1]?.split(';')[0]
  expect(token).toBeTruthy()
  return `__Host-Http-authToken=${token}`
}

test('Someone in the same org sees presence, someone outside it does not', async () => {
  const [owner, outsider, teammate] = await Promise.all([signUp(), signUp(), signUp()])
  const teammateCookie = await joinTeam(owner, teammate)
  const created = await sendPublic({
    query: `
      mutation CreatePage($teamId: ID) {
        createPage(teamId: $teamId) {
          page {
            id
          }
        }
      }
    `,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const pageId = created.data.createPage.page.id as string
  const shared = await sendPublic({
    query: `
      mutation UpdatePageAccess($pageId: ID!, $subjectId: ID!) {
        updatePageAccess(pageId: $pageId, subjectType: user, subjectId: $subjectId, role: viewer) {
          pageSection
        }
      }
    `,
    variables: {pageId, subjectId: outsider.userId},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  const res = await sendPublic({
    query: ACCESS_LIST_USERS,
    variables: {pageId},
    cookie: teammateCookie
  })
  expect(res.errors).toBeUndefined()
  const {users} = res.data.public.page.access
  const ownerEntry = users.find(({user}: AccessListUser) => user.id === owner.userId)
  expect(ownerEntry.user).toMatchObject({lastSeenAt: expect.toBeString(), inactive: false})
  const outsiderEntry = users.find(({user}: AccessListUser) => user.id === outsider.userId)
  expect(outsiderEntry.user).toMatchObject({
    lastSeenAt: null,
    isConnected: null,
    inactive: null
  })
})

test('Anyone with the public link reads the page, but only those granted access see who has it', async () => {
  const [owner, collaborator, stranger] = await Promise.all([signUp(), signUp(), signUp()])
  const created = await sendPublic({
    query: `
      mutation CreatePage($teamId: ID) {
        createPage(teamId: $teamId) {
          page {
            id
          }
        }
      }
    `,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const pageId = created.data.createPage.page.id as string
  const share = async (subjectType: string, subjectId: string) => {
    const shared = await sendPublic({
      query: `
        mutation UpdatePageAccess($pageId: ID!, $subjectType: PageSubjectEnum!, $subjectId: ID!) {
          updatePageAccess(pageId: $pageId, subjectType: $subjectType, subjectId: $subjectId, role: viewer) {
            pageSection
          }
        }
      `,
      variables: {pageId, subjectType, subjectId},
      cookie: owner.cookie
    })
    expect(shared.errors).toBeUndefined()
  }
  await share('user', collaborator.userId)
  await share('external', 'page-guest@example.com')
  await share('external', '*')
  const readAccess = (cookie?: string) =>
    sendPublic({
      query: `
        query PageAccessLists($pageId: ID!) {
          public {
            page(pageId: $pageId) {
              id
              isPrivate
              access {
                viewer
                public
                users {
                  role
                }
                guests {
                  email
                }
                teams {
                  role
                }
                organizations {
                  role
                }
              }
            }
          }
        }
      `,
      variables: {pageId},
      cookie
    })
  const linkOnlyAccess = {
    viewer: null,
    public: 'viewer',
    users: [],
    guests: [],
    teams: [],
    organizations: []
  }
  for (const res of [await readAccess(), await readAccess(stranger.cookie)]) {
    expect(res.errors).toBeUndefined()
    expect(res.data.public.page).toEqual({id: pageId, isPrivate: false, access: linkOnlyAccess})
  }
  const granted = await readAccess(collaborator.cookie)
  expect(granted.errors).toBeUndefined()
  expect(granted.data.public.page.access).toMatchObject({
    viewer: 'viewer',
    users: [expect.anything(), expect.anything()],
    guests: [{email: 'page-guest@example.com'}],
    teams: [expect.anything()]
  })
})

test('The owner reads every field of the same page', async () => {
  const {owner, childPageId, parentPageId} = await shareWithOutsider()
  const res = await sendPublic({
    query: `
      query Breadcrumbs($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            ancestors {
              id
              userId
              isPrivate
              access {
                viewer
                users {
                  role
                }
              }
              team {
                teamMembers {
                  id
                }
                tier
              }
            }
          }
        }
      }
    `,
    variables: {pageId: childPageId},
    cookie: owner.cookie
  })
  expect(res.errors).toBeUndefined()
  const [ancestor] = res.data.public.page.ancestors
  expect(ancestor).toMatchObject({
    id: parentPageId,
    userId: owner.userId,
    isPrivate: false,
    access: {viewer: 'owner', users: [{role: 'owner'}]},
    team: {teamMembers: [expect.anything()], tier: expect.toBeString()}
  })
})
