import {RetroTemplateListMenu_retroMeetingSettings} from '../../../__generated__/RetroTemplateListMenu_retroMeetingSettings.graphql'
import {RetroTemplatePicker_settings} from '../../../__generated__/RetroTemplatePicker_settings.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Menu from '../../../components/Menu'
import MenuItem from '../../../components/MenuItem'
import MenuItemHR from '../../../components/MenuItemHR'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import useModal from '../../../hooks/useModal'
import SelectRetroTemplateMutation from '../../../mutations/SelectRetroTemplateMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import styled from '@emotion/styled'

interface Props extends WithAtmosphereProps, WithMutationProps {
  menuProps: MenuProps
  defaultActiveIdx: number
  retroMeetingSettings: RetroTemplateListMenu_retroMeetingSettings
  templates: RetroTemplatePicker_settings['reflectTemplates']
  toggleModal: ReturnType<typeof useModal>['togglePortal']
}

const ListMenu = styled(Menu)({
  maxHeight: 230 // extra 6 pixels to prevent scroll with 6 templates
})

const RetroTemplateListMenu = (props: Props) => {
  const {
    atmosphere,
    retroMeetingSettings,
    onCompleted,
    onError,
    submitMutation,
    submitting,
    menuProps,
    defaultActiveIdx,
    templates,
    toggleModal
  } = props
  const {selectedTemplateId, teamId} = retroMeetingSettings
  const handleTemplateClick = (templateId: string) => () => {
    if (submitting || templateId === selectedTemplateId) return
    submitMutation()
    SelectRetroTemplateMutation(
      atmosphere,
      {selectedTemplateId: templateId, teamId},
      {},
      onError,
      onCompleted
    )
  }
  return (
    <ListMenu
      ariaLabel={'Select a template or create your own!'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      {templates.map((template) => {
        const {id, name} = template
        return <MenuItem key={id} label={name} onClick={handleTemplateClick(id)} />
      })}
      <MenuItemHR key={'HR1'} />
      <MenuItem label='Customize...' onClick={toggleModal} />
    </ListMenu>
  )
}

export default createFragmentContainer(withAtmosphere(withMutationProps(RetroTemplateListMenu)), {
  retroMeetingSettings: graphql`
    fragment RetroTemplateListMenu_retroMeetingSettings on RetrospectiveMeetingSettings {
      selectedTemplateId
      teamId
    }
  `
})
