import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {JiraScopingSearchCurrentFilters_meeting$key} from '../__generated__/JiraScopingSearchCurrentFilters_meeting.graphql'

const Wrapper = styled('div')({
  width: '100%',
  display: 'flex',
  paddingLeft: '72px',
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

  const {t} = useTranslation()

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
  const {jiraSearchQuery, viewerMeetingMember} = meeting
  const {projectKeyFilters} = jiraSearchQuery
  const projects = viewerMeetingMember?.teamMember.integrations.atlassian?.projects
  const projectFilterNames = [] as string[]
  projectKeyFilters.forEach((projectId) => {
    const projectName = projects?.find((project) => project?.id === projectId)?.name
    if (projectName) projectFilterNames.push(projectName)
  })
  const currentFilters = projectFilterNames.length ? projectFilterNames.join(', ') : 'None'

  return (
    <Wrapper>
      <Description>{t('JiraScopingSearchCurrentFilters.CurrentFilters:')}</Description>
      <Items>{currentFilters}</Items>
    </Wrapper>
  )
}

export default JiraScopingSearchCurrentFilters
