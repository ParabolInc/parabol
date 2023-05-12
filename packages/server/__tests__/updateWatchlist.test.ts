import {sendIntranet, signUp} from './common'

const UPDATE_WATCHLIST = `
  mutation UpdateWatchlist($emails: [String!], $domain: String, $includeInWatchlist: Boolean!) {
    updateWatchlist(emails: $emails, domain: $domain, includeInWatchlist: $includeInWatchlist) {
      ... on ErrorPayload {
        error {
          title
          message
        }
      }
      ... on UpdateWatchlistSuccess {
        success
      }
    }
  }
`

const USER = `
  query User($userId: ID!) {
    user(userId: $userId) {
      id
      isWatched
    }
  }
`

test('Add user to watchlist by email', async () => {
  const {email, userId} = await signUp()

  const update = await sendIntranet({
    query: UPDATE_WATCHLIST,
    variables: {
      emails: [email],
      includeInWatchlist: true
    }
  })

  expect(update).toMatchObject({
    data: {
      updateWatchlist: {
        success: true
      }
    }
  })

  const user = await sendIntranet({
    query: USER,
    variables: {
      userId
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        isWatched: true
      }
    }
  })
})

test('Remove user from watchlist by email', async () => {
  const {email, userId} = await signUp()

  const update = await sendIntranet({
    query: UPDATE_WATCHLIST,
    variables: {
      emails: [email],
      includeInWatchlist: false
    }
  })

  expect(update).toMatchObject({
    data: {
      updateWatchlist: {
        success: true
      }
    }
  })

  const user = await sendIntranet({
    query: USER,
    variables: {
      userId
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        isWatched: false
      }
    }
  })
})

test('Add user to watchlist by domain', async () => {
  const {email, userId} = await signUp()
  const domain = email.split('@')[1]

  const update = await sendIntranet({
    query: UPDATE_WATCHLIST,
    variables: {
      domain,
      includeInWatchlist: true
    }
  })

  expect(update).toMatchObject({
    data: {
      updateWatchlist: {
        success: true
      }
    }
  })

  const user = await sendIntranet({
    query: USER,
    variables: {
      userId
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        isWatched: true
      }
    }
  })
})

test('Remove user from watchlist by domain', async () => {
  const {email, userId} = await signUp()
  const domain = email.split('@')[1]

  const update = await sendIntranet({
    query: UPDATE_WATCHLIST,
    variables: {
      domain,
      includeInWatchlist: false
    }
  })

  expect(update).toMatchObject({
    data: {
      updateWatchlist: {
        success: true
      }
    }
  })

  const user = await sendIntranet({
    query: USER,
    variables: {
      userId
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        isWatched: false
      }
    }
  })
})
