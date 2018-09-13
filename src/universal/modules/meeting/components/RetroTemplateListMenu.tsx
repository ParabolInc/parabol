import {RetroTemplateListMenu_retroMeetingSettings} from '__generated__/RetroTemplateListMenu_retroMeetingSettings.graphql'
import {RetroTemplatePicker_settings} from '__generated__/RetroTemplatePicker_settings.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import MenuItemHR from 'universal/components/MenuItemHR'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import SelectRetroTemplateMutation from 'universal/mutations/SelectRetroTemplateMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithAtmosphereProps, WithMutationProps {
  closePortal: () => void
  customize: () => void
  defaultActiveIdx: number
  retroMeetingSettings: RetroTemplateListMenu_retroMeetingSettings
  templates: RetroTemplatePicker_settings['reflectTemplates']
}

class RetroTemplateListMenu extends Component<Props> {
  handleTemplateClick = (templateId: string) => () => {
    const {
      atmosphere,
      retroMeetingSettings,
      onCompleted,
      onError,
      submitMutation,
      submitting
    } = this.props
    const {selectedTemplateId, teamId} = retroMeetingSettings
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

  render () {
    const {closePortal, customize, defaultActiveIdx, templates} = this.props
    return (
      <MenuWithShortcuts
        ariaLabel={'Select a template or create your own!'}
        closePortal={closePortal}
        defaultActiveIdx={defaultActiveIdx}
      >
        {templates.map((template) => {
          const {id, name} = template
          return (
            <MenuItemWithShortcuts key={id} label={name} onClick={this.handleTemplateClick(id)} />
          )
        })}
        <MenuItemHR notMenuItem />
        <MenuItemWithShortcuts label='Customize...' onClick={customize} />
      </MenuWithShortcuts>
    )
  }
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
