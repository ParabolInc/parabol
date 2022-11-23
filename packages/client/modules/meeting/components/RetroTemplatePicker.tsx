import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useModal from '../../../hooks/useModal'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import lazyPreload from '../../../utils/lazyPreload'
import {RetroTemplatePicker_settings$key} from '../../../__generated__/RetroTemplatePicker_settings.graphql'
import {RetroTemplatePicker_viewer$key} from '../../../__generated__/RetroTemplatePicker_viewer.graphql'

interface Props {
  settingsRef: RetroTemplatePicker_settings$key
  viewerRef: RetroTemplatePicker_viewer$key
}

const ReflectTemplateModal = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'ReflectTemplateModal' */
      './ReflectTemplateModal'
    )
)

const RetroTemplatePicker = (props: Props) => {
  const {settingsRef, viewerRef} = props
  const settings = useFragment(
    graphql`
      fragment RetroTemplatePicker_settings on RetrospectiveMeetingSettings {
        ...ReflectTemplateModal_retroMeetingSettings
        selectedTemplate {
          id
          name
          scope
          ...ReflectTemplateDetailsTemplate
        }
      }
    `,
    settingsRef
  )
  const viewer = useFragment(
    graphql`
      fragment RetroTemplatePicker_viewer on User {
        ...ReflectTemplateModal_viewer
      }
    `,
    viewerRef
  )

  const {selectedTemplate} = settings
  const {name: templateName, scope} = selectedTemplate
  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateModal',
    parentId: 'newMeetingRoot'
  })
  const atmosphere = useAtmosphere()

  const handleClick = () => {
    togglePortal()
    SendClientSegmentEventMutation(atmosphere, 'Opened Template Picker', {
      meetingType: 'retrospective',
      scope
    })
  }

  return (
    <>
      <NewMeetingDropdown
        dropdownIcon={'keyboard_arrow_right'}
        label={templateName}
        onClick={handleClick}
        onMouseEnter={ReflectTemplateModal.preload}
        title={'Template'}
      />
      {modalPortal(
        <ReflectTemplateModal
          closePortal={closePortal}
          retroMeetingSettingsRef={settings}
          viewerRef={viewer}
        />
      )}
    </>
  )
}

export default RetroTemplatePicker
