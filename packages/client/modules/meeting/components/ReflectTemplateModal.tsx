import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {ReflectTemplateModal_retroMeetingSettings} from '../../../__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import AddTemplatePrompt from './AddTemplatePrompt'
import EditableTemplateName from './EditableTemplateName'
import ReflectTemplateList from './ReflectTemplateList'
import RemoveTemplate from './RemoveTemplate'
import TemplatePromptList from './TemplatePromptList'
import TemplateSharing from './TemplateSharing'

const TemplateHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '16px 0',
  paddingLeft: 48,
  paddingRight: '2rem',
  width: '100%'
})

const PromptEditor = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minWidth: 500,
  width: '100%',
  position: 'relative'
})
interface Props {
  retroMeetingSettings: ReflectTemplateModal_retroMeetingSettings
}

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  height: 374,
  width: 700
})

const ReflectTemplateModal = (props: Props) => {
  const {retroMeetingSettings} = props
  const {
    id: settingsId,
    selectedTemplateId,
    activeTemplateId,
    teamTemplates,
    teamId
  } = retroMeetingSettings
  const atmosphere = useAtmosphere()
  const editTemplate = (templateId: string) => () => {
    commitLocalUpdate(atmosphere, (store) => {
      const settings = store.get(settingsId)
      if (!settings) return
      settings.setValue(templateId, 'activeTemplateId')
    })
  }
  useEffect(() => {
    editTemplate(selectedTemplateId)()
  }, [])

  const sortedTemplates = useMemo(() => {
    return teamTemplates.slice().sort((a, b) => (a.name < b.name ? -1 : 1))
  }, [teamTemplates])

  const templateCount = teamTemplates.length
  const activeTemplate = teamTemplates.find((template) => template.id === activeTemplateId)
  if (!activeTemplate) return null
  const isOwner = activeTemplate.teamId === teamId
  return (
    <StyledDialogContainer>
      <ReflectTemplateList settings={retroMeetingSettings} />
      <PromptEditor>
        <TemplateHeader>
          <EditableTemplateName
            key={activeTemplate.id}
            name={activeTemplate.name}
            templateId={activeTemplate.id}
            templates={sortedTemplates}
            isOwner={isOwner}
          />
          <RemoveTemplate templateCount={templateCount} templateId={activeTemplate.id} />
        </TemplateHeader>
        <TemplateSharing teamId={teamId} template={activeTemplate} />
        <TemplatePromptList prompts={activeTemplate.prompts} templateId={activeTemplate.id} />
        <AddTemplatePrompt templateId={activeTemplate.id} prompts={activeTemplate.prompts} />
      </PromptEditor>
    </StyledDialogContainer>
  )
}
export default createFragmentContainer(ReflectTemplateModal, {
  retroMeetingSettings: graphql`
    fragment ReflectTemplateModal_retroMeetingSettings on RetrospectiveMeetingSettings {
      ...ReflectTemplateList_settings
      id
      teamTemplates {
        ...AddNewReflectTemplate_reflectTemplates
        ...TemplateSharing_template
        id
        name
        teamId
        prompts {
          ...TemplatePromptList_prompts
          ...AddTemplatePrompt_prompts
          id
          sortOrder
        }
      }
      activeTemplateId
      selectedTemplateId
      teamId
    }
  `
})
