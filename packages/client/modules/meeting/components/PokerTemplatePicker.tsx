import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import NewMeetingDropdown from '../../../components/NewMeetingDropdown'
import useModal from '../../../hooks/useModal'
import lazyPreload from '../../../utils/lazyPreload'
import {PokerTemplatePicker_settings} from '../../../__generated__/PokerTemplatePicker_settings.graphql'

interface Props {
  settings: PokerTemplatePicker_settings
}

const PokerTemplateModal = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'PokerTemplateModal' */
      './PokerTemplateModal'
    )
)

const PokerTemplatePicker = (props: Props) => {
  const {settings} = props

  const {t} = useTranslation()

  const {selectedTemplate} = settings
  const {name: templateName} = selectedTemplate
  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'templateModal',
    parentId: 'newMeetingRoot'
  })

  return (
    <>
      <NewMeetingDropdown
        dropdownIcon={t('PokerTemplatePicker.KeyboardArrowRight')}
        label={templateName}
        onClick={togglePortal}
        onMouseEnter={PokerTemplateModal.preload}
        title={t('PokerTemplatePicker.Template')}
      />
      {modalPortal(
        <PokerTemplateModal closePortal={closePortal} pokerMeetingSettings={settings} />
      )}
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
        ...PokerTemplateDetailsTemplate
      }
    }
  `
})
