import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import CreateTemplate from '../../../../../static/images/illustrations/CreateTemplate.svg'
import {PALETTE} from '../../../styles/paletteV2'
import {Threshold} from '../../../types/constEnums'
import getTemplateList from '../../../utils/getTemplateList'
import makeTemplateDescription from '../../../utils/makeTemplateDescription'
import {ReflectTemplateDetails_settings} from '../../../__generated__/ReflectTemplateDetails_settings.graphql'
import AddTemplatePrompt from './AddTemplatePrompt'
import CloneTemplate from './CloneTemplate'
import EditableTemplateName from './EditableTemplateName'
import RemoveTemplate from './RemoveTemplate'
import TemplatePromptList from './TemplatePromptList'
import TemplateSharing from './TemplateSharing'

const TemplateHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '16px 0',
  paddingLeft: 48,
  paddingRight: 32,
  width: '100%'
})

const PromptEditor = styled('div')({
  alignItems: 'flex-start',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  minWidth: 600,
})

const CreateTemplateImg = styled('img')({
  padding: 16,
  width: 240
})

const Description = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 14,
  lineHeight: '20px',

})

const FirstLine = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const Scrollable = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto'
})


interface Props {
  gotoPublicTemplates: () => void
  settings: ReflectTemplateDetails_settings
}

const ReflectTemplateDetails = (props: Props) => {
  const {gotoPublicTemplates, settings} = props
  const {teamTemplates, selectedTemplate, team} = settings
  const {id: templateId, name: templateName, prompts} = selectedTemplate
  const {id: teamId, orgId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const isOwner = selectedTemplate.teamId === teamId
  const description = makeTemplateDescription(lowestScope, selectedTemplate)
  const templateCount = teamTemplates.length
  return (
    <PromptEditor>
      <CreateTemplateImg src={CreateTemplate} />
      < TemplateHeader >
        <FirstLine>
          <EditableTemplateName
            key={templateId}
            name={templateName}
            templateId={templateId}
            teamTemplates={teamTemplates}
            isOwner={isOwner}
          />
          {isOwner && templateCount > 1 && <RemoveTemplate templateId={templateId} teamId={teamId} teamTemplates={teamTemplates} gotoPublicTemplates={gotoPublicTemplates} />}
          {!isOwner && templateCount < Threshold.MAX_RETRO_TEAM_TEMPLATES && <CloneTemplate teamId={teamId} templateId={templateId} />}
        </FirstLine>
        <Description>{description}</Description>
      </TemplateHeader>
      <Scrollable>
        <TemplatePromptList isOwner={isOwner} prompts={prompts} templateId={templateId} />
        {isOwner && <AddTemplatePrompt templateId={templateId} prompts={prompts} />}
      </Scrollable>
      <TemplateSharing teamId={teamId} template={selectedTemplate} />
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
export default createFragmentContainer(
  ReflectTemplateDetails,
  {
    settings: graphql`
      fragment ReflectTemplateDetails_settings on RetrospectiveMeetingSettings {
        selectedTemplate {
          ...ReflectTemplateDetailsTemplate @relay(mask: false)
        }
        teamTemplates {
          ...EditableTemplateName_teamTemplates
          ...RemoveTemplate_teamTemplates
        }
        team {
          id
          orgId
        }
      }
    `
  }
)
