import graphql from 'babel-plugin-relay/macro'
import {type ReactNode, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReviewTasksExampleQuery} from '../__generated__/ReviewTasksExampleQuery.graphql'
import {
  getOrgSendServices,
  getSendServices,
  SUGGESTED_SEND_SERVICES
} from '../utils/getSendServices'
import ReviewTasksExampleCard from './ReviewTasksExampleCard'
import ReviewTasksExampleHint from './ReviewTasksExampleHint'
import ReviewTasksExampleSteps from './ReviewTasksExampleSteps'

export const reviewTasksExampleQuery = graphql`
  query ReviewTasksExampleQuery($teamId: ID!) {
    viewer {
      archivedTasksCount(teamId: $teamId)
      teamMember(teamId: $teamId) {
        userId
        services {
          service
          isConnected
        }
      }
      team(teamId: $teamId) {
        recentOrgTaskCounts {
          service
          taskCount
        }
        teamMembers {
          userId
          user {
            preferredName
            picture
          }
        }
      }
    }
  }
`

interface Props {
  render: (example: ReactNode | null) => ReactNode
  queryRef: PreloadedQuery<ReviewTasksExampleQuery>
  teamId: string
}

const ReviewTasksExample = (props: Props) => {
  const {queryRef, render, teamId} = props
  const {viewer} = usePreloadedQuery<ReviewTasksExampleQuery>(reviewTasksExampleQuery, queryRef)
  const {archivedTasksCount, teamMember, team} = viewer
  const services = getSendServices(teamMember?.services ?? [])
  const [servicesAtStart] = useState(services)
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)
  if (archivedTasksCount !== 0 || !teamMember || !team) return render(null)
  const teamMembers = team.teamMembers.map(({userId, user}) => ({userId, ...user}))
  const owner =
    teamMembers.find(({userId}) => userId === (ownerUserId ?? teamMember.userId)) ?? teamMembers[0]
  const newService = services.find((service) => !servicesAtStart.includes(service))
  const orgServices = getOrgSendServices(team.recentOrgTaskCounts)
  return render(
    <section className='flex w-full flex-col items-center overflow-auto px-4 sidebar-left:px-6 pt-8 sidebar-left:pt-[88px] pb-32 text-center'>
      <h2 className='font-semibold sidebar-left:text-xl text-fg-primary text-lg leading-6 sidebar-left:leading-7'>
        No tasks yet — go ahead, poke this one
      </h2>
      <p className='mt-2 max-w-[570px] text-fg-secondary text-sm leading-5'>
        A retro only pays off when talk becomes action. Task cards carry your team’s next steps out
        of the meeting. This example steps aside once you create a real one in <b>Discuss</b>.
      </p>
      <div className='mt-7 sidebar-left:mt-11 font-semibold text-[11px] text-fg-muted uppercase leading-4 tracking-[.08em]'>
        Example card
      </div>
      <div className='relative mt-2 w-full max-w-[300px] text-left'>
        <ReviewTasksExampleCard
          isSent={isSent}
          owner={owner}
          services={services}
          suggestedServices={orgServices.length > 0 ? orgServices : SUGGESTED_SEND_SERVICES}
          teamId={teamId}
          teamMembers={teamMembers}
          onOwner={setOwnerUserId}
          onSent={() => setIsSent(true)}
        />
        <ReviewTasksExampleHint
          isSent={isSent}
          newService={newService}
          orgServices={orgServices}
          services={services}
        />
      </div>
      <ReviewTasksExampleSteps isOwnerPicked={!!ownerUserId} isSent={isSent} />
    </section>
  )
}

export default ReviewTasksExample
