import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import {TransitionStatus} from '../../../../hooks/useTransition'
import {DECELERATE} from '../../../../styles/animation'
import {meetingAvatarMediaQueries} from '../../../../styles/meeting'
import {NewMeetingAvatar_teamMember} from '../../../../__generated__/NewMeetingAvatar_teamMember.graphql'

const Item = styled('div')({
  position: 'relative'
})

const Picture = styled('img')({
  borderRadius: '100%',
  height: '100%',
  objectFit: 'cover', // fill will squish it, cover cuts off the edges
  minHeight: '100%', // needed to not pancake in firefox
  width: '100%'
})

const AvatarBlock = styled('div')<{status: TransitionStatus}>(({status}) => ({
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transition: `all 300ms ${DECELERATE}`,
  borderRadius: '100%',
  height: 32,
  maxWidth: 32,
  width: 32,
  [meetingAvatarMediaQueries[0]]: {
    height: 48,
    maxWidth: 48,
    width: 48
  },
  [meetingAvatarMediaQueries[1]]: {
    height: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56,
    maxWidth: 56,
    width: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 8 : 56
  }
}))

interface Props {
  onTransitionEnd: () => void
  status: TransitionStatus
  teamMember: NewMeetingAvatar_teamMember
}

const NewMeetingAvatar = (props: Props) => {
  const {onTransitionEnd, status, teamMember} = props
  return (
    <ErrorBoundary>
      <Item>
        <AvatarBlock status={status} onTransitionEnd={onTransitionEnd}>
          <Picture src={teamMember.picture} />
        </AvatarBlock>
      </Item>
    </ErrorBoundary>
  )
}

export default createFragmentContainer(NewMeetingAvatar, {
  teamMember: graphql`
    fragment NewMeetingAvatar_teamMember on TeamMember {
      picture
    }
  `
})
