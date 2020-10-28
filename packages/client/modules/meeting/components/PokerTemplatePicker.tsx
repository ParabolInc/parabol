import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useModal from '../../../hooks/useModal'
import lazyPreload from '../../../utils/lazyPreload'
import {PokerTemplatePicker_settings} from '../../../__generated__/PokerTemplatePicker_settings.graphql'

interface Props {
  settings: PokerTemplatePicker_settings
}

const ReflectTemplateModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'ReflectTemplateModal' */
    './ReflectTemplateModal'
  )
)

const Dropdown = styled(NewMeetingDropdown)({
  marginTop: 16
})

const PokerTemplatePicker = (props: Props) => {
  const {settings} = props
  const {selectedTemplate} = settings
  const {name: templateName} = selectedTemplate
  const {togglePortal} = useModal({id: 'templateModal'})
  return (
    <>
      <Dropdown
        icon={'question_answer'}
        label={templateName}
        onClick={togglePortal}
        onMouseEnter={ReflectTemplateModal.preload}
      />
      {/* {modalPortal(<ReflectTemplateModal retroMeetingSettings={settings} />)} */}
    </>
  )
}

export default createFragmentContainer(PokerTemplatePicker, {
  settings: graphql`
    fragment PokerTemplatePicker_settings on PokerMeetingSettings {
      selectedTemplate {
        id
        name
      }
    }
  `
})
