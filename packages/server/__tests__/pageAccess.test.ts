import faker from 'faker'
import type {Doc, YXmlEvent} from 'yjs'
import {createPageLinkElement} from '../../client/shared/tiptap/createPageLinkElement'
import getKysely from '../postgres/getKysely'
import {sendPublic, sendTipTap, signUp, signUpWithEmail} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const UPDATE_PAGE_ACCESS = `
  mutation UpdatePageAccess(
    $pageId: ID!
    $subjectType: PageSubjectEnum!
    $subjectId: ID!
    $role: PageRoleEnum
    $unlinkApproved: Boolean
  ) {
    updatePageAccess(
      pageId: $pageId
      subjectType: $subjectType
      subjectId: $subjectId
      role: $role
      unlinkApproved: $unlinkApproved
    ) {
      page {
        id
        isParentLinked
        access {
          public
          guests {
            email
          }
          users {
            user {
              id
            }
          }
          teams {
            team {
              id
            }
          }
          organizations {
            organization {
              id
            }
          }
        }
      }
    }
  }
    `
test('Access propagates to linked children', async () => {
  const [user1, user2] = await Promise.all([signUp(), signUp()])
  const {authToken} = user1

  const parentPage = await sendPublic({
    query: `
      mutation CreatePage {
        createPage {
          page {
            id
          }
        }
      }
    `,
    variables: {},
    authToken
  })

  expect(parentPage).toMatchObject({
    data: {
      createPage: {
        page: {
          id: expect.anything()
        }
      }
    }
  })
  const parentPageId = parentPage.data.createPage.page.id

  const childPageCode = await sendTipTap(
    {authToken, pageId: parentPageId},
    async (document: Doc) => {
      return new Promise((resolve) => {
        const frag = document.getXmlFragment('default')
        const pageLinkBlock = createPageLinkElement(-1, '<Untitled>')
        pageLinkBlock.observe((e: YXmlEvent) => {
          for (const [key] of e.keys) {
            if (key === 'pageCode') {
              const pageCode = pageLinkBlock.getAttribute('pageCode')
              resolve(pageCode)
            }
          }
        })
        frag.insert(1, [pageLinkBlock] as any)
      })
    }
  )
  const childPageId = `page:${childPageCode}`
  const childPage = {childPageId}

  expect(childPage).toMatchObject({
    childPageId: expect.toBeString()
  })

  const pageUpdatesUser = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: parentPageId,
      subjectType: 'user',
      subjectId: user2.userId,
      role: 'owner'
    },
    authToken
  })

  expect(pageUpdatesUser).toMatchObject({
    data: {
      updatePageAccess: {
        page: {
          access: {
            users: expect.toIncludeSameMembers([
              {
                user: {
                  id: `preview:${user1.userId}`
                }
              },
              {
                user: {
                  id: `preview:${user2.userId}`
                }
              }
            ])
          }
        }
      }
    }
  })

  const pageUpdatesTeam = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: parentPageId,
      subjectType: 'team',
      subjectId: user1.teamId,
      role: 'owner'
    },
    authToken
  })

  expect(pageUpdatesTeam).toMatchObject({
    data: {
      updatePageAccess: {
        page: {
          access: {
            teams: [
              {
                team: {
                  id: `preview:${user1.teamId}`
                }
              }
            ]
          }
        }
      }
    }
  })

  const pageUpdatesOrg = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: parentPageId,
      subjectType: 'organization',
      subjectId: user1.orgId,
      role: 'owner'
    },
    authToken
  })

  expect(pageUpdatesOrg).toMatchObject({
    data: {
      updatePageAccess: {
        page: {
          access: {
            organizations: [
              {
                organization: {
                  id: `preview:${user1.orgId}`
                }
              }
            ]
          }
        }
      }
    }
  })

  const pageUpdatesExt = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: parentPageId,
      subjectType: 'external',
      subjectId: 'foo@example.com',
      role: 'owner'
    },
    authToken
  })

  expect(pageUpdatesExt).toMatchObject({
    data: {
      updatePageAccess: {
        page: {
          access: {
            guests: [
              {
                email: 'foo@example.com'
              }
            ]
          }
        }
      }
    }
  })

  const pageUpdatesGlobal = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: parentPageId,
      subjectType: 'external',
      subjectId: '*',
      role: 'owner'
    },
    authToken
  })

  expect(pageUpdatesGlobal).toMatchObject({
    data: {
      updatePageAccess: {
        page: {
          access: {
            public: 'owner'
          }
        }
      }
    }
  })

  const childPageRes = await sendPublic({
    query: `
      query Page($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            access {
              public
              guests {
                email
              }
              users {
                user {
                  id
                }
              }
              teams {
                team {
                  id
                }
              }
              organizations {
                organization {
                  id
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      pageId: childPageId
    },
    authToken
  })

  expect(childPageRes).toMatchObject({
    data: {
      public: {
        page: {
          access: {
            guests: [
              {
                email: 'foo@example.com'
              }
            ],
            public: 'owner',
            organizations: [
              {
                organization: {
                  id: `preview:${user1.orgId}`
                }
              }
            ],
            teams: [
              {
                team: {
                  id: `preview:${user1.teamId}`
                }
              }
            ]
          }
        }
      }
    }
  })
})

test('Revoking access unlinks children', async () => {
  const [user1] = await Promise.all([signUp()])
  const {authToken} = user1

  const parentPage = await sendPublic({
    query: `
      mutation CreatePage {
        createPage {
          page {
            id
          }
        }
      }
    `,
    variables: {},
    authToken
  })
  const parentPageId = parentPage.data.createPage.page.id
  const childPageCode = await sendTipTap(
    {authToken, pageId: parentPageId},
    async (document: Doc) => {
      return new Promise((resolve) => {
        const frag = document.getXmlFragment('default')
        const pageLinkBlock = createPageLinkElement(-1, '<Untitled>')
        pageLinkBlock.observe((e: YXmlEvent) => {
          for (const [key] of e.keys) {
            if (key === 'pageCode') {
              const pageCode = pageLinkBlock.getAttribute('pageCode')
              resolve(pageCode)
            }
          }
        })
        frag.insert(1, [pageLinkBlock] as any)
      })
    }
  )
  const childPageId = `page:${childPageCode}`

  await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: parentPageId,
      subjectType: 'external',
      subjectId: '*',
      role: 'owner'
    },
    authToken
  })

  const childPageRevokeError = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: childPageId,
      subjectType: 'external',
      subjectId: '*',
      role: 'editor'
    },
    authToken
  })

  expect(childPageRevokeError).toMatchObject({
    errors: [
      {
        extensions: {
          code: 'UNAPPROVED_UNLINK'
        }
      }
    ]
  })

  const childPageRevokeGood = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: childPageId,
      subjectType: 'external',
      subjectId: '*',
      role: 'viewer',
      unlinkApproved: true
    },
    authToken
  })

  expect(childPageRevokeGood).toMatchObject({
    data: {
      updatePageAccess: {
        page: {
          isParentLinked: false,
          access: {
            public: 'viewer'
          }
        }
      }
    }
  })

  await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId: parentPageId,
      subjectType: 'external',
      subjectId: '*',
      role: 'editor'
    },
    authToken
  })

  await sendPublic({
    query: `
      query Page($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            access {
              public
              guests {
                email
              }
              users {
                user {
                  id
                }
              }
              teams {
                team {
                  id
                }
              }
              organizations {
                organization {
                  id
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      pageId: parentPageId
    },
    authToken
  })

  expect(childPageRevokeGood).toMatchObject({
    data: {
      updatePageAccess: {
        page: {
          access: {
            public: 'viewer'
          }
        }
      }
    }
  })
})

test('New User adopts external access', async () => {
  const owner = await signUp()
  const inviteeEmail = faker.internet.email().toLowerCase()
  const {authToken} = owner

  const page = await sendPublic({
    query: `
      mutation CreatePage {
        createPage {
          page {
            id
          }
        }
      }
    `,
    variables: {},
    authToken
  })

  expect(page).toMatchObject({
    data: {
      createPage: {
        page: {
          id: expect.anything()
        }
      }
    }
  })
  const pageId = page.data.createPage.page.id
  const updatedAccess = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {
      pageId,
      subjectType: 'external',
      subjectId: inviteeEmail,
      role: 'editor'
    },
    authToken
  })

  expect(updatedAccess).toEqual({
    data: {
      updatePageAccess: {
        page: expect.objectContaining({
          id: pageId,
          access: expect.objectContaining({
            guests: [
              {
                email: inviteeEmail
              }
            ]
          })
        })
      }
    }
  })

  const invitee = await signUpWithEmail(inviteeEmail)
  const pageAccess = await sendPublic({
    query: `
      query Page($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            id
          }
        }
      }
    `,
    variables: {
      pageId
    },
    authToken: invitee.authToken
  })

  expect(pageAccess).toEqual({
    data: {
      public: {
        page: {
          id: pageId
        }
      }
    }
  })
})

test('Rando has no access', async () => {
  const [owner, rando] = await Promise.all([signUp(), signUp()])
  const {authToken} = owner

  const page = await sendPublic({
    query: `
      mutation CreatePage {
        createPage {
          page {
            id
          }
        }
      }
    `,
    variables: {},
    authToken
  })

  expect(page).toMatchObject({
    data: {
      createPage: {
        page: {
          id: expect.anything()
        }
      }
    }
  })
  const pageId = page.data.createPage.page.id

  const pageAccess = await sendPublic({
    query: `
      query Page($pageId: ID!) {
        public {
          page(pageId: $pageId) {
            id
          }
        }
      }
    `,
    variables: {
      pageId
    },
    authToken: rando.authToken
  })

  expect(pageAccess).toEqual({
    data: {
      public: {
        page: null
      }
    },
    errors: [
      expect.objectContaining({
        message: expect.stringMatching('Insufficient permission.')
      })
    ]
  })
})
