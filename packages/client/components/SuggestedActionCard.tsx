import styled from '@emotion/styled'
import {Cancel, ChangeHistory, GroupAdd, GroupWork, History, PersonAdd} from '@mui/icons-material'
import React, {ReactNode} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import DismissSuggestedActionMutation from '../mutations/DismissSuggestedActionMutation'
import {DECELERATE, fadeIn} from '../styles/animation'
import {buttonShadow, cardShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import PlainButton from './PlainButton/PlainButton'
import SuggestedActionBackground from './SuggestedActionBackground'

interface Props extends WithMutationProps {
  backgroundColor: string
  children: ReactNode
  iconName: string
  suggestedActionId: string
}

const Surface = styled('div')({
  animation: `${fadeIn.toString()} 300ms ${DECELERATE}`,
  alignItems: 'center',
  background: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
})

const CancelIcon = styled(Cancel)({
  background: `rgba(255,255,255,0.8)`,
  borderRadius: '100%',
  color: PALETTE.SLATE_700,
  position: 'absolute',
  right: 8,
  top: 8,
  opacity: 0.7,
  '&:hover': {
    opacity: 1
  }
})

const FloatingSealIcon = styled('div')({
  color: PALETTE.GRAPE_700,
  background: PALETTE.SLATE_300,
  borderRadius: '100%',
  boxShadow: buttonShadow,
  padding: 8,
  height: 36,
  width: 36,
  position: 'absolute',
  '& svg': {
    fontSize: 36
  },
  top: 100,
  userSelect: 'none'
})

const SuggestedActionCard = (props: Props) => {
  const atmosphere = useAtmosphere()
  const onCancel = () => {
    const {submitting, submitMutation, suggestedActionId, onCompleted, onError} = props
    if (submitting) return
    submitMutation()
    DismissSuggestedActionMutation(atmosphere, {suggestedActionId}, {onError, onCompleted})
  }

  const {backgroundColor, children, iconName} = props
  return (
    <Surface>
      <SuggestedActionBackground backgroundColor={backgroundColor} />
      {children}
      <PlainButton onClick={onCancel}>
        <CancelIcon />
      </PlainButton>
      <FloatingSealIcon>
        {
          {
            group_add: <GroupAdd />,
            person_add: <PersonAdd />,
            change_history: <ChangeHistory />,
            history: <History />,
            group_work: <GroupWork />
          }[iconName]
        }
      </FloatingSealIcon>
    </Surface>
  )
}

export default withMutationProps(SuggestedActionCard)
