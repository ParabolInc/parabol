import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import {createVerifier, httpbis} from 'http-message-signatures'
import {Variables} from 'relay-runtime'
import getGraphQLExecutor from '../../utils/getGraphQLExecutor'
import sendToSentry from '../../utils/sendToSentry'
import AuthToken from '../../database/types/AuthToken'
import getKysely from '../../postgres/getKysely'
import startTeamPrompt from '../../graphql/public/mutations/startTeamPrompt'

const eventLookup = {
  meetingTemplates: {
    query: `
      query MeetingTemplates {
        viewer {
          availableTemplates(first: 2000) {
            edges {
              node {
                id
                name
                type
                illustrationUrl
                orgId
                teamId
                scope
              }
            }
          }
          teams {
            id
            name
            orgId
            retroSettings: meetingSettings(meetingType: retrospective) {
              id
              phaseTypes
              ...on RetrospectiveMeetingSettings {
                disableAnonymity
              }
            }
            pokerSettings: meetingSettings(meetingType: poker) {
              id
              phaseTypes
            }
            actionSettings: meetingSettings(meetingType: action) {
              id
              phaseTypes
            }
          }
        }
      }
    `,
    formatResult: (data: any) => {
      // restructure the data to make it easier to digest
      const restructured = {
        availableTemplates: data.viewer.availableTemplates.edges.map((edge: any) => edge.node),
        teams: data.viewer.teams,
      }
      console.log('GEORG result', JSON.stringify(restructured, null, 2))
      return restructured
    }
  },
  startRetrospective: {
    query: `
      mutation StartRetrospective(
        $teamId: ID!
        $templateId: ID!
      ) {
        selectTemplate(selectedTemplateId: $templateId, teamId: $teamId) {
          meetingSettings {
            id
          }
        }
        startRetrospective(teamId: $teamId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
        }
      }
    `,
    formatResult: undefined
  },
  startCheckIn: {
    query: `
      mutation StartCheckIn($teamId: ID!) {
        startCheckIn(teamId: $teamId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on StartCheckInSuccess {
            meeting {
              id
            }
          }
        }
      }
    `,
    formatResult: undefined
  },
  startSprintPoker: {
    query: `
      mutation StartSprintPokerMutation(
        $teamId: ID!
        $templateId: ID!
      ) {
        selectTemplate(selectedTemplateId: $templateId, teamId: $teamId) {
          meetingSettings {
            id
          }
        }
        startSprintPoker(teamId: $teamId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on StartSprintPokerSuccess {
            meeting {
              id
            }
          }
        }
      }
    `,
    formatResult: undefined
  },
  startTeamPrompt: {
    query: `
      mutation StartTeamPromptMutation(
        $teamId: ID!
      ) {
        startTeamPrompt(teamId: $teamId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ...on StartTeamPromptSuccess {
            meeting {
              id
            }
          }
        }
      }
    `,
    formatResult: undefined
  },
  getMeetingSettings: {
    query: `
      query GetMeetingSettings($teamId: ID!, $meetingType: MeetingTypeEnum!) {
        viewer {
          team(teamId: $teamId) {
            meetingSettings(meetingType: $meetingType) {
              id
              phaseTypes
              ...on RetrospectiveMeetingSettings {
                disableAnonymity
              }
            }
          }
        }
      }
    `,
    formatResult: (data: any) => {
      const {meetingSettings} = data.viewer.team
      return {
        id: meetingSettings.id,
        checkinEnabled: meetingSettings.phaseTypes.includes('checkin'),
        teamHealthEnabled: meetingSettings.phaseTypes.includes('TEAM_HEALTH'),
        disableAnonymity: meetingSettings.disableAnonymity,
      }
    }
  },
  setMeetingSettings: {
    query: `
      mutation SetMeetingSettings(
        $id: ID!
        $checkinEnabled: Boolean
        $teamHealthEnabled: Boolean
        $disableAnonymity: Boolean
      ) {
        setMeetingSettings(
          settingsId: $id
          checkinEnabled: $checkinEnabled
          teamHealthEnabled: $teamHealthEnabled
          disableAnonymity: $disableAnonymity
        ) {
          settings {
            id
            phaseTypes
            ... on RetrospectiveMeetingSettings {
              disableAnonymity
            }
          }
        }
      }
   `,
    formatResult: (data: any) => {
      console.log('GEORG setMeetingSettings', data)
      const {settings: meetingSettings} = data.setMeetingSettings
      return {
        id: meetingSettings.id,
        checkinEnabled: meetingSettings.phaseTypes.includes('checkin'),
        teamHealthEnabled: meetingSettings.phaseTypes.includes('TEAM_HEALTH'),
        disableAnonymity: meetingSettings.disableAnonymity,
      }
    }
  }
} as const

const publishWebhookGQL = async <NarrowResponse>(
  query: string,
  variables: Variables,
  email: string,
) => {
  const pg = getKysely()
  const user = await pg.selectFrom('User').selectAll().where('email', '=', email).executeTakeFirstOrThrow()
  try {
    const authToken = new AuthToken({sub: user.id, tms: user.tms})
    return await getGraphQLExecutor().publish<NarrowResponse>({
      authToken,
      query,
      variables,
      isPrivate: false,
    })
  } catch (e) {
    const error = e instanceof Error ? e : new Error('GQL executor failed to publish')
    sendToSentry(error, {tags: {query: query.slice(0, 50)}})
    return undefined
  }
}

const mattermostWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const headers = {
    'content-type': req.getHeader('content-type'),
    'content-digest': req.getHeader('content-digest'),
    'content-length': req.getHeader('content-length'),
    'signature': req.getHeader('signature'),
    'signature-input': req.getHeader('signature-input'),
  }

  const keys = new Map();
  keys.set('', {
      id: '',
      algs: ['hmac-sha256'],
      verify: createVerifier(process.env.SERVER_SECRET!, 'hmac-sha256'),
  });
  // minimal verification
  const verified = await httpbis.verifyMessage({
      // logic for finding a key based on the signature parameters
      async keyLookup(params: any) {
          //console.log('GEORG keyLookup', params)
          const keyId = params.keyid;
          // lookup and return key - note, we could also lookup using the alg too (`params.alg`)
          // if there is no key, `verifyMessage()` will throw an error
          return keys.get('');
      },
  }, {
      method: req.getMethod(),
      url: 'http://localhost:3001' + req.getUrl(),
      headers
  });
  if (!verified) {
    res.writeStatus('401').end()
    return
  }

  const body = (await parseBody({res})) as any

  const {query, variables, email} = body ?? {}

  console.log('GEORG query', query, variables, email)
  
  const event = eventLookup[query as keyof typeof eventLookup]
  if (!event) {
    console.log('GEORG event not found', query)
    res.writeStatus('400').end()
    return
  }
  const result = await publishWebhookGQL<{data: any}>(event.query, variables, email)
  if (result?.data) {
    const restructured = event.formatResult?.(result.data) ?? result.data
    res.writeStatus('200').writeHeader('Content-Type', 'application/json').end(JSON.stringify(restructured))
  } else {
    res.writeStatus('500').end()
  }
})

export default mattermostWebhookHandler
