//@ts-ignore
import faker from 'faker'
import WebSocket from 'ws'
import {sendIntranet, SIGNUP_WITH_PASSWORD_MUTATION} from './common'

const HOST = 'localhost:3001'

export const signUp = async (invitationToken?: string) => {
  //FIXME #1402 email addresses are case sensitive
  const email = faker.internet.email().toLowerCase()

  const password = faker.internet.password()
  const signUp = await sendIntranet({
    query: SIGNUP_WITH_PASSWORD_MUTATION,
    variables: {
      email,
      password,
      segmentId: null,
      invitationToken
    }
  })

  const userId = signUp.data.signUpWithPassword.user.id
  const authToken = signUp.data.signUpWithPassword.authToken

  return {
    userId,
    email,
    password,
    authToken
  }
}

interface PromiseResolver<T> {
  resolve: (valut: T) => void
  reject: (error: Error) => void
}

interface GraphQLPayload {
  data: any
  errors: [any]
}

// TODO move to common
export const socketConnection = async (authToken: string) => {
  const responses = new Map<number, IteratorResult<GraphQLPayload>[]>()
  const responsePromises = new Map<number, PromiseResolver<IteratorResult<GraphQLPayload>>>()

  const socket = await new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(`ws://${HOST}/?token=${authToken}`, ['trebuchet-ws'])
    ws.addListener('message', (event) => {
      const message = event.toString()
      // ping pong
      if (event.toString() === '9') {
        ws.send('A')
        return
      }
      const parsedMessage = JSON.parse(message)
      const {id, type, payload} = parsedMessage instanceof Array ? parsedMessage[0] : parsedMessage
      // not a response
      if (!id) {
        console.log('GEORG no id', message)
        return
      }
      const {data, errors} = payload
      const existingPromise = responsePromises.get(id)
      const done = type === 'complete' || type === 'error' ? true : undefined
      if (existingPromise) {
        if (data) {
          existingPromise.resolve({
            value: {
              data
            },
            done
          } as any)
        } else {
          console.log('GEORG error', JSON.stringify(errors))
          existingPromise.reject(errors)
        }
      } else {
        console.log('GEORG non-existing', {parsedMessage, data, errors})
        const q = responses.get(id) ?? []
        q.push({
          value: payload,
          done
        })
        responses.set(id, q)
      }
    })

    ws.addListener('open', () => {
      resolve(ws)
    })
    /*
    ws.addListener('close', (event) => {
      resolve(ws)
    })
    */
    ws.addListener('error', (error) => {
      reject(error)
    })
  })

  let id = 0

  const query = async ({query, variables}: {query: string; variables?: Record<string, any>}) => {
    const queryId = ++id
    socket.send(
      JSON.stringify({
        id: queryId,
        type: 'start',
        payload: {
          // the server fails to recognize subscriptions when there is leading whitespace
          query: query.trim(),
          variables
        }
      })
    )

    const result = await new Promise<IteratorResult<GraphQLPayload>>((resolve, reject) => {
      responsePromises.set(queryId, {resolve, reject})
    })
    return result.value
  }

  const subscribe = ({query, variables}: {query: string; variables?: Record<string, any>}) => {
    const subscriptionId = ++id
    console.log('GEORG subscribe')
    socket.send(
      JSON.stringify({
        id: subscriptionId,
        type: 'start',
        payload: {
          query: query.trim(),
          variables
        }
      })
    )

    return (async function* () {
      let done = false
      do {
        const q = responses.get(subscriptionId)
        if (q && q.length > 0) {
          const response = q.shift()!
          yield response
          done = !!response.done
        } else {
          const response = await new Promise<IteratorResult<GraphQLPayload>>((resolve, reject) => {
            responsePromises.set(subscriptionId, {resolve, reject})
          })
          yield response.value
          done = !!response.done
        }
      } while (!done)
      console.log('GEORG done')
    })()
  }

  return {
    socket,
    query,
    subscribe
  }
}

const main = async () => {
  const {authToken} = await signUp()

  const connection = await socketConnection(authToken)

  console.log('GEORG send')

  const teamResult = await connection.query({
    query: `
      query Viewer {
        viewer {
          teams {
            id
            isOnboardTeam
          }
        }
      }
    `
  })

  const teamId = teamResult.data.viewer.teams[0].id

  const teamSubscription = connection.subscribe({
    query: `
      subscription TeamSubscription {
        teamSubscription {
          __typename
          ... on AcceptTeamInvitationPayload {
            team {
              id
            }
            teamMember {
              id
              viewer {
                id
              }
            }
          }
          ... on UpdateUserProfilePayload {
            teamMembers {
              preferredName
              picture
              user {
                picture
                preferredName
                id
              }
              id
            }
          }
        }
      }
    `
  })

  const massInvitationResult = await connection.query({
    query: `
      query MassInvitationTokenLinkQuery(
        $teamId: ID!
      ) {
        viewer {
          team(teamId: $teamId) {
            id
            massInvitation {
              id
              expiration
            }
          }
          id
        }
      }
    `,
    variables: {
      teamId
    }
  })

  const invitationToken = massInvitationResult.data.viewer.team.massInvitation.id
  console.log('GEORG massInvitation', massInvitationResult, invitationToken)

  for (let i = 0; i < 5; ++i) {
    const {userId} = await signUp(invitationToken)
    const teamSub = await teamSubscription.next()
    console.log('GEORG teamSub', teamSub.value)
    // TODO check for eq.
  }

  // TODO do a proper teardown

  for await (const s of teamSubscription) {
    console.log('GEORG teamSubscription', s)
  }
}

main()
