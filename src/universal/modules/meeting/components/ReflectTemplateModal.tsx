import {ReflectTemplateModal_retroMeetingSettings} from '__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import RaisedButton from 'universal/components/RaisedButton'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import ui from 'universal/styles/ui'
import EditableTemplateName from './EditableTemplateName'
import TemplatePromptItem from './TemplatePromptItem'

interface Props {
  onSuccess: () => void
  retroMeetingSettings: ReflectTemplateModal_retroMeetingSettings
}

interface State {
  activeTemplate: ReflectTemplateModal_retroMeetingSettings['reflectTemplates'][0]
}

const ModalBoundary = styled('div')({
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius,
  display: 'flex',
  height: 374,
  width: 700
})

const TemplateSidebar = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'gray'
})

const Title = styled('div')({
  fontSize: '0.5rem',
  fontWeight: 600,
  lineHeight: '1.5',
  margin: '0 0 .5rem'
})

const ListAndAdd = styled('div')({})

const TemplateList = styled('ul')({})

const TemplateItem = styled('li')({})

const PromptList = styled('ul')({})

const DeleteTemplate = styled(StyledFontAwesome)(({canDelete}: {canDelete: boolean}) => ({
  visibility: !canDelete ? 'hidden' : undefined,
  width: '100%'
}))

const TemplateHeader = styled('div')({
  display: 'flex',
  height: '1rem'
})

const PromptEditor = styled('div')({})

const AddPromptLink = styled(FlatButton)({})

class ReflectTemplateModal extends Component<Props, State> {
  constructor (props) {
    super(props)
    const {retroMeetingSettings} = props
    const {selectedTemplateId, reflectTemplates} = retroMeetingSettings
    const activeTemplate = reflectTemplates.find((template) => template.id === selectedTemplateId)
    this.state = {activeTemplate}
  }

  editTemplate = (template) => () => {
    if (this.state.activeTemplate !== template) {
      this.setState({
        activeTemplate: template
      })
    }
  }

  render () {
    const {retroMeetingSettings} = this.props
    const {activeTemplate} = this.state
    const {reflectTemplates} = retroMeetingSettings

    return (
      <ModalBoundary>
        <TemplateSidebar>
          <Title>Templates</Title>
          <ListAndAdd>
            <TemplateList>
              {reflectTemplates.map((template) => {
                return (
                  <TemplateItem key={template.id} onClick={this.editTemplate(template)}>
                    {template.name}
                  </TemplateItem>
                )
              })}
            </TemplateList>
            <RaisedButton>Add new template</RaisedButton>
          </ListAndAdd>
        </TemplateSidebar>
        <PromptEditor>
          <Title>Current Template</Title>
          <TemplateHeader>
            <EditableTemplateName key={activeTemplate.id} name={activeTemplate.name} />
            <DeleteTemplate canDelete={reflectTemplates.length > 1} name='trash' />
          </TemplateHeader>
          <PromptList>
            {activeTemplate.prompts.map((prompt) => {
              return <TemplatePromptItem key={prompt.id} prompt={prompt} />
            })}
          </PromptList>
          <AddPromptLink>+ Add another prompt</AddPromptLink>
        </PromptEditor>
      </ModalBoundary>
    )
  }
}

export default createFragmentContainer(
  ReflectTemplateModal,
  graphql`
    fragment ReflectTemplateModal_retroMeetingSettings on RetrospectiveMeetingSettings {
      reflectTemplates {
        id
        name
        prompts {
          ...TemplatePromptItem_prompt
          id
          sortOrder
        }
      }
      selectedTemplateId
    }
  `
)
