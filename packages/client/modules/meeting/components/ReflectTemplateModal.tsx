import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import Overflow from '../../../components/Overflow'
import TextOverflow from '../../../components/TextOverflow'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {PALETTE} from '../../../styles/paletteV2'
import {Radius} from '../../../types/constEnums'
import {ReflectTemplateModal_retroMeetingSettings} from '../../../__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import AddNewReflectTemplate from './AddNewReflectTemplate'
import AddTemplatePrompt from './AddTemplatePrompt'
import EditableTemplateName from './EditableTemplateName'
import RemoveTemplate from './RemoveTemplate'
import TemplatePromptList from './TemplatePromptList'
import TemplateSharing from './TemplateSharing'

interface Props {
  retroMeetingSettings: ReflectTemplateModal_retroMeetingSettings
}

const contentPaddingLeft = '3rem'

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  height: 374,
  width: 700
})

const TemplateSidebar = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: PALETTE.BACKGROUND_MAIN,
  borderRadius: `${Radius.DIALOG} 0 0 ${Radius.DIALOG}`,
  width: 200
})

const Label = styled('div')({
  color: PALETTE.TEXT_GRAY,
  borderBottom: `.0625rem solid ${PALETTE.BORDER_LIGHT}`,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '1.5',
  padding: '.75rem 1rem',
  textTransform: 'uppercase',
  width: '100%'
})

const ListAndAdd = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  padding: '.5rem'
})

const TemplateList = styled('ul')({
  listStyle: 'none',
  margin: '0 0 .5rem',
  padding: 0
})

const TemplateItem = styled('li')<{isActive: boolean}>(({isActive}) => ({
  backgroundColor: isActive ? PALETTE.BACKGROUND_MAIN_DARKENED : undefined,
  borderRadius: '.125rem',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: '1.375rem',
  padding: '.3125rem .5rem'
}))

const TemplateHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '16px 0',
  paddingLeft: contentPaddingLeft,
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
      <TemplateSidebar>
        <Label>My Templates</Label>
        <ListAndAdd>
          <Overflow>
            <TemplateList>
              {sortedTemplates.map((template) => {
                return (
                  <TemplateItem
                    key={template.id}
                    isActive={template.id === activeTemplate.id}
                    onClick={editTemplate(template.id)}
                  >
                    <TextOverflow>{template.name}</TextOverflow>
                  </TemplateItem>
                )
              })}
            </TemplateList>
          </Overflow>
          {/* add a key to clear the error when they change */}
          <AddNewReflectTemplate
            key={activeTemplate.id}
            teamId={teamId}
            reflectTemplates={teamTemplates}
          />
        </ListAndAdd>
      </TemplateSidebar>
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
