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
import LoadableModal from 'universal/components/LoadableModal'
import LoadableReflectTemplateModal from './LoadableReflectTemplateModal'

interface Props extends WithAtmosphereProps, WithMutationProps {
  closePortal: () => void
  defaultActiveIdx: number
  retroMeetingSettings: RetroTemplateListMenu_retroMeetingSettings
  teamId: string
}

class RetroTemplateListMenu extends Component<Props> {
  handleTemplateClick = (templateId: string) => () => {
    const {
      atmosphere,
      retroMeetingSettings,
      teamId,
      onCompleted,
      onError,
      submitMutation,
      submitting
    } = this.props
    const {selectedTemplateId} = retroMeetingSettings
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
    const {closePortal, defaultActiveIdx, retroMeetingSettings} = this.props
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
        <LoadableModal
          LoadableComponent={LoadableReflectTemplateModal}
          queryVars={{retroMeetingSettings}}
          toggle={<MenuItemWithShortcuts label='Customize...' />}
        />
      </MenuWithShortcuts>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(RetroTemplateListMenu)),
  graphql`
    fragment RetroTemplateListMenu_retroMeetingSettings on RetrospectiveMeetingSettings {
      ...ReflectTemplateModal_retroMeetingSettings
      reflectTemplates {
        templateId: id
        name
      }
      selectedTemplateId
    }
  `
)
