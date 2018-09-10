import {RetroTemplateListMenu_retroMeetingSettings} from '__generated__/RetroTemplateListMenu_retroMeetingSettings.graphql'
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
    const {closePortal, customize, defaultActiveIdx, retroMeetingSettings} = this.props
    const {reflectTemplates} = retroMeetingSettings
    return (
      <MenuWithShortcuts
        ariaLabel={'Select a template or create your own!'}
        closePortal={closePortal}
        defaultActiveIdx={defaultActiveIdx}
      >
        {reflectTemplates.map((template) => {
          const {templateId, name} = template
          return (
            <MenuItemWithShortcuts
              key={templateId}
              label={name}
              onClick={this.handleTemplateClick(templateId)}
            />
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
      reflectTemplates {
        templateId: id
        name
      }
      selectedTemplateId
      teamId
    }
  `
)
