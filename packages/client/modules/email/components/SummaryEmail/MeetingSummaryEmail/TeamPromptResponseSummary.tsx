import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {TeamPromptResponseSummary_meeting$key} from 'parabol-client/__generated__/TeamPromptResponseSummary_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import getPhaseByTypename from '~/utils/getPhaseByTypename'
import {isNotNull} from '~/utils/predicates'
import sortByISO8601Date from '~/utils/sortByISO8601Date'
import TeamPromptResponseSummaryCard from './TeamPromptResponseSummaryCard'

const ResponseSummaryGrid = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  padding: '24px',
  justifyContent: 'center'
})

interface Props {
  meetingRef: TeamPromptResponseSummary_meeting$key
}

const TeamPromptResponseSummary = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptResponseSummary_meeting on TeamPromptMeeting {
        phases {
          ... on TeamPromptResponsesPhase {
            __typename
            stages {
              id
              response {
                plaintextContent
                createdAt
              }
              ...TeamPromptResponseSummaryCard_stage
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {phases} = meeting
  const phase = getPhaseByTypename(phases, 'TeamPromptResponsesPhase')
  const allStages = phase.stages.filter(isNotNull)

  const orderedNonEmptyStages = allStages
    .filter((stage) => !!stage.response?.plaintextContent)
    .sort((stageA, stageB) =>
      sortByISO8601Date(stageA.response!.createdAt, stageB.response!.createdAt)
    )

  return (
    <ResponseSummaryGrid>
      {orderedNonEmptyStages.map((stage) => {
        return <TeamPromptResponseSummaryCard key={stage.id} stageRef={stage} />
      })}
    </ResponseSummaryGrid>
  )
}

export default TeamPromptResponseSummary
