import {RetroTemplatePicker_settings} from '../../../__generated__/RetroTemplatePicker_settings.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuToggle from '../../../components/DropdownMenuToggle'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import useModal from '../../../hooks/useModal'
import lazyPreload from '../../../utils/lazyPreload'

interface Props {
  settings: RetroTemplatePicker_settings
}

const RetroTemplateListMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'RetroTemplateListMenu' */
    './RetroTemplateListMenu'
  )
)

const ReflectTemplateModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'ReflectTemplateModal' */
    './ReflectTemplateModal'
  )
)

const RetroTemplatePicker = (props: Props) => {
  const {settings} = props
  const {selectedTemplateId, reflectTemplates} = settings
  const templates = useMemo(() => {
    const templates = reflectTemplates.slice()
    templates.sort((a, b) => (a.lastUsedAt! < b.lastUsedAt! ? -1 : a.name < b.name ? -1 : 1))
    return templates
  }, [reflectTemplates])
  const selectedTemplateIdx = templates.findIndex((template) => template.id === selectedTemplateId)
  const safeIdx = selectedTemplateIdx === -1 ? 0 : selectedTemplateIdx
  const selectedTemplate = templates[safeIdx]
  const {menuPortal, togglePortal, menuProps, originRef} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )
  const {togglePortal: toggleModal, modalPortal} = useModal()
  return (
    <>
      <DropdownMenuToggle
        defaultText={selectedTemplate.name}
        onMouseEnter={RetroTemplateListMenu.preload}
        onClick={togglePortal}
        ref={originRef}
      />
      {menuPortal(
        <RetroTemplateListMenu
          menuProps={menuProps}
          defaultActiveIdx={selectedTemplateIdx}
          retroMeetingSettings={settings}
          templates={templates}
          toggleModal={toggleModal}
        />
      )}
      {modalPortal(<ReflectTemplateModal retroMeetingSettings={settings} />)}
    </>
  )
}

export default createFragmentContainer(RetroTemplatePicker, {
  settings: graphql`
    fragment RetroTemplatePicker_settings on RetrospectiveMeetingSettings {
      ...ReflectTemplateModal_retroMeetingSettings
      ...RetroTemplateListMenu_retroMeetingSettings
      selectedTemplateId
      reflectTemplates {
        id
        name
        lastUsedAt
      }
    }
  `
})
