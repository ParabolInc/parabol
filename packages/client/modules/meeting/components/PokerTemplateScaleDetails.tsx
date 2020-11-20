import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import FlatButton from '../../../components/FlatButton'
import Icon from '../../../components/Icon'
import MenuItemHR from '../../../components/MenuItemHR'
import useAtmosphere from '../../../hooks/useAtmosphere'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV2'
import {FONT_FAMILY} from '../../../styles/typographyV2'
import {PokerCards} from '../../../types/constEnums'
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

const IconButton = styled(FlatButton)({
  color: PALETTE.TEXT_GRAY,
  height: 24,
  width: 24,
  ':hover, :focus, :active': {
    color: PALETTE.TEXT_MAIN
  }
})

const BackIcon = styled(Icon)({
  color: 'inherit'
})

const ScaleDetailHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: '16px'
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

const ScaleNameAndValues = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column'
})

const Scrollable = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  width: '100%'
})

const ScaleDetailsTitle = styled('div')({
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  paddingLeft: '16px'
})

const HR = styled(MenuItemHR)({
  width: '100%'
})

const ScaleValues = styled('div')({
  ...textOverflow,
  color: PALETTE.TEXT_GRAY,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 12,
  lineHeight: '16px',
  paddingTop: '4px'
})

interface Props {
  gotoTeamTemplates: () => void
  gotoPublicTemplates: () => void
  viewer: PokerTemplateScaleDetails_viewer
}

const PokerTemplateScaleDetails = (props: Props) => {
  const {viewer} = props
  const team = viewer.team!
  const {scales} = team
  const scale = team.scale!
  const isOwner = scale.teamId === team!.id
  const atmosphere = useAtmosphere()

  const gotoTemplateDetail = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(team.id)?.setValue(null, 'editingScaleId')
    })
  }

  return (
    <ScaleValueEditor>
      <Scrollable>
        <ScaleDetailHeader onClick={gotoTemplateDetail}>
          <IconButton aria-label='Back to Template' onClick={gotoTemplateDetail}>
            <BackIcon>arrow_back</BackIcon>
          </IconButton>
          <ScaleDetailsTitle>{'Edit Scale'}</ScaleDetailsTitle>
        </ScaleDetailHeader>
        <HR />
        <ScaleHeader>
          <ScaleNameAndValues>
            <EditableTemplateScaleName
              name={scale.name}
              scaleId={scale.id}
              scales={scales}
              isOwner={isOwner}
            />
            <ScaleValues>
              {
                [...scale.values.filter(({isSpecial}) => !isSpecial).map(({label}) => label), PokerCards.QUESTION_CARD, PokerCards.PASS_CARD].join(", ")
              }
            </ScaleValues>
            <ScaleValues>{'Note: all scales include ? and Pass cards'}</ScaleValues>
          </ScaleNameAndValues>
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
        scales {
          ...EditableTemplateScaleName_scales
        }
        scale(scaleId: $scaleId) {
          id
          name
          teamId
          ...TemplateScaleValueList_scale
          values {
            label
            isSpecial
            ...AddPokerTemplateScaleValue_scaleValues
          }
        }
      }
    }
  `
})
