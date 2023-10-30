import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useModal from '../../../hooks/useModal'
import SendClientSideEvent from '../../../mutations/SendClientSideEvent'
import lazyPreload from '../../../utils/lazyPreload'
import {PokerTemplatePicker_settings$key} from '../../../__generated__/PokerTemplatePicker_settings.graphql'

interface Props {
  settingsRef: PokerTemplatePicker_settings$key
}

const PokerTemplateModal = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'PokerTemplateModal' */
      './PokerTemplateModal'
    )
)

const PokerTemplatePicker = (props: Props) => {
  const {settingsRef} = props
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
  const {selectedTemplate} = settings
  const {name: templateName, scope} = selectedTemplate
  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateModal'
  })
  const atmosphere = useAtmosphere()

  const handleClick = () => {
    togglePortal()
    SendClientSideEvent(atmosphere, 'Opened Template Picker', {
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
        <PokerTemplateModal closePortal={closePortal} pokerMeetingSettingsRef={settings} />
      )}
    </>
  )
}

export default PokerTemplatePicker
