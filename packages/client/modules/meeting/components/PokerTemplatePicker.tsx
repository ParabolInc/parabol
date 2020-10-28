import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useModal from '../../../hooks/useModal'
import lazyPreload from '../../../utils/lazyPreload'
import {PokerTemplatePicker_settings} from '../../../__generated__/PokerTemplatePicker_settings.graphql'
import PokerTemplateModal from './PokerTemplateModal'

interface Props {
  settings: PokerTemplatePicker_settings
}

const ReflectTemplateModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'PokerTemplateModal' */
    './PokerTemplateModal'
  )
)

const Dropdown = styled(NewMeetingDropdown)({
  borderWidth: '0 1px 1px',
  borderRadius: 0
})

const PokerTemplatePicker = (props: Props) => {
  const {settings} = props
  const {selectedTemplate} = settings
  const {name: templateName} = selectedTemplate
  const {togglePortal, modalPortal} = useModal({id: 'templateModal'})
  return (
    <>
      <Dropdown
        icon={'question_answer'}
        dropdownIcon={'edit'}
        label={templateName}
        onClick={togglePortal}
        onMouseEnter={ReflectTemplateModal.preload}
      />
      {modalPortal(<PokerTemplateModal pokerMeetingSettings={settings} />)}
    </>
  )
}

export default createFragmentContainer(PokerTemplatePicker, {
  settings: graphql`
    fragment PokerTemplatePicker_settings on PokerMeetingSettings {
      ...PokerTemplateModal_pokerMeetingSettings
      selectedTemplate {
        id
        name
      }
    }
  `
})
