import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useModal from '../../../hooks/useModal'
import {MeetingTypeEnum} from '../../../types/graphql'
import lazyPreload from '../../../utils/lazyPreload'
import setActiveTemplate from '../../../utils/relay/setActiveTemplate'
import {PokerTemplatePicker_settings} from '../../../__generated__/PokerTemplatePicker_settings.graphql'

interface Props {
  settings: PokerTemplatePicker_settings
}

const PokerTemplateModal = lazyPreload(() =>
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
  const atmosphere = useAtmosphere()
  const {settings} = props
  const {teamId, selectedTemplate} = settings
  const {name: templateName} = selectedTemplate
  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateModal',
    onClose: () => {
      setActiveTemplate(atmosphere, teamId, selectedTemplate.id, MeetingTypeEnum.poker)
    }
  })

  return (
    <>
      <Dropdown
        icon={'question_answer'}
        dropdownIcon={'edit'}
        label={templateName}
        onClick={togglePortal}
        onMouseEnter={PokerTemplateModal.preload}
      />
      {modalPortal(<PokerTemplateModal closePortal={closePortal} pokerMeetingSettings={settings} />)}
    </>
  )
}

export default createFragmentContainer(PokerTemplatePicker, {
  settings: graphql`
    fragment PokerTemplatePicker_settings on PokerMeetingSettings {
      ...PokerTemplateModal_pokerMeetingSettings
      teamId
      selectedTemplate {
        id
        name
        ...PokerTemplateDetailsTemplate
      }
    }
  `
})
