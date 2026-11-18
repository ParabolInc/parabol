import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {RetroSettingsSubviews_meeting$key} from '../../__generated__/RetroSettingsSubviews_meeting.graphql'
import RetroRecurrenceSettings from './RetroRecurrenceSettings'
import RetroSettingsSubviewPanel from './RetroSettingsSubviewPanel'
import RetroTemplatePickerRoot from './RetroTemplatePickerRoot'

interface Props {
  meetingRef: RetroSettingsSubviews_meeting$key
  // the Settings tab's sub-views take over the whole drawer
  activeTab: string | null | undefined
  onChangeTab: (tab: string) => void
  onClose: () => void
  children: ReactNode
}

const RetroSettingsSubviews = (props: Props) => {
  const {meetingRef, activeTab, onChangeTab, onClose, children} = props
  const meeting = useFragment(
    graphql`
      fragment RetroSettingsSubviews_meeting on RetrospectiveMeeting {
        ...RetroRecurrenceSettings_meeting
        id
        meetingSeries {
          cancelledAt
        }
      }
    `,
    meetingRef
  )
  const backToSettings = () => onChangeTab('settings')
  if (activeTab === 'settingsTemplate') {
    return (
      <RetroSettingsSubviewPanel title='Template' onBack={backToSettings} onClose={onClose}>
        <RetroTemplatePickerRoot meetingId={meeting.id} />
      </RetroSettingsSubviewPanel>
    )
  }
  if (activeTab === 'settingsRecurrence') {
    const isRecurring = !!meeting.meetingSeries && !meeting.meetingSeries.cancelledAt
    return (
      <RetroSettingsSubviewPanel
        title={isRecurring ? 'Recurrence' : 'Repeat this retro'}
        onBack={backToSettings}
        onClose={onClose}
      >
        <RetroRecurrenceSettings meetingRef={meeting} onDone={backToSettings} />
      </RetroSettingsSubviewPanel>
    )
  }
  return <>{children}</>
}

export default RetroSettingsSubviews
