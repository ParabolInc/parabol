import {createVerifier, httpbis} from 'http-message-signatures'
import {markdownToDraft} from 'markdown-draft-js'
import {Variables} from 'relay-runtime'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import AuthToken from '../../database/types/AuthToken'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import getKysely from '../../postgres/getKysely'
import getGraphQLExecutor from '../../utils/getGraphQLExecutor'
import sendToSentry from '../../utils/sendToSentry'

const MATTERMOST_SECRET = process.env.MATTERMOST_SECRET
const PORT = __PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT
const HOST = process.env.HOST
const PORT_SUFFIX = HOST !== 'localhost' ? '' : `:${PORT}`
const ORIGIN = `${process.env.PROTO}://${HOST}${PORT_SUFFIX}`

const markdownToDraftJS = (markdown: string) => {
  const rawObject = markdownToDraft(markdown)
  return JSON.stringify(rawObject)
}

const gql = (strings: TemplateStringsArray) => strings.join('')

const eventLookup: Record<
  string,
  {
    query: string
    convertResult?: (data: any) => any
    convertInput?: (input: any) => any
  }
> = {
  teams: {
    query: gql`
      query Teams {
        viewer {
          teams {
            id
            name
            orgId
            teamMembers {
              id
              email
            }
          }
        }
      }
    `,
    convertResult: (data: any) => {
      return data.viewer.teams
    }
  },
  meetingTemplates: {
    query: gql`
      query MeetingTemplates {
        viewer {
          availableTemplates(first: 2000) {
            edges {
              node {
                id
                name
                bad
                type
                illustrationUrl
                orgId
                teamId
                scope
              }
            }
          }
        }
      }
    `,
    convertResult: (data: any) => {
      return data.viewer.availableTemplates.edges.map((edge: any) => edge.node)
    }
  },
  startRetrospective: {
    query: gql`
      mutation StartRetrospective($teamId: ID!, $templateId: ID!) {
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
    `
  },
  startCheckIn: {
    query: gql`
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
    `
  },
  startSprintPoker: {
    query: gql`
      mutation StartSprintPokerMutation($teamId: ID!, $templateId: ID!) {
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
    `
  },
  startTeamPrompt: {
    query: gql`
      mutation StartTeamPromptMutation($teamId: ID!) {
        startTeamPrompt(teamId: $teamId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on StartTeamPromptSuccess {
            meeting {
              id
            }
          }
        }
      }
    `
  },
  meetingSettings: {
    query: gql`
      query GetMeetingSettings($teamId: ID!, $meetingType: MeetingTypeEnum!) {
        viewer {
          team(teamId: $teamId) {
            meetingSettings(meetingType: $meetingType) {
              id
              phaseTypes
              ... on RetrospectiveMeetingSettings {
                disableAnonymity
              }
            }
          }
        }
      }
    `,
    convertResult: (data: any) => {
      const {meetingSettings} = data.viewer.team
      return {
        id: meetingSettings.id,
        checkinEnabled: meetingSettings.phaseTypes.includes('checkin'),
        teamHealthEnabled: meetingSettings.phaseTypes.includes('TEAM_HEALTH'),
        disableAnonymity: meetingSettings.disableAnonymity
      }
    }
  },
  setMeetingSettings: {
    query: gql`
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
    convertResult: (data: any) => {
      const {settings: meetingSettings} = data.setMeetingSettings
      return {
        id: meetingSettings.id,
        checkinEnabled: meetingSettings.phaseTypes.includes('checkin'),
        teamHealthEnabled: meetingSettings.phaseTypes.includes('TEAM_HEALTH'),
        disableAnonymity: meetingSettings.disableAnonymity
      }
    }
  },
  activeMeetings: {
    query: gql`
      query Meetings {
        viewer {
          teams {
            activeMeetings {
              id
              teamId
              name
              meetingType
              ... on RetrospectiveMeeting {
                phases {
                  ... on ReflectPhase {
                    reflectPrompts {
                      id
                      question
                      description
                    }
                    stages {
                      isComplete
                    }
                  }
                }
                templateId
              }
            }
          }
        }
      }
    `,
    convertResult: (data: any) => {
      const activeMeetings = data.viewer.teams.flatMap((team: any) => team.activeMeetings)
      return activeMeetings.map((meeting: any) => {
        const {phases, ...rest} = meeting
        const reflectPhase = phases?.find((phase: any) => 'reflectPrompts' in phase)
        if (!reflectPhase) return rest
        const isComplete = !reflectPhase.stages.some((stage: any) => !stage.isComplete)
        return {
          ...rest,
          reflectPrompts: reflectPhase.reflectPrompts,
          isComplete
        }
      })
    }
  },
  createReflection: {
    convertInput: (variables: any) => {
      const {content, ...rest} = variables
      return {
        input: {
          content: markdownToDraftJS(content),
          ...rest
        }
      }
    },
    query: gql`
      mutation CreateReflectionMutation($input: CreateReflectionInput!) {
        createReflection(input: $input) {
          reflectionId
        }
      }
    `
  }
}

const publishWebhookGQL = async <NarrowResponse>(
  query: string,
  variables: Variables,
  email: string
) => {
  const pg = getKysely()
  const user = await pg
    .selectFrom('User')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirstOrThrow()
  try {
    const authToken = new AuthToken({sub: user.id, tms: user.tms})
    return await getGraphQLExecutor().publish<NarrowResponse>({
      authToken,
      query,
      variables,
      isPrivate: false
    })
  } catch (e) {
    const error = e instanceof Error ? e : new Error('GQL executor failed to publish')
    sendToSentry(error, {tags: {query: query.slice(0, 50)}})
    return undefined
  }
}

const mattermostWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  if (!MATTERMOST_SECRET) {
    res.writeStatus('404').end()
    return
  }
  const headers = {
    'content-type': req.getHeader('content-type'),
    'content-digest': req.getHeader('content-digest'),
    'content-length': req.getHeader('content-length'),
    signature: req.getHeader('signature'),
    'signature-input': req.getHeader('signature-input')
  }

  const verified = await httpbis.verifyMessage(
    {
      async keyLookup(_: any) {
        // TODO When we support multiple Parabol - Mattermost connections, we should look up the key from IntegrationProvider
        // const keyId = params.keyid;
        return {
          id: '',
          algs: ['hmac-sha256'],
          verify: createVerifier(MATTERMOST_SECRET, 'hmac-sha256')
        }
      }
    },
    {
      method: req.getMethod(),
      url: ORIGIN + req.getUrl(),
      headers
    }
  )
  if (!verified) {
    res.writeStatus('401').end()
    return
  }

  const body = await parseBody<{query: string; variables: Record<string, any>; email: string}>({
    res
  })

  const {query, variables, email} = body ?? {}
  if (!email) {
    res.writeStatus('401').end()
    return
  }
  if (!query) {
    res.writeStatus('400').end()
    return
  }

  const event = eventLookup[query as keyof typeof eventLookup]
  if (!event) {
    sendToSentry(new Error('Received unknown mattermost webhook event'), {tags: {query: query!}})
    res.writeStatus('400').end()
    return
  }
  const convertedInput = event.convertInput?.(variables) ?? variables
  const result = await publishWebhookGQL<{data: any}>(event.query, convertedInput, email)
  if (result?.data) {
    const convertedResult = event.convertResult?.(result.data) ?? result.data
    res
      .writeStatus('200')
      .writeHeader('Content-Type', 'application/json')
      .end(JSON.stringify(convertedResult))
  } else {
    res.writeStatus('500').end()
  }
})

export default mattermostWebhookHandler
