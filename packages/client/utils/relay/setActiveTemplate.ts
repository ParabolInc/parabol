import {commitLocalUpdate} from 'react-relay'
import {ITeam, MeetingTypeEnum} from '../../types/graphql'
import Atmosphere from '../../Atmosphere'

const setActiveTemplate = (atmosphere: Atmosphere, teamId: string, templateId: string | null, meetingType: MeetingTypeEnum) => {
  commitLocalUpdate(atmosphere, (store) => {
    const team = store.get<ITeam>(teamId)
    if (!team) return
    const meetingSettings = team.getLinkedRecord('meetingSettings', {meetingType: meetingType})
    const activeTemplate = templateId ? store.get(templateId)! : null
    if (activeTemplate) {
      meetingSettings.setLinkedRecord(activeTemplate, 'activeTemplate')
    } else {
      meetingSettings.setValue(null, 'activeTemplate')
    }
  })
}

export default setActiveTemplate
