import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import JiraIssueId from '~/shared/gqlIds/JiraIssueId'
import {PALETTE} from '../styles/paletteV3'
import {JiraScopingSearchCurrentFilters_meeting$key} from '../__generated__/JiraScopingSearchCurrentFilters_meeting.graphql'

const Wrapper = styled('div')({
  width: '100%',
  display: 'flex',
  paddingLeft: '66px',
  paddingTop: '8px'
})

const Description = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 16,
  fontWeight: 500,
  whiteSpace: 'nowrap'
})

const Items = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 16,
  fontWeight: 600,
  fontStyle: 'italic',
  padding: '0px 24px 0px 4px',
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

interface Props {
  meetingRef: JiraScopingSearchCurrentFilters_meeting$key
}

const JiraScopingSearchCurrentFilters = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchCurrentFilters_meeting on PokerMeeting {
        jiraSearchQuery {
          projectKeyFilters
        }
      }
    `,
    meetingRef
  )
  const {jiraSearchQuery} = meeting
  const {projectKeyFilters} = jiraSearchQuery
  const issueKeys = projectKeyFilters.map((key, idx) =>
    idx === 0 ? JiraIssueId.split(key).issueKey : `, ${JiraIssueId.split(key).issueKey}`
  )
  return (
    <Wrapper>
      <Description>Current filters: </Description>
      <Items>{issueKeys.length ? issueKeys : 'None'}</Items>
    </Wrapper>
  )
}

export default JiraScopingSearchCurrentFilters
