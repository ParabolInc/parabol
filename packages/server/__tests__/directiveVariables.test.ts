import {sendPublic, signUp} from './common'

// graphql-yoga's executor and @graphql-tools/utils have to be bumped as a matching pair.
// A mismatched pair drops the variables handed to these directives, which broke every login (#13594)
const DIRECTIVE_VARIABLES_QUERY = `
  query DirectiveVariablesQuery(
    $includeField: Boolean!
    $skipField: Boolean!
    $includeInlineFragment: Boolean!
    $skipFragmentSpread: Boolean!
    $deferInlineFragment: Boolean!
  ) {
    viewer {
      id
      email @include(if: $includeField)
      preferredName @skip(if: $skipField)
      ... on User @include(if: $includeInlineFragment) {
        createdAt
      }
      ...DirectiveVariablesQueryTms @skip(if: $skipFragmentSpread)
      ... on User @defer(if: $deferInlineFragment) {
        picture
      }
    }
  }
  fragment DirectiveVariablesQueryTms on User {
    tms
  }
`

const LOGIN_WITH_OPTIONAL_INVITATION_MUTATION = `
  mutation DirectiveVariablesLoginMutation(
    $email: ID!
    $password: String!
    $invitationToken: ID! = ""
    $isInvitation: Boolean!
  ) {
    loginWithPassword(email: $email, password: $password) {
      error {
        message
      }
      user {
        id
      }
    }
    acceptTeamInvitation(invitationToken: $invitationToken) @include(if: $isInvitation) {
      error {
        message
      }
    }
  }
`

test('@include and @skip variables that keep a selection return it', async () => {
  const {userId, email, teamId, cookie} = await signUp()

  const res = await sendPublic({
    query: DIRECTIVE_VARIABLES_QUERY,
    variables: {
      includeField: true,
      skipField: false,
      includeInlineFragment: true,
      skipFragmentSpread: false,
      deferInlineFragment: false
    },
    cookie
  })

  expect(res.errors).toBeUndefined()
  expect(res.data).toEqual({
    viewer: {
      id: userId,
      email,
      preferredName: expect.any(String),
      createdAt: expect.any(String),
      tms: [teamId],
      picture: expect.any(String)
    }
  })
})

test('@include and @skip variables that drop a selection omit it', async () => {
  const {userId, cookie} = await signUp()

  const res = await sendPublic({
    query: DIRECTIVE_VARIABLES_QUERY,
    variables: {
      includeField: false,
      skipField: true,
      includeInlineFragment: false,
      skipFragmentSpread: true,
      deferInlineFragment: false
    },
    cookie
  })

  expect(res.errors).toBeUndefined()
  expect(res.data).toEqual({
    viewer: {
      id: userId,
      picture: expect.any(String)
    }
  })
})

test('a root mutation field behind @include(if: false) is not executed', async () => {
  const {userId, email, password} = await signUp()

  const res = await sendPublic({
    query: LOGIN_WITH_OPTIONAL_INVITATION_MUTATION,
    variables: {
      email,
      password,
      invitationToken: '',
      isInvitation: false
    }
  })

  expect(res.errors).toBeUndefined()
  expect(res.data).toEqual({
    loginWithPassword: {
      error: null,
      user: {
        id: userId
      }
    }
  })
})
