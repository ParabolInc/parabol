import {sendIntranet, signUp} from './common'

test('Draft enterprise invoice payload', async () => {
  const {email, userId} = await signUp()

  const user = await sendIntranet({
    query: `
      query User($email: String!) {
        user(email: $email) {
          id
          email
          organizations {
            id
          }
        }
      }
    `,
    variables: {
      email
    },
    isPrivate: true
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        email,
        organizations: expect.arrayContaining([
          {
            id: expect.anything()
          }
        ])
      }
    }
  })

  const orgId = user.data.user.organizations[0].id

  const invoice = await sendIntranet({
    query: `
      mutation DraftEnterpriseInvoice($orgId: ID!, $quantity: Int!, $email: ID!) {
        draftEnterpriseInvoice(orgId: $orgId, quantity: $quantity, email: $email) {
          error {
            title
            message
          }
          organization {
            id
            tier
            organizationUsers {
              edges {
                node {
                  id
                  user {
                    email
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      orgId,
      quantity: 1,
      email
    },
    isPrivate: true
  })

  expect(invoice).toMatchObject({
    data: {
      draftEnterpriseInvoice: null
      // stripe id is invalid
      /*
      {
        error: null,
        organization: {
          id: orgId,

        }
      }
      */
    }
  })
})
