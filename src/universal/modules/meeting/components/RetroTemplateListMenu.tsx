import {RetroTemplateListMenu_retroMeetingSettings} from '__generated__/RetroTemplateListMenu_retroMeetingSettings.graphql'
import {RetroTemplatePicker_settings} from '__generated__/RetroTemplatePicker_settings.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import MenuItemHR from 'universal/components/MenuItemHR'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import SelectRetroTemplateMutation from 'universal/mutations/SelectRetroTemplateMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithAtmosphereProps, WithMutationProps {
  menuProps: MenuProps
  defaultActiveIdx: number
  retroMeetingSettings: RetroTemplateListMenu_retroMeetingSettings
  templates: RetroTemplatePicker_settings['reflectTemplates']
  toggleModal: () => void
}

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
    <Menu
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
    </Menu>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(RetroTemplateListMenu)),
  graphql`
    fragment RetroTemplateListMenu_retroMeetingSettings on RetrospectiveMeetingSettings {
      selectedTemplateId
      teamId
    }
  `
)
