import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import CreateTemplate from '../../../../../static/images/illustrations/CreateTemplate.svg'
import {PALETTE} from '../../../styles/paletteV2'
import {ReflectTemplateDetails_teamTemplates} from '../../../__generated__/ReflectTemplateDetails_teamTemplates.graphql'
import {ReflectTemplateDetails_template} from '../../../__generated__/ReflectTemplateDetails_template.graphql'
import AddTemplatePrompt from './AddTemplatePrompt'
import EditableTemplateName from './EditableTemplateName'
import CloneOrRemoveTemplate from './RemoveTemplate'
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
  display: 'flex'
})
interface Props {
  template: ReflectTemplateDetails_template
  teamTemplates: ReflectTemplateDetails_teamTemplates
  teamId: string
}

const ReflectTemplateDetails = (props: Props) => {
  const {template, teamId, teamTemplates} = props
  const {id: templateId, name: templateName, prompts} = template
  const isOwner = template.teamId === teamId
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
          <CloneOrRemoveTemplate isOwner={isOwner} templateCount={teamTemplates.length} templateId={templateId} />
        </FirstLine>
        <Description>Dreated By Parabol</Description>
      </TemplateHeader>
      <TemplateSharing teamId={teamId} template={template} />
      <TemplatePromptList prompts={prompts} templateId={templateId} />
      <AddTemplatePrompt templateId={templateId} prompts={prompts} />
    </PromptEditor>
  )
}

export default createFragmentContainer(
  ReflectTemplateDetails,
  {
    teamTemplates: graphql`
      fragment ReflectTemplateDetails_teamTemplates on ReflectTemplate @relay(plural: true) {
        ...EditableTemplateName_teamTemplates
      }
    `,
    template: graphql`
      fragment ReflectTemplateDetails_template on ReflectTemplate {
        ...TemplateSharing_template
        id
        name
        prompts {
          ...TemplatePromptList_prompts
          ...AddTemplatePrompt_prompts
        }
        teamId
      }
    `
  }
)
