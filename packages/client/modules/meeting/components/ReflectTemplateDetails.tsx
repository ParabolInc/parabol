import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import customTemplate from '../../../../../static/images/illustrations/customTemplate.png'
import dropAddKeepImproveDAKITemplate from '../../../../../static/images/illustrations/dakiTemplate.png'
import energyLevelsTemplate from '../../../../../static/images/illustrations/energyLevelsTemplate.png'
import fourLsTemplate from '../../../../../static/images/illustrations/fourLsTemplate.png'
import gladSadMadTemplate from '../../../../../static/images/illustrations/gladSadMadTemplate.png'
import leanCoffeeTemplate from '../../../../../static/images/illustrations/leanCoffeeTemplate.png'
import mountainClimberTemplate from '../../../../../static/images/illustrations/mountainClimberTemplate.png'
import sailboatTemplate from '../../../../../static/images/illustrations/sailboatTemplate.png'
import starfishTemplate from '../../../../../static/images/illustrations/starfishTemplate.png'
import startStopContinueTemplate from '../../../../../static/images/illustrations/startStopContinueTemplate.png'
import threeLittlePigsTemplate from '../../../../../static/images/illustrations/threeLittlePigsTemplate.png'
import whatWentWellTemplate from '../../../../../static/images/illustrations/whatWentWellTemplate.png'
import winningStreakTemplate from '../../../../../static/images/illustrations/winningStreakTemplate.png'
import workingStuckTemplate from '../../../../../static/images/illustrations/workingStuckTemplate.png'
import easterRetrospectiveTemplate from '../../../../../static/images/illustrations/easterRetrospectiveTemplate.png'
import heardSeenRespectedHSRTemplate from '../../../../../static/images/illustrations/heardSeenRespectedHSRTemplate.png'
import holiRetrospectiveTemplate from '../../../../../static/images/illustrations/holiRetrospectiveTemplate.png'
import lunarNewYearRetrospectiveTemplate from '../../../../../static/images/illustrations/lunarNewYearRetrospectiveTemplate.png'
import midsummerRetrospectiveTemplate from '../../../../../static/images/illustrations/midsummerRetrospectiveTemplate.png'
import aChristmasCarolRetrospectiveTemplate from '../../../../../static/images/illustrations/aChristmasCarolRetrospectiveTemplate.png'
import alwaysBeLearningRetrospectiveTemplate from '../../../../../static/images/illustrations/alwaysBeLearningRetrospectiveTemplate.png'
import diwaliRetrospectiveTemplate from '../../../../../static/images/illustrations/diwaliRetrospectiveTemplate.png'
import dreamTeamRetrospectiveTemplate from '../../../../../static/images/illustrations/dreamTeamRetrospectiveTemplate.png'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import handsOnDeckActivityTemplate from '../../../../../static/images/illustrations/handsOnDeckActivityTemplate.png'
import herosJourneyTemplate from '../../../../../static/images/illustrations/herosJourneyTemplate.png'
import highlightsLowlightsTemplate from '../../../../../static/images/illustrations/highlightsLowlightsTemplate.png'
import hopesAndFearsTemplate from '../../../../../static/images/illustrations/hopesAndFearsTemplate.png'
import hotAirBalloonTemplate from '../../../../../static/images/illustrations/hotAirBalloonTemplate.png'
import keepProblemTryTemplate from '../../../../../static/images/illustrations/keepProblemTryTemplate.png'
import marieKondoRetrospectiveTemplate from '../../../../../static/images/illustrations/marieKondoRetrospectiveTemplate.png'
import original4Template from '../../../../../static/images/illustrations/original4Template.png'
import questionsCommentsConcernsTemplate from '../../../../../static/images/illustrations/questionsCommentsConcernsTemplate.png'
import roseThornBudTemplate from '../../../../../static/images/illustrations/roseThornBudTemplate.png'
import sWOTAnalysisTemplate from '../../../../../static/images/illustrations/sWOTAnalysisTemplate.png'
import saMoLoTemplate from '../../../../../static/images/illustrations/saMoLoTemplate.png'
import scrumValuesRetrospectiveTemplate from '../../../../../static/images/illustrations/scrumValuesRetrospectiveTemplate.png'
import sixThinkingHatsTemplate from '../../../../../static/images/illustrations/sixThinkingHatsTemplate.png'
import speedCarTemplate from '../../../../../static/images/illustrations/speedCarTemplate.png'
import superheroRetrospectiveTemplate from '../../../../../static/images/illustrations/superheroRetrospectiveTemplate.png'
import surprisedWorriedInspiredTemplate from '../../../../../static/images/illustrations/surprisedWorriedInspiredTemplate.png'
import teamCharterTemplate from '../../../../../static/images/illustrations/teamCharterTemplate.png'
import teamRetreatPlanningTemplate from '../../../../../static/images/illustrations/teamRetreatPlanningTemplate.png'
import thanksgivingRetrospectiveTemplate from '../../../../../static/images/illustrations/thanksgivingRetrospectiveTemplate.png'
import wRAPTemplate from '../../../../../static/images/illustrations/wRAPTemplate.png'
import wsjfTemplate from '../../../../../static/images/illustrations/wsjfTemplate.png'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import {PALETTE} from '../../../styles/paletteV3'
import {Threshold} from '../../../types/constEnums'
import getTemplateList from '../../../utils/getTemplateList'
import makeTemplateDescription from '../../../utils/makeTemplateDescription'
import {ReflectTemplateDetails_settings} from '../../../__generated__/ReflectTemplateDetails_settings.graphql'
import {ReflectTemplateDetails_viewer} from '../../../__generated__/ReflectTemplateDetails_viewer.graphql'
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
  settings: ReflectTemplateDetails_settings
  viewer: ReflectTemplateDetails_viewer
}

const ReflectTemplateDetails = (props: Props) => {
  const {gotoTeamTemplates, gotoPublicTemplates, closePortal, settings, viewer} = props
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
  const defaultIllustrations = {
    aChristmasCarolRetrospectiveTemplate: aChristmasCarolRetrospectiveTemplate,
    alwaysBeLearningRetrospectiveTemplate: alwaysBeLearningRetrospectiveTemplate,
    diwaliRetrospectiveTemplate: diwaliRetrospectiveTemplate,
    dreamTeamRetrospectiveTemplate: dreamTeamRetrospectiveTemplate,
    dropAddKeepImproveDAKITemplate: dropAddKeepImproveDAKITemplate,
    easterRetrospectiveTemplate: easterRetrospectiveTemplate,
    energyLevelsTemplate: energyLevelsTemplate,
    fourLsTemplate: fourLsTemplate,
    gladSadMadTemplate: gladSadMadTemplate,
    halloweenRetrospectiveTemplate: halloweenRetrospectiveTemplate,
    handsOnDeckActivityTemplate: handsOnDeckActivityTemplate,
    heardSeenRespectedHSRTemplate: heardSeenRespectedHSRTemplate,
    herosJourneyTemplate: herosJourneyTemplate,
    highlightsLowlightsTemplate: highlightsLowlightsTemplate,
    holiRetrospectiveTemplate: holiRetrospectiveTemplate,
    hopesAndFearsTemplate: hopesAndFearsTemplate,
    hotAirBalloonTemplate: hotAirBalloonTemplate,
    keepProblemTryTemplate: keepProblemTryTemplate,
    leanCoffeeTemplate: leanCoffeeTemplate,
    lunarNewYearRetrospectiveTemplate: lunarNewYearRetrospectiveTemplate,
    marieKondoRetrospectiveTemplate: marieKondoRetrospectiveTemplate,
    midsummerRetrospectiveTemplate: midsummerRetrospectiveTemplate,
    mountainClimberTemplate: mountainClimberTemplate,
    original4Template: original4Template,
    questionsCommentsConcernsTemplate: questionsCommentsConcernsTemplate,
    roseThornBudTemplate: roseThornBudTemplate,
    sWOTAnalysisTemplate: sWOTAnalysisTemplate,
    saMoLoTemplate: saMoLoTemplate,
    sailboatTemplate: sailboatTemplate,
    scrumValuesRetrospectiveTemplate: scrumValuesRetrospectiveTemplate,
    sixThinkingHatsTemplate: sixThinkingHatsTemplate,
    speedCarTemplate: speedCarTemplate,
    starfishTemplate: starfishTemplate,
    startStopContinueTemplate: startStopContinueTemplate,
    superheroRetrospectiveTemplate: superheroRetrospectiveTemplate,
    surprisedWorriedInspiredTemplate: surprisedWorriedInspiredTemplate,
    teamCharterTemplate: teamCharterTemplate,
    teamRetreatPlanningTemplate: teamRetreatPlanningTemplate,
    thanksgivingRetrospectiveTemplate: thanksgivingRetrospectiveTemplate,
    threeLittlePigsTemplate: threeLittlePigsTemplate,
    wRAPTemplate: wRAPTemplate,
    whatWentWellTemplate: whatWentWellTemplate,
    winningStreakTemplate: winningStreakTemplate,
    workingStuckTemplate: workingStuckTemplate,
    wsjfTemplate: wsjfTemplate
    //cannot find
    //newYearRetrospectiveTemplate: newYearRetrospectiveTemplate,
  } as const
  const headerImg = defaultIllustrations[templateId as keyof typeof defaultIllustrations]
    ? defaultIllustrations[templateId as keyof typeof defaultIllustrations]
    : customTemplate
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
export default createFragmentContainer(ReflectTemplateDetails, {
  settings: graphql`
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
  viewer: graphql`
    fragment ReflectTemplateDetails_viewer on User {
      featureFlags {
        templateLimit
      }
      ...makeTemplateDescription_viewer
    }
  `
})
