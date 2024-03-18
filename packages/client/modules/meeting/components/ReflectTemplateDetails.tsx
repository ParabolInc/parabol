import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import {PALETTE} from '../../../styles/paletteV3'
import getTemplateList from '../../../utils/getTemplateList'
import useTemplateDescription from '../../../utils/useTemplateDescription'
import {ReflectTemplateDetails_settings$key} from '../../../__generated__/ReflectTemplateDetails_settings.graphql'
import AddTemplatePrompt from './AddTemplatePrompt'
import CloneTemplate from './CloneTemplate'
import EditableTemplateName from './EditableTemplateName'
import RemoveTemplate from './RemoveTemplate'
import SelectTemplate from './SelectTemplate'
import TemplatePromptList from './TemplatePromptList'
import TemplateSharing from './TemplateSharing'

const TemplateHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '16px 0',
  paddingLeft: 56,
  paddingRight: 16,
  width: '100%',
  flexShrink: 0
})

const PromptEditor = styled('div')({
  alignItems: 'flex-start',
  background: '#fff',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxWidth: 520,
  width: '100%'
})

const TemplateImage = styled('img')({
  margin: '0 auto',
  maxWidth: 360,
  maxHeight: 200,
  padding: '16px 0 0',
  width: '100%',
  objectFit: 'contain'
})

const Description = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '20px'
})

const FirstLine = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const Scrollable = styled('div')<{isActiveTemplate: boolean}>(({isActiveTemplate}) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  paddingBottom: isActiveTemplate ? undefined : 56,
  width: '100%'
}))

interface Props {
  gotoTeamTemplates: () => void
  gotoPublicTemplates: () => void
  closePortal: () => void
  settings: ReflectTemplateDetails_settings$key
}

const ReflectTemplateDetails = (props: Props) => {
  const {gotoTeamTemplates, gotoPublicTemplates, closePortal, settings: settingsRef} = props
  const settings = useFragment(
    graphql`
      fragment ReflectTemplateDetails_settings on RetrospectiveMeetingSettings {
        activeTemplate {
          ...ReflectTemplateDetailsTemplate @relay(mask: false)
          ...SelectTemplate_template
          illustrationUrl
        }
        selectedTemplate {
          ...ReflectTemplateDetailsTemplate @relay(mask: false)
          ...SelectTemplate_template
        }
        teamTemplates {
          ...RemoveTemplate_teamTemplates
        }
        team {
          id
          orgId
          tier
          viewerTeamMember {
            user {
              id
              featureFlags {
                noTemplateLimit
              }
            }
          }
        }
      }
    `,
    settingsRef
  )
  const {teamTemplates, team} = settings
  const activeTemplate = settings.activeTemplate ?? settings.selectedTemplate
  const {id: templateId, name: templateName, prompts, illustrationUrl} = activeTemplate
  const {id: teamId, orgId, tier, viewerTeamMember} = team
  const noTemplateLimit = viewerTeamMember?.user?.featureFlags?.noTemplateLimit
  const lowestScope = getTemplateList(teamId, orgId, activeTemplate)
  const isOwner = activeTemplate.teamId === teamId
  const description = useTemplateDescription(lowestScope, activeTemplate, tier)
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const onClone = () => {
    if (submitting) return
    submitMutation()
    AddReflectTemplateMutation(
      atmosphere,
      {parentTemplateId: templateId, teamId},
      {onError, onCompleted}
    )
    gotoTeamTemplates()
  }
  const isActiveTemplate = templateId === settings.selectedTemplate.id
  const showClone = !isOwner && tier !== 'starter'
  return (
    <PromptEditor>
      <Scrollable isActiveTemplate={isActiveTemplate}>
        <TemplateImage src={illustrationUrl} />
        <TemplateHeader>
          <FirstLine>
            <EditableTemplateName
              key={templateId}
              name={templateName}
              templateId={templateId}
              isOwner={isOwner}
            />
            {isOwner && (
              <RemoveTemplate
                templateId={templateId}
                teamId={teamId}
                teamTemplates={teamTemplates}
                gotoPublicTemplates={gotoPublicTemplates}
                type='retrospective'
              />
            )}
            {showClone && <CloneTemplate onClick={onClone} />}
          </FirstLine>
          <Description>{description}</Description>
        </TemplateHeader>
        <TemplatePromptList isOwner={isOwner} prompts={prompts} templateId={templateId} />
        {isOwner && <AddTemplatePrompt templateId={templateId} prompts={prompts} />}
        <TemplateSharing isOwner={isOwner} template={activeTemplate} />
      </Scrollable>
      {!isActiveTemplate && (
        <SelectTemplate
          closePortal={closePortal}
          template={activeTemplate}
          teamId={teamId}
          tier={tier}
          noTemplateLimit={noTemplateLimit}
          orgId={orgId}
        />
      )}
    </PromptEditor>
  )
}

graphql`
  fragment ReflectTemplateDetailsTemplate on ReflectTemplate {
    ...TemplateSharing_template
    ...getTemplateList_template
    ...useTemplateDescription_template
    id
    name
    prompts {
      ...TemplatePromptList_prompts
      ...AddTemplatePrompt_prompts
    }
    teamId
  }
`
export default ReflectTemplateDetails
