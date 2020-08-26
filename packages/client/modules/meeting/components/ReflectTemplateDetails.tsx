import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import createTemplateHeader from '../../../../../static/images/illustrations/createTemplateHeader.svg'
import {PALETTE} from '../../../styles/paletteV2'
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
  paddingLeft: 56,
  paddingRight: 16,
  width: '100%'
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

const CreateTemplateImg = styled('img')({
  margin: '0 auto',
  padding: '24px 56px 0',
  width: 320
})

const Description = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 14,
  lineHeight: '20px'
})

const FirstLine = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const Scrollable = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  width: '100%'
})

interface Props {
  gotoTeamTemplates: () => void
  gotoPublicTemplates: () => void
  settings: ReflectTemplateDetails_settings
}

const ReflectTemplateDetails = (props: Props) => {
  const {gotoTeamTemplates, gotoPublicTemplates, settings} = props
  const {teamTemplates, selectedTemplate, team} = settings
  const {id: templateId, name: templateName, prompts} = selectedTemplate
  const {id: teamId, orgId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const isOwner = selectedTemplate.teamId === teamId
  const description = makeTemplateDescription(lowestScope, selectedTemplate)
  const templateCount = teamTemplates.length
  return (
    <PromptEditor>
      <Scrollable>
        <CreateTemplateImg src={createTemplateHeader} />
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
              />
            )}
            {!isOwner && (
              <CloneTemplate
                gotoTeamTemplates={gotoTeamTemplates}
                teamId={teamId}
                templateId={templateId}
                templateCount={templateCount}
              />
            )}
          </FirstLine>
          <Description>{description}</Description>
        </TemplateHeader>
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
export default createFragmentContainer(ReflectTemplateDetails, {
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
})
