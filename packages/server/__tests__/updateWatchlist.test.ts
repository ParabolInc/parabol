import {sendIntranet, signUp} from './common'

const UPDATE_WATCHLIST = `
  mutation UpdateWatchlist($emails: [String!], $includeInWatchlist: Boolean!) {
    updateWatchlist(emails: $emails, includeInWatchlist: $includeInWatchlist) {
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

test('Add user to watchlist', async () => {
  const {email, userId} = await signUp()

  const update = await sendIntranet({
    query: UPDATE_WATCHLIST,
    variables: {
      emails: [email],
      includeInWatchlist: true
    },
    isPrivate: true
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
    },
    isPrivate: true
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

test('Remove user from watchlist', async () => {
  const {email, userId} = await signUp()

  const update = await sendIntranet({
    query: UPDATE_WATCHLIST,
    variables: {
      emails: [email],
      includeInWatchlist: false
    },
    isPrivate: true
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
    },
    isPrivate: true
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
