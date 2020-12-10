import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useEffect} from 'react'
import {useState} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import FlatButton from '../../../components/FlatButton'
import Icon from '../../../components/Icon'
import MenuItemHR from '../../../components/MenuItemHR'
import useAtmosphere from '../../../hooks/useAtmosphere'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV2'
import {FONT_FAMILY} from '../../../styles/typographyV2'
import {PokerCards, Threshold} from '../../../types/constEnums'
import {PokerTemplateScaleDetails_viewer} from '../../../__generated__/PokerTemplateScaleDetails_viewer.graphql'
import AddPokerTemplateScaleValue from './AddPokerTemplateScaleValue'
import EditableTemplateScaleName from './EditableTemplateScaleName'
import NewTemplateScaleValueLabelInput from './NewTemplateScaleValueLabelInput'
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
  alignItems: 'center',
  color: PALETTE.TEXT_GRAY,
  height: 32,
  justifyContent: 'center',
  padding: 0,
  width: 32,
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
  padding: 12
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
  lineHeight: '32px',
  paddingLeft: 12,
  userSelect: 'none'
})

const HR = styled(MenuItemHR)({
  width: '100%',
  marginTop: 0
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
  const incomingEdges = scale.values ?? null
  const isOwner = scale.teamId === team!.id
  const atmosphere = useAtmosphere()
  const [isEditingScaleValueLabel, setIsEditingScaleValueLabel] = useState(false)
  const [edges, setEdges] = useState([] as readonly any[])

  useEffect(() => {
    if (incomingEdges) {
      setEdges(incomingEdges)
      setIsEditingScaleValueLabel(false)
    }
  }, [incomingEdges])

  const gotoTemplateDetail = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(team.id)?.setValue(null, 'editingScaleId')
    })
  }

  if (edges.length === 0 && !isEditingScaleValueLabel) {
    return <AddPokerTemplateScaleValue setIsEditing={setIsEditingScaleValueLabel} />
  }

  return (
    <ScaleValueEditor>
      <Scrollable>
        <ScaleDetailHeader>
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
        <NewTemplateScaleValueLabelInput
          isOwner={isOwner}
          isHover={true}
          isEditing={isEditingScaleValueLabel}
          setIsEditing={setIsEditingScaleValueLabel}
          scale={scale}
        />
        {!isEditingScaleValueLabel && scale.values.length < Threshold.MAX_POKER_TEMPLATE_SCALES &&
          <AddPokerTemplateScaleValue
            setIsEditing={setIsEditingScaleValueLabel}
          />
        }
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
          ...NewTemplateScaleValueLabelInput_scale
          values {
            label
            isSpecial
          }
        }
      }
    }
  `
})
