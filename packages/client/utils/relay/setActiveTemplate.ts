import {commitLocalUpdate} from 'react-relay'
import type {RecordSourceProxy} from 'relay-runtime'
import type {MeetingTypeEnum} from '~/__generated__/MeetingSelectorQuery.graphql'
import type Atmosphere from '../../Atmosphere'

const setActiveTemplateInRelayStore = (
  store: RecordSourceProxy,
  teamId: string,
  templateId: string,
  meetingType: MeetingTypeEnum
) => {
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord('meetingSettings', {
    meetingType: meetingType
  })
  if (!meetingSettings) return
  const activeTemplate = store.get(templateId)
  if (activeTemplate) {
    meetingSettings.setLinkedRecord(activeTemplate, 'activeTemplate')
  } else {
    meetingSettings.setValue(null, 'activeTemplate')
  }
}

const setActiveTemplate = (
  atmosphere: Atmosphere,
  teamId: string,
  templateId: string,
  meetingType: MeetingTypeEnum
) => {
  commitLocalUpdate(atmosphere, (store) => {
    setActiveTemplateInRelayStore(store, teamId, templateId, meetingType)
  })
}

export {setActiveTemplate, setActiveTemplateInRelayStore}
