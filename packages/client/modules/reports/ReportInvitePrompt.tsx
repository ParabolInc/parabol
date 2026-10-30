import graphql from 'babel-plugin-relay/macro'
import {lazy, Suspense, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportInvitePromptQuery} from '../../__generated__/ReportInvitePromptQuery.graphql'
import ReportEmptyPrompt from './ReportEmptyPrompt'

interface Props {
  queryRef: PreloadedQuery<ReportInvitePromptQuery>
  orgId: string
  title: string
  description: string
  inviteLabel: string
  isCompact: boolean
}

const AddTeamMemberModal = lazy(
  () => import(/* webpackChunkName: 'AddTeamMemberModal' */ '../../components/AddTeamMemberModal')
)

const query = graphql`
  query ReportInvitePromptQuery($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        teams {
          id
          isViewerOnTeam
          teamMembersCount
          teamMembers {
            ...AddTeamMemberModal_teamMembers
          }
        }
      }
    }
  }
`

type Team = NonNullable<
  ReportInvitePromptQuery['response']['viewer']['organization']
>['teams'][number]

// Invites go to the viewer's biggest team in the org, or, on none, the prompt asks them to add one
const ReportInvitePrompt = (props: Props) => {
  const {queryRef, orgId, title, description, inviteLabel, isCompact} = props
  const {viewer} = usePreloadedQuery<ReportInvitePromptQuery>(query, queryRef)
  const [isOpen, setIsOpen] = useState(false)
  const team = (viewer.organization?.teams ?? []).reduce<Team | null>(
    (biggest, candidate) =>
      candidate.isViewerOnTeam &&
      (!biggest || candidate.teamMembersCount > biggest.teamMembersCount)
        ? candidate
        : biggest,
    null
  )
  if (!team) {
    return (
      <ReportEmptyPrompt
        title={title}
        description={description}
        actionLabel='Add a team'
        action={{to: `/newteam/${orgId}`}}
        isCompact={isCompact}
      />
    )
  }
  return (
    <>
      <ReportEmptyPrompt
        title={title}
        description={description}
        actionLabel={inviteLabel}
        action={{onClick: () => setIsOpen(true)}}
        isCompact={isCompact}
      />
      {isOpen && (
        <Suspense fallback={null}>
          <AddTeamMemberModal
            isOpen
            onClose={() => setIsOpen(false)}
            teamId={team.id}
            teamMembers={team.teamMembers}
          />
        </Suspense>
      )}
    </>
  )
}

export default ReportInvitePrompt
