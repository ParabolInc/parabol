import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import {ReflectTemplateModal_retroMeetingSettings} from '../../../__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import ReflectTemplateDetails from './ReflectTemplateDetails'
import ReflectTemplateList from './ReflectTemplateList'

interface Props {
  retroMeetingSettings: ReflectTemplateModal_retroMeetingSettings
}

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  width: 960,
  maxHeight: 500,
  minHeight: 500
})

const ReflectTemplateModal = (props: Props) => {
  const {retroMeetingSettings} = props
  return (
    <StyledDialogContainer>
      <ReflectTemplateList settings={retroMeetingSettings} />
      <ReflectTemplateDetails settings={retroMeetingSettings} />
    </StyledDialogContainer>
  )
}
export default createFragmentContainer(ReflectTemplateModal, {
  retroMeetingSettings: graphql`
    fragment ReflectTemplateModal_retroMeetingSettings on RetrospectiveMeetingSettings {
      ...ReflectTemplateList_settings
      ...ReflectTemplateDetails_settings
      id
      selectedTemplateId
      team {
        id
        orgId
      }
    }
  `
})
