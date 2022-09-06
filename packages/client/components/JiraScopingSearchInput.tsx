import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import {JiraScopingSearchInput_meeting$key} from '../__generated__/JiraScopingSearchInput_meeting.graphql'
import ScopingSearchInput from './ScopingSearchInput'

interface Props {
  meetingRef: JiraScopingSearchInput_meeting$key
}

const JiraScopingSearchInput = (props: Props) => {
  const {meetingRef} = props

  //FIXME i18n: Search issues on Jira
  const {t} = useTranslation()

  const meeting = useFragment(
    graphql`
      fragment JiraScopingSearchInput_meeting on PokerMeeting {
        id
        jiraSearchQuery {
          queryString
          isJQL
        }
      }
    `,
    meetingRef
  )

  const {id: meetingId, jiraSearchQuery} = meeting
  const {isJQL, queryString} = jiraSearchQuery

  const placeholder = isJQL ? `SPRINT = fun AND PROJECT = dev` : 'Search issues on Jira'

  return (
    <ScopingSearchInput
      placeholder={placeholder}
      queryString={queryString}
      meetingId={meetingId}
      linkedRecordName={t('JiraScopingSearchInput.Jirasearchquery')}
      service={t('JiraScopingSearchInput.Jira')}
    />
  )
}

export default JiraScopingSearchInput
