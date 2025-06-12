import {sendPublic, signUp} from './common'

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
  const childPage = await sendPublic({
    query: `
      mutation CreatePage($parentPageId: ID!) {
        createPage(parentPageId: $parentPageId) {
          page {
            id
            parentPageId
          }
        }
      }
    `,
    variables: {parentPageId},
    authToken
  })
  const childPageId = childPage.data.createPage.page.id
  expect(childPage).toMatchObject({
    data: {
      createPage: {
        page: {
          id: expect.anything(),
          parentPageId
        }
      }
    }
  })

  const pageUpdatesUser = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {pageId: parentPageId, subjectType: 'user', subjectId: user2.userId, role: 'owner'},
    authToken
  })

  expect(pageUpdatesUser).toMatchObject({
    data: {
      updatePageAccess: {
        page: {
          access: {
            users: [
              {
                user: {
                  id: user1.userId
                }
              },
              {
                user: {
                  id: user2.userId
                }
              }
            ]
          }
        }
      }
    }
  })

  const pageUpdatesTeam = await sendPublic({
    query: UPDATE_PAGE_ACCESS,
    variables: {pageId: parentPageId, subjectType: 'team', subjectId: user1.teamId, role: 'owner'},
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
                  id: user1.teamId
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
                  id: user1.orgId
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
    query: `query Page($pageId: ID!) {
      viewer {
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
    }`,
    variables: {
      pageId: childPageId
    },
    authToken
  })

  expect(childPageRes).toMatchObject({
    data: {
      viewer: {
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
                  id: user1.orgId
                }
              }
            ],
            teams: [
              {
                team: {
                  id: user1.teamId
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
  const childPage = await sendPublic({
    query: `
      mutation CreatePage($parentPageId: ID!) {
        createPage(parentPageId: $parentPageId) {
          page {
            id
            parentPageId
          }
        }
      }
    `,
    variables: {parentPageId},
    authToken
  })
  const childPageId = childPage.data.createPage.page.id

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
    query: `query Page($pageId: ID!) {
      viewer {
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
    }`,
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
