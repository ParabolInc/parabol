import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import customTemplate from '../../../../../static/images/illustrations/customTemplate.png'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import {PALETTE} from '../../../styles/paletteV3'
import {Threshold} from '../../../types/constEnums'
import getTemplateList from '../../../utils/getTemplateList'
import makeTemplateDescription from '../../../utils/makeTemplateDescription'
import {ReflectTemplateDetails_settings$key} from '../../../__generated__/ReflectTemplateDetails_settings.graphql'
import {ReflectTemplateDetails_viewer$key} from '../../../__generated__/ReflectTemplateDetails_viewer.graphql'
import AddTemplatePrompt from './AddTemplatePrompt'
import CloneTemplate from './CloneTemplate'
import EditableTemplateName from './EditableTemplateName'
import RemoveTemplate from './RemoveTemplate'
import SelectTemplate from './SelectTemplate'
import TemplatePromptList from './TemplatePromptList'
import TemplateSharing from './TemplateSharing'
import {retroIllustrations} from '../../../components/ActivityLibrary/ActivityIllustrations'

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
  viewer: ReflectTemplateDetails_viewer$key
}

const ReflectTemplateDetails = (props: Props) => {
  const {
    gotoTeamTemplates,
    gotoPublicTemplates,
    closePortal,
    settings: settingsRef,
    viewer: viewerRef
  } = props
  const settings = useFragment(
    graphql`
      fragment ReflectTemplateDetails_settings on RetrospectiveMeetingSettings {
        activeTemplate {
          ...ReflectTemplateDetailsTemplate @relay(mask: false)
          ...SelectTemplate_template
        }
        selectedTemplate {
          ...ReflectTemplateDetailsTemplate @relay(mask: false)
          ...SelectTemplate_template
        }
        teamTemplates {
          ...EditableTemplateName_teamTemplates
          ...RemoveTemplate_teamTemplates
        }
        team {
          id
          orgId
          tier
        }
      }
    `,
    settingsRef
  )
  const viewer = useFragment(
    graphql`
      fragment ReflectTemplateDetails_viewer on User {
        featureFlags {
          templateLimit
        }
        ...makeTemplateDescription_viewer
      }
    `,
    viewerRef
  )
  const {featureFlags} = viewer
  const {templateLimit: templateLimitFlag} = featureFlags
  const {teamTemplates, team} = settings
  const activeTemplate = settings.activeTemplate ?? settings.selectedTemplate
  const {id: templateId, name: templateName, prompts} = activeTemplate
  const {id: teamId, orgId, tier} = team
  const lowestScope = getTemplateList(teamId, orgId, activeTemplate)
  const isOwner = activeTemplate.teamId === teamId
  const description = makeTemplateDescription(lowestScope, activeTemplate, viewer, tier)
  const templateCount = teamTemplates.length
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const canClone = templateCount < Threshold.MAX_RETRO_TEAM_TEMPLATES
  const onClone = () => {
    if (submitting || !canClone) return
    submitMutation()
    AddReflectTemplateMutation(
      atmosphere,
      {parentTemplateId: templateId, teamId},
      {onError, onCompleted}
    )
    gotoTeamTemplates()
  }
  const headerImg =
    retroIllustrations[templateId as keyof typeof retroIllustrations] ?? customTemplate
  const isActiveTemplate = templateId === settings.selectedTemplate.id
  const showClone = !isOwner && (templateLimitFlag ? tier !== 'starter' : true)
  return (
    <PromptEditor>
      <Scrollable isActiveTemplate={isActiveTemplate}>
        <TemplateImage src={headerImg} />
        <TemplateHeader>
          <FirstLine>
            <EditableTemplateName
              key={templateId}
              name={templateName}
              templateId={templateId}
              teamTemplates={teamTemplates}
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
            {showClone && <CloneTemplate onClick={onClone} canClone={canClone} />}
          </FirstLine>
          <Description>{description}</Description>
        </TemplateHeader>
        <TemplatePromptList isOwner={isOwner} prompts={prompts} templateId={templateId} />
        {isOwner && <AddTemplatePrompt templateId={templateId} prompts={prompts} />}
        <TemplateSharing teamId={teamId} template={activeTemplate} />
      </Scrollable>
      {!isActiveTemplate && (
        <SelectTemplate
          closePortal={closePortal}
          template={activeTemplate}
          teamId={teamId}
          hasFeatureFlag={templateLimitFlag}
          tier={tier}
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
    ...makeTemplateDescription_template
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
