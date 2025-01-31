import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamInsightsQuery} from '../../../../__generated__/TeamInsightsQuery.graphql'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import InsightsFeedbackModal from './FeedbackModal'
import TeamInsightContent from './TeamInsightContent'
import TeamInsightEmptyState from './TeamInsightEmptyState'

interface Props {
  queryRef: PreloadedQuery<TeamInsightsQuery>
}

const query = graphql`
  query TeamInsightsQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        ...TeamInsights_team @relay(mask: false)
        name
        insight {
          wins
          ...TeamInsightContent_team
        }
      }
    }
  }
`

graphql`
  fragment TeamInsights_team on Team {
    id
    retroMeetingsCount
  }
`

const TeamInsights = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamInsightsQuery>(query, queryRef)
  const {viewer} = data
  const {team} = viewer
  const {id: teamId, insight, name, retroMeetingsCount} = team ?? {}

  const {isOpen, open, close} = useDialogState()

  return (
    <div className='mb-8 space-y-6'>
      <p className='mt-[20px] mb-6 text-sm text-slate-900'>
        Only you (as <span className='font-bold'>Team Lead</span>) can see Team Insights. Insights
        are auto-generated.{' '}
        <a
          href='#'
          className='font-semibold text-sky-500 hover:underline'
          onClick={(e) => {
            e.preventDefault()
            open()
          }}
        >
          Give us feedback
        </a>
      </p>
      {insight ? (
        <TeamInsightContent insightRef={insight} teamName={name!} />
      ) : (
        <TeamInsightEmptyState teamId={teamId} meetingsCount={retroMeetingsCount} />
      )}
      <InsightsFeedbackModal isOpen={isOpen} onClose={close} />
    </div>
  )
}

export default TeamInsights
