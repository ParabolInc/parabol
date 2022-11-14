import styled from '@emotion/styled'
import React from 'react'
import customTemplate from '../../../../../static/images/illustrations/customTemplate.png'
import {PALETTE} from '../../../styles/paletteV3'
import {ReflectTemplateDetails_settings} from '../../../__generated__/ReflectTemplateDetails_settings.graphql'
import {ReflectTemplateDetails_viewer} from '../../../__generated__/ReflectTemplateDetails_viewer.graphql'

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
  settings: ReflectTemplateDetails_settings
  viewer: ReflectTemplateDetails_viewer
}

const CustomTempateUpgradeMsg = (props: Props) => {
  // const {gotoTeamTemplates, gotoPublicTemplates, closePortal, settings, viewer} = props
  // const {featureFlags} = viewer
  // const {teamTemplates, team} = settings
  // const activeTemplate = settings.activeTemplate ?? settings.selectedTemplate
  // const {id: templateId, name: templateName, prompts} = activeTemplate
  // const {id: teamId, orgId, tier} = team
  // const lowestScope = getTemplateList(teamId, orgId, activeTemplate)
  // const isOwner = activeTemplate.teamId === teamId
  // const templateCount = teamTemplates.length
  // const atmosphere = useAtmosphere()
  // const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  // const isActiveTemplate = templateId === settings.selectedTemplate.id
  return (
    <PromptEditor>
      <Scrollable isActiveTemplate={true}>
        <TemplateImage src={customTemplate} />
        <TemplateHeader>
          <FirstLine>{'Create Custom Templates'}</FirstLine>
        </TemplateHeader>
        {/* <TemplatePromptList isOwner={isOwner} prompts={prompts} templateId={templateId} /> */}
        {/* {isOwner && <AddTemplatePrompt templateId={templateId} prompts={prompts} />} */}
        {/* <TemplateSharing teamId={teamId} template={activeTemplate} /> */}
      </Scrollable>
      {/* {!isActiveTemplate && (
        <SelectTemplate
          closePortal={closePortal}
          template={activeTemplate}
          teamId={teamId}
          hasFeatureFlag={featureFlags.templateLimit}
          tier={tier}
          orgId={orgId}
        />
      )} */}
    </PromptEditor>
  )
}

export default CustomTempateUpgradeMsg
