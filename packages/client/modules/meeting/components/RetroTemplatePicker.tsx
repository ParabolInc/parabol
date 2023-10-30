import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useModal from '../../../hooks/useModal'
import SendClientSideEvent from '../../../mutations/SendClientSideEvent'
import lazyPreload from '../../../utils/lazyPreload'
import {RetroTemplatePicker_settings$key} from '../../../__generated__/RetroTemplatePicker_settings.graphql'

interface Props {
  settingsRef: RetroTemplatePicker_settings$key
}

const ReflectTemplateModal = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'ReflectTemplateModal' */
      './ReflectTemplateModal'
    )
)

const RetroTemplatePicker = (props: Props) => {
  const {settingsRef} = props
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

  const {selectedTemplate} = settings
  const {name: templateName, scope} = selectedTemplate
  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateModal'
  })
  const atmosphere = useAtmosphere()

  const handleClick = () => {
    togglePortal()
    SendClientSideEvent(atmosphere, 'Opened Template Picker', {
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
        <ReflectTemplateModal closePortal={closePortal} retroMeetingSettingsRef={settings} />
      )}
    </>
  )
}

export default RetroTemplatePicker
