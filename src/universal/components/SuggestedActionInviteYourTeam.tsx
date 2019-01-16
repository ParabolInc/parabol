import {SuggestedActionInviteYourTeam_viewer} from '__generated__/SuggestedActionInviteYourTeam_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import PrimaryButton from 'universal/components/PrimaryButton'
import {buttonShadow, cardShadow} from 'universal/styles/elevation'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'

interface Props {
  viewer: SuggestedActionInviteYourTeam_viewer
}

const Surface = styled('div')({
  alignItems: 'center',
  background: '#fff',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  width: '100%'
})

const Background = styled('div')({
  background: 'blue',
  height: 142,
  width: '100%'
})

const Message = styled('div')({
  marginTop: '1.5rem',
  marginBottom: '1rem'
})

const ActionButton = styled(PrimaryButton)({
  marginBottom: 16
})

const CancelIcon = styled(Icon)({
  color: PALETTE.TEXT.LIGHT,
  position: 'absolute',
  right: 8,
  top: 8,
  opacity: 0.5,
  '&:hover': {
    opacity: 1
  }
})

const FloatingSealIcon = styled(Icon)({
  color: PALETTE.PRIMARY.MAIN,
  background: PALETTE.BACKGROUND.MAIN_DARKENED,
  borderRadius: '100%',
  boxShadow: buttonShadow,
  padding: 8,
  position: 'absolute',
  fontSize: ICON_SIZE.MD36,
  top: 100,
  userSelect: 'none'
})
const actionLabel = 'Invite Your Teammates'
const SuggestedActionInviteYourTeam = (props: Props) => {
  const {viewer} = props
  const {suggestedAction} = viewer
  const {
    team: {name: teamName}
  } = suggestedAction
  return (
    <Surface>
      <Background />
      <Message>Invite your teammates to: {teamName} </Message>
      <ActionButton aria-label={actionLabel} size='medium' onClick={() => console.log('click')}>
        {actionLabel}
      </ActionButton>
      <PlainButton>
        <CancelIcon>cancel</CancelIcon>
      </PlainButton>

      <FloatingSealIcon>group_add</FloatingSealIcon>
    </Surface>
  )
}

export default createFragmentContainer(
  SuggestedActionInviteYourTeam,
  graphql`
    fragment SuggestedActionInviteYourTeam_viewer on User {
      suggestedAction {
        ... on SuggestedActionInviteYourTeam {
          team {
            name
          }
        }
      }
    }
  `
)
