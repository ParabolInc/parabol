import {ReflectTemplateModal_retroMeetingSettings} from '__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import memoize from 'micro-memoize'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {commitLocalUpdate, createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import ui from 'universal/styles/ui'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import AddNewReflectTemplate from './AddNewReflectTemplate'
import EditableTemplateName from './EditableTemplateName'
import RemoveTemplate from './RemoveTemplate'
import TemplatePromptItem from './TemplatePromptItem'

interface Props extends WithAtmosphereProps {
  onSuccess: () => void
  retroMeetingSettings: ReflectTemplateModal_retroMeetingSettings
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

const TemplateHeader = styled('div')({
  display: 'flex',
  height: '1rem'
})

const PromptEditor = styled('div')({})

const AddPromptLink = styled(FlatButton)({})

class ReflectTemplateModal extends Component<Props> {
  constructor (props) {
    super(props)
    const {atmosphere, retroMeetingSettings} = props
    const {settingsId, selectedTemplateId} = retroMeetingSettings
    commitLocalUpdate(atmosphere, (store) => {
      const settings = store.get(settingsId)
      if (!settings) return
      settings.setValue(selectedTemplateId, 'activeTemplateId')
    })
  }

  editTemplate = (templateId: string) => () => {
    const {atmosphere, retroMeetingSettings} = this.props
    const {settingsId} = retroMeetingSettings
    commitLocalUpdate(atmosphere, (store) => {
      const settings = store.get(settingsId)
      if (!settings) return
      settings.setValue(templateId, 'activeTemplateId')
    })
  }

  sortedTemplates = memoize(
    (reflectTemplates: ReflectTemplateModal_retroMeetingSettings['reflectTemplates']) => {
      const templates = reflectTemplates.slice()
      templates.sort((a, b) => (a.name < b.name ? -1 : 1))
      return templates
    }
  )

  render () {
    const {retroMeetingSettings} = this.props
    const {activeTemplateId, reflectTemplates, teamId} = retroMeetingSettings
    const templateCount = reflectTemplates.length
    const sortedTemplates = this.sortedTemplates(reflectTemplates)
    const activeTemplate = reflectTemplates.find((template) => template.id === activeTemplateId)
    if (!activeTemplate) return null
    return (
      <ModalBoundary>
        <TemplateSidebar>
          <Title>Templates</Title>
          <ListAndAdd>
            <TemplateList>
              {sortedTemplates.map((template) => {
                return (
                  <TemplateItem key={template.id} onClick={this.editTemplate(template.id)}>
                    {template.name}
                  </TemplateItem>
                )
              })}
            </TemplateList>
            {/* add a key to clear the error when they change */}
            <AddNewReflectTemplate
              key={activeTemplate.id}
              teamId={teamId}
              reflectTemplates={reflectTemplates}
            />
          </ListAndAdd>
        </TemplateSidebar>
        <PromptEditor>
          <Title>Current Template</Title>
          <TemplateHeader>
            <EditableTemplateName
              key={activeTemplate.id}
              name={activeTemplate.name}
              templateId={activeTemplate.id}
              templates={sortedTemplates}
            />
            <RemoveTemplate templateCount={templateCount} templateId={activeTemplate.id} />
          </TemplateHeader>
          <PromptList>
            {activeTemplate.prompts.map((prompt) => {
              return (
                <TemplatePromptItem
                  key={prompt.id}
                  prompt={prompt}
                  prompts={activeTemplate.prompts}
                />
              )
            })}
          </PromptList>
          <AddPromptLink>+ Add another prompt</AddPromptLink>
        </PromptEditor>
      </ModalBoundary>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(ReflectTemplateModal),
  graphql`
    fragment ReflectTemplateModal_retroMeetingSettings on RetrospectiveMeetingSettings {
      settingsId: id
      reflectTemplates {
        ...AddNewReflectTemplate_reflectTemplates
        id
        name
        prompts {
          ...TemplatePromptItem_prompt
          id
          sortOrder
        }
      }
      activeTemplateId
      selectedTemplateId
      teamId
    }
  `
)
