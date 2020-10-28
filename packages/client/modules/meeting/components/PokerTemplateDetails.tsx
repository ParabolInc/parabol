import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import customTemplate from '../../../../../static/images/illustrations/customTemplate.svg'
import {PALETTE} from '../../../styles/paletteV2'
import getTemplateList from '../../../utils/getTemplateList'
import makeTemplateDescription from '../../../utils/makeTemplateDescription'
import {PokerTemplateDetails_settings} from '../../../__generated__/PokerTemplateDetails_settings.graphql'
import CloneTemplate from './CloneTemplate'
import EditableTemplateName from './EditableTemplateName'
import RemoveTemplate from './RemoveTemplate'
import TemplateSharing from './TemplateSharing'
import TemplateDimensionList from './TemplateDimensionList'

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
  settings: PokerTemplateDetails_settings
}

const PokerTemplateDetails = (props: Props) => {
  const {gotoTeamTemplates, gotoPublicTemplates, settings} = props
  const {teamTemplates, selectedTemplate, team} = settings
  const {id: templateId, name: templateName, dimensions} = selectedTemplate
  const {id: teamId, orgId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const isOwner = selectedTemplate.teamId === teamId
  const description = makeTemplateDescription(lowestScope, selectedTemplate)
  const templateCount = teamTemplates.length
  return (
    <PromptEditor>
      <Scrollable>
        <CreateTemplateImg src={customTemplate} />
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
        <TemplateDimensionList isOwner={isOwner} dimensions={dimensions} templateId={templateId} />
        {/* {isOwner && <AddTemplatePrompt templateId={templateId} prompts={prompts} />} */}
      </Scrollable>
      <TemplateSharing teamId={teamId} template={selectedTemplate} />
    </PromptEditor>
  )
}

graphql`
  fragment PokerTemplateDetailsTemplate on PokerTemplate {
    ...TemplateSharing_template
    ...getTemplateList_template
    ...makeTemplateDescription_template
    id
    name
    dimensions {
      ...TemplateDimensionList_dimensions
    }
    teamId
  }
`
export default createFragmentContainer(PokerTemplateDetails, {
  settings: graphql`
    fragment PokerTemplateDetails_settings on PokerMeetingSettings {
      selectedTemplate {
        ...PokerTemplateDetailsTemplate @relay(mask: false)
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
