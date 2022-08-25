import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useModal from '../../../hooks/useModal'
import lazyPreload from '../../../utils/lazyPreload'
import {RetroTemplatePicker_settings} from '../../../__generated__/RetroTemplatePicker_settings.graphql'

interface Props {
  settings: RetroTemplatePicker_settings
}

const ReflectTemplateModal = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'ReflectTemplateModal' */
      './ReflectTemplateModal'
    )
)

const RetroTemplatePicker = (props: Props) => {
  const {settings} = props
  const {selectedTemplate} = settings
  const {name: templateName} = selectedTemplate
  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateModal',
    parentId: 'newMeetingRoot'
  })

  return (
    <>
      <NewMeetingDropdown
        dropdownIcon={'keyboard_arrow_right'}
        label={templateName}
        onClick={togglePortal}
        onMouseEnter={ReflectTemplateModal.preload}
        title={'Template'}
      />
      {modalPortal(
        <ReflectTemplateModal closePortal={closePortal} retroMeetingSettings={settings} />
      )}
    </>
  )
}

export default createFragmentContainer(RetroTemplatePicker, {
  settings: graphql`
    fragment RetroTemplatePicker_settings on RetrospectiveMeetingSettings {
      ...ReflectTemplateModal_retroMeetingSettings
      selectedTemplate {
        id
        name
        ...ReflectTemplateDetailsTemplate
      }
    }
  `
})
