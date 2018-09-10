import {RetroTemplatePicker_settings} from '__generated__/RetroTemplatePicker_settings.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import LoadableDropdownMenuToggle from 'universal/components/LoadableDropdownMenuToggle'
import LoadableFreeModal from 'universal/components/LoadableFreeModal'
import LoadableReflectTemplateModal from './LoadableReflectTemplateModal'
import LoadableRetroTemplateListMenu from './LoadableRetroTemplateListMenu'

interface Props {
  settings: RetroTemplatePicker_settings
}

interface State {
  isModalOpen: boolean
}

class RetroTemplatePicker extends Component<Props, State> {
  state = {
    isModalOpen: false
  }

  customize = () => {
    this.setState({
      isModalOpen: true
    })
  }

  closeModal = () => {
    this.setState({
      isModalOpen: false
    })
  }

  render () {
    const {isModalOpen} = this.state
    const {settings} = this.props
    const {selectedTemplateId, reflectTemplates} = settings
    const selectedTemplateIdx = reflectTemplates.findIndex(
      (template) => template.id === selectedTemplateId
    )
    const selectedTemplate = reflectTemplates[selectedTemplateIdx]
    return (
      <React.Fragment>
        <LoadableDropdownMenuToggle
          defaultText={selectedTemplate.name}
          LoadableComponent={LoadableRetroTemplateListMenu}
          queryVars={{
            customize: this.customize,
            defaultActiveIdx: selectedTemplateIdx,
            retroMeetingSettings: settings
          }}
        />
        <LoadableFreeModal
          LoadableComponent={LoadableReflectTemplateModal}
          queryVars={{retroMeetingSettings: settings}}
          isModalOpen={isModalOpen}
          closeModal={this.closeModal}
        />
      </React.Fragment>
    )
  }
}

export default createFragmentContainer(
  RetroTemplatePicker,
  graphql`
    fragment RetroTemplatePicker_settings on RetrospectiveMeetingSettings {
      ...RetroTemplateListMenu_retroMeetingSettings
      ...ReflectTemplateModal_retroMeetingSettings
      selectedTemplateId
      reflectTemplates {
        id
        name
      }
    }
  `
)
