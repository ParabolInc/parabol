import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useModal from '../../../hooks/useModal'
import {MeetingTypeEnum} from '../../../types/graphql'
import lazyPreload from '../../../utils/lazyPreload'
import setTemplateId from '../../../utils/relay/setTemplateId'
import {RetroTemplatePicker_settings} from '../../../__generated__/RetroTemplatePicker_settings.graphql'

interface Props {
  settings: RetroTemplatePicker_settings
}

const ReflectTemplateModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'ReflectTemplateModal' */
    './ReflectTemplateModal'
  )
)

const Dropdown = styled(NewMeetingDropdown)({
  borderWidth: '0 1px 1px',
  borderRadius: 0
})

const RetroTemplatePicker = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {settings} = props
  const {teamId, selectedTemplate} = settings
  const {name: templateName} = selectedTemplate
  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateModal',
    onClose: () => {
      setTemplateId(atmosphere, teamId, selectedTemplate.id, MeetingTypeEnum.retrospective)
    }
  })

  return (
    <>
      <Dropdown
        icon={'question_answer'}
        dropdownIcon={'edit'}
        label={templateName}
        onClick={togglePortal}
        onMouseEnter={ReflectTemplateModal.preload}
      />
      {modalPortal(<ReflectTemplateModal closePortal={closePortal} retroMeetingSettings={settings} />)}
    </>
  )
}

export default createFragmentContainer(RetroTemplatePicker, {
  settings: graphql`
    fragment RetroTemplatePicker_settings on RetrospectiveMeetingSettings {
      ...ReflectTemplateModal_retroMeetingSettings
      teamId
      selectedTemplate {
        id
        name
        ...ReflectTemplateDetailsTemplate
      }
    }
  `
})
