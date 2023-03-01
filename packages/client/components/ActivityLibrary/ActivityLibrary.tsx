import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {ActivityLibraryQuery, MeetingTypeEnum} from '~/__generated__/ActivityLibraryQuery.graphql'
import useRouter from '../../hooks/useRouter'
import sortByTier from '../../utils/sortByTier'
import ActivityLibrarySideBar from './ActivityLibrarySideBar'
import ActivityLibraryCard from './ActivityLibraryCard'

graphql`
  fragment ActivityLibrary_template on MeetingTemplate {
    id
    name
    type
  }
`

const query = graphql`
  query ActivityLibraryQuery {
    viewer {
      featureFlags {
        retrosInDisguise
      }
      teams {
        id
        name
        tier
        retroSettings: meetingSettings(meetingType: retrospective) {
          ... on RetrospectiveMeetingSettings {
            teamTemplates {
              ...ActivityLibrary_template @relay(mask: false)
            }
            organizationTemplates(first: 20)
              @connection(key: "ReflectTemplateListOrg_organizationTemplates") {
              edges {
                node {
                  ...ActivityLibrary_template @relay(mask: false)
                }
              }
            }
            publicTemplates(first: 50)
              @connection(key: "ReflectTemplateListPublic_publicTemplates") {
              edges {
                node {
                  ...ActivityLibrary_template @relay(mask: false)
                }
              }
            }
          }
        }
        pokerSettings: meetingSettings(meetingType: poker) {
          ... on PokerMeetingSettings {
            teamTemplates {
              ...ActivityLibrary_template @relay(mask: false)
            }
            organizationTemplates(first: 20)
              @connection(key: "PokerTemplateListOrg_organizationTemplates") {
              edges {
                node {
                  ...ActivityLibrary_template @relay(mask: false)
                }
              }
            }
            publicTemplates(first: 50) @connection(key: "PokerTemplateListOrg_publicTemplates") {
              edges {
                node {
                  ...ActivityLibrary_template @relay(mask: false)
                }
              }
            }
          }
        }
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<ActivityLibraryQuery>
  teamId?: string | null
}

export const ActivityLibrary = (props: Props) => {
  const {queryRef, teamId} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const {teams, featureFlags} = viewer

  const {history, location} = useRouter()

  const sendToMeRef = useRef(false)
  useEffect(() => {
    if (!teamId) {
      sendToMeRef.current = true
      const [firstTeam] = sortByTier(teams)
      const nextPath = firstTeam ? `/activity-library/${firstTeam.id}` : '/newteam'
      history.replace(nextPath, location.state)
    }
  }, [])

  const selectedTeam = teams.find((team) => team.id === teamId)

  const templates = [
    {id: 'action', type: 'action', name: 'Check-in'},
    {id: 'teamPrompt', type: 'teamPrompt', name: 'Standup'},
    ...(selectedTeam?.pokerSettings.teamTemplates ?? []),
    ...(selectedTeam?.retroSettings.teamTemplates ?? []),
    ...(selectedTeam?.pokerSettings.organizationTemplates?.edges?.map((edge) => edge.node) ?? []),
    ...(selectedTeam?.retroSettings.organizationTemplates?.edges?.map((edge) => edge.node) ?? []),
    ...(selectedTeam?.pokerSettings.publicTemplates?.edges?.map((edge) => edge.node) ?? []),
    ...(selectedTeam?.retroSettings.publicTemplates?.edges?.map((edge) => edge.node) ?? [])
  ] as {id: string; name: string; type: MeetingTypeEnum}[]

  if (!featureFlags.retrosInDisguise) {
    return <Redirect to='/404' />
  }

  return (
    <div className='flex'>
      <ActivityLibrarySideBar />
      <div className='flex flex-wrap'>
        {templates.map((template) => (
          <ActivityLibraryCard key={template.id} type={template.type} name={template.name} />
        ))}
      </div>
    </div>
  )
}
