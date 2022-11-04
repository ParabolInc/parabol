/**
 * Renders the delete button for a retro card, which floats in the top-right
 * corner of the card.
 */
import styled from '@emotion/styled'
import {Cancel} from '@mui/icons-material'
import React from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import RemoveReflectionMutation from '../../mutations/RemoveReflectionMutation'
import {PALETTE} from '../../styles/paletteV3'
import {ICON_SIZE} from '../../styles/typographyV2'
import withMutationProps, {WithMutationProps} from '../../utils/relay/withMutationProps'
import PlainButton from '../PlainButton/PlainButton'

interface Props extends WithMutationProps {
  meetingId: string
  reflectionId: string
  dataCy: string
}

const DeleteButton = styled(PlainButton)({
  backgroundColor: '#FFFFFF99',
  border: 0,
  borderRadius: '100%',
  height: ICON_SIZE.MD18,
  lineHeight: ICON_SIZE.MD18,
  padding: 0,
  position: 'absolute',
  right: -9,
  top: -9,
  width: ICON_SIZE.MD18
})
// Background shows through the transparent X of the icon
const Background = styled('div')({
  backgroundColor: '#FFFFFF',
  borderRadius: '100%',
  height: 10,
  left: 4,
  position: 'absolute',
  top: 4,
  width: 10,
  zIndex: 1
})

const StyledIcon = styled(Cancel)({
  color: PALETTE.SLATE_600,
  display: 'block',
  height: 18,
  width: 18,
  position: 'relative',
  zIndex: 2
})

const ReflectionCardDeleteButton = (props: Props) => {
  const atmosphere = useAtmosphere()
  const handleDelete = () => {
    const {onCompleted, onError, meetingId, reflectionId, submitMutation, submitting} = props
    if (submitting) return
    submitMutation()
    RemoveReflectionMutation(atmosphere, {reflectionId}, {meetingId, onError, onCompleted})
  }

  const {submitting, dataCy} = props
  const userLabel = 'Delete this reflection card'
  if (submitting) return null
  return (
    <DeleteButton data-cy={dataCy} aria-label={userLabel} onClick={handleDelete} title={userLabel}>
      <StyledIcon />
      <Background />
    </DeleteButton>
  )
}

export default withMutationProps(ReflectionCardDeleteButton)
