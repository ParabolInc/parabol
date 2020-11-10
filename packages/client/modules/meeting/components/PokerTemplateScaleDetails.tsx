import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PokerTemplateScaleDetails_viewer} from '../../../__generated__/PokerTemplateScaleDetails_viewer.graphql'
import AddPokerTemplateScaleValue from './AddPokerTemplateScaleValue'
import EditableTemplateScaleName from './EditableTemplateScaleName'
import TemplateScaleValueList from './TemplateScaleValueList'

const ScaleHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '16px 0',
  paddingLeft: 56,
  paddingRight: 16,
  width: '100%'
})

const ScaleValueEditor = styled('div')({
  alignItems: 'flex-start',
  background: '#fff',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxWidth: 520,
  width: '100%'
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
  viewer: PokerTemplateScaleDetails_viewer
}

const PokerTemplateScaleDetails = (props: Props) => {
  const {viewer} = props
  const team = viewer.team!
  const {meetingSettings} = team
  const {teamScales} = meetingSettings
  const scale = meetingSettings.scale!
  const isOwner = scale.teamId === team!.id
  return (
    <ScaleValueEditor>
      <Scrollable>
        <ScaleHeader>
          <FirstLine>
            <EditableTemplateScaleName
              name={scale.name}
              scaleId={scale.id}
              scales={teamScales}
              isOwner={isOwner}
            />
            {/* {isOwner && (
              <RemoveTemplate
                templateId={templateId}
                teamId={teamId}
                teamTemplates={teamTemplates}
                gotoPublicTemplates={gotoPublicTemplates}
                type={MeetingTypeEnum.poker}
              />
            )}
            {!isOwner && (
              <CloneTemplate
                gotoTeamTemplates={gotoTeamTemplates}
                teamId={teamId}
                templateId={templateId}
                templateCount={templateCount}
                type={MeetingTypeEnum.poker}
              />
            )} */}
          </FirstLine>
        </ScaleHeader>
        <TemplateScaleValueList scale={scale} />
        <AddPokerTemplateScaleValue scaleId={scale.id} scaleValues={scale.values} />
      </Scrollable>
    </ScaleValueEditor>
  )
}

export default createFragmentContainer(PokerTemplateScaleDetails, {
  viewer: graphql`
    fragment PokerTemplateScaleDetails_viewer on User {
      team(teamId: $teamId) {
        id
        meetingSettings(meetingType: poker) {
          ... on PokerMeetingSettings {
            teamScales {
              ...EditableTemplateScaleName_scales
            }
            scale(scaleId: $scaleId) {
              id
              name
              teamId
              ...TemplateScaleValueList_scale
              values {
                ...AddPokerTemplateScaleValue_scaleValues
              }
            }
          }
        }
      }
    }
  `
})
