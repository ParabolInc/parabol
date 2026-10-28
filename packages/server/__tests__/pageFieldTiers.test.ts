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

test('An outsider sees only the profile of another user and the identity of their org', async () => {
  const {owner, outsider, childPageId} = await shareWithOutsider()
  const res = await sendPublic({
    query: `
      query AccessList($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            access {
              users {
                user {
                  id
                  preferredName
                  email
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
    `,
    variables: {pageId: childPageId},
    cookie: outsider.cookie
  })
  expect(res.errors).toBeUndefined()
  const {users} = res.data.public.page.access
  const ownerEntry = users.find(({user}: {user: {id: string}}) => user.id === owner.userId)
  expect(ownerEntry.user).toEqual({
    id: owner.userId,
    preferredName: expect.toBeString(),
    email: expect.toBeString(),
    tms: [],
    organizations: []
  })
  const outsiderEntry = users.find(({user}: {user: {id: string}}) => user.id === outsider.userId)
  expect(outsiderEntry.user.tms).toEqual([outsider.teamId])
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
