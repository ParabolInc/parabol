import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
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
        viewerMeetingMember {
          teamMember {
            integrations {
              atlassian {
                projects {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {jiraSearchQuery} = meeting
  const {viewerMeetingMember} = meeting
  const {teamMember} = viewerMeetingMember!
  const {integrations} = teamMember
  const {atlassian} = integrations
  const {projects} = atlassian!
  const {projectKeyFilters} = jiraSearchQuery
  const issueKeys = projectKeyFilters.map((projectId, idx) => {
    const project = projects.find(({id}) => id === projectId)!
    return idx === 0 ? project.name : `, ${project.name}`
  })
  return (
    <Wrapper>
      <Description>Current filters:</Description>
      <Items>{issueKeys.length ? issueKeys : 'None'}</Items>
    </Wrapper>
  )
}

export default JiraScopingSearchCurrentFilters
