import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {AreaEnum} from 'types/graphql'
import {ThreadedTask_task} from '__generated__/ThreadedTask_task.graphql'
import defaultUserAvatar from '../styles/theme/images/avatar-user.svg'
import Avatar from './Avatar/Avatar'
import NullableTask from './NullableTask/NullableTask'

const Wrapper = styled('div')({
  display: 'flex',
  width: '100%'
})

const AvatarCol = styled('div')({
  display: 'flex'
})

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%'
})

const TaskAvatar = styled(Avatar)({
  margin: 12,
  marginTop: 0
})

const Header = styled('div')({
  display: 'flex',
  fontSize: 12,
  justifyContent: 'space-between',
  paddingBottom: 8,
  width: '100%'
})

const HeaderDescription = styled('div')({
  display: 'flex'
})

const HeaderName = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontWeight: 600
})

const HeaderResult = styled('div')({
  color: PALETTE.TEXT_GRAY,
  whiteSpace: 'pre-wrap'
})

const HeaderActions = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontWeight: 600,
  paddingRight: 12
})

interface Props {
  task: ThreadedTask_task
}

const ThreadedTask = (props: Props) => {
  const {task} = props
  const {createdByUser} = task
  const {picture, preferredName} = createdByUser
  return (
    <Wrapper>
      <AvatarCol>
        <TaskAvatar size={32} picture={picture || defaultUserAvatar} />
      </AvatarCol>
      <BodyCol>
        <Header>
          <HeaderDescription>
            <HeaderName>{preferredName}</HeaderName>
            <HeaderResult> added a Task</HeaderResult>
          </HeaderDescription>
          <HeaderActions>Reply</HeaderActions>
        </Header>
        <NullableTask area={AreaEnum.meeting} task={task} />
      </BodyCol>
    </Wrapper>
  )
}

export default createFragmentContainer(ThreadedTask, {
  task: graphql`
    fragment ThreadedTask_task on Task {
      id
      content
      createdByUser {
        picture
        preferredName
      }
    }
  `
})
