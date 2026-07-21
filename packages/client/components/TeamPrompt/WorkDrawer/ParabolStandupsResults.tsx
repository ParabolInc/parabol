import type {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {ParabolStandupsResultsQuery} from '../../../__generated__/ParabolStandupsResultsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import PromptResponseEditor from '../PromptResponseEditor'

// A TipTap doc is empty when it holds no text and no media nodes (images, mentions, embeds, etc.)
const isContentEmpty = (node: JSONContent): boolean => {
  if (typeof node.text === 'string' && node.text.trim()) return false
  if (node.type && node.type !== 'doc' && node.type !== 'paragraph' && node.type !== 'text') {
    return false
  }
  return (node.content ?? []).every(isContentEmpty)
}

interface Props {
  queryRef: PreloadedQuery<ParabolStandupsResultsQuery>
  teamId: string
}

const ParabolStandupsResults = (props: Props) => {
  const {queryRef, teamId} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const query = usePreloadedQuery(
    graphql`
      query ParabolStandupsResultsQuery($teamId: ID!, $after: DateTime, $before: DateTime!) {
        viewer {
          id
          meetings(
            first: 50
            teamIds: [$teamId]
            meetingTypes: [teamPrompt]
            after: $after
            before: $before
          ) {
            edges {
              node {
                __typename
                id
                name
                createdAt
                ... on TeamPromptMeeting {
                  responses {
                    id
                    content
                    user {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const groups = query.viewer.meetings.edges
    .map((edge) => edge.node)
    .map((node) => ({
      id: node.id,
      name: node.name,
      createdAt: node.createdAt,
      responses:
        node.__typename === 'TeamPromptMeeting'
          ? (node.responses ?? [])
              .filter((response) => response.user.id === viewerId)
              .map((response) => ({
                id: response.id,
                content: JSON.parse(response.content) as JSONContent
              }))
              .filter((response) => !isContentEmpty(response.content))
          : []
    }))
    .filter((group) => group.responses.length > 0)

  if (groups.length === 0) {
    return (
      <div className='flex flex-col items-center px-4 pt-12'>
        <img className='w-20' src={halloweenRetrospectiveTemplate} />
        <div className='mt-7 text-center'>
          You don’t have any standup responses in this range.
          <br />
          Try adjusting the date range.
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-y-4 px-4 pt-1 pb-4'>
      {groups.map((group) => (
        <div key={group.id} className='flex flex-col gap-y-2'>
          <div className='flex items-baseline justify-between'>
            <span className='truncate font-semibold text-fg-primary text-sm'>{group.name}</span>
            <span className='shrink-0 text-fg-muted text-xs'>
              {dayjs(group.createdAt).format('MMM D')}
            </span>
          </div>
          {group.responses.map((response) => (
            <div key={response.id} className='rounded-card bg-surface-card p-3 shadow-card'>
              <PromptResponseEditor teamId={teamId} content={response.content} readOnly />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default ParabolStandupsResults
