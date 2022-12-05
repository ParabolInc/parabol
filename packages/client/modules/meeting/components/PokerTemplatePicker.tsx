import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useModal from '../../../hooks/useModal'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import lazyPreload from '../../../utils/lazyPreload'
import {PokerTemplatePicker_settings$key} from '../../../__generated__/PokerTemplatePicker_settings.graphql'
import {PokerTemplatePicker_viewer$key} from '../../../__generated__/PokerTemplatePicker_viewer.graphql'

interface Props {
  settingsRef: PokerTemplatePicker_settings$key
  viewerRef: PokerTemplatePicker_viewer$key
}

const PokerTemplateModal = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'PokerTemplateModal' */
      './PokerTemplateModal'
    )
)

const PokerTemplatePicker = (props: Props) => {
  const {settingsRef, viewerRef} = props
  const settings = useFragment(
    graphql`
      fragment PokerTemplatePicker_settings on PokerMeetingSettings {
        ...PokerTemplateModal_pokerMeetingSettings
        selectedTemplate {
          id
          name
          scope
          ...PokerTemplateDetailsTemplate
        }
      }
    `,
    settingsRef
  )
  const viewer = useFragment(
    graphql`
      fragment PokerTemplatePicker_viewer on User {
        ...PokerTemplateModal_viewer
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
      meetingType: 'poker',
      scope
    })
  }

  return (
    <>
      <NewMeetingDropdown
        dropdownIcon={'keyboard_arrow_right'}
        label={templateName}
        onClick={handleClick}
        onMouseEnter={PokerTemplateModal.preload}
        title={'Template'}
      />
      {modalPortal(
        <PokerTemplateModal
          closePortal={closePortal}
          pokerMeetingSettingsRef={settings}
          viewerRef={viewer}
        />
      )}
    </>
  )
}

export default PokerTemplatePicker
