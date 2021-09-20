import React, {Ref, useCallback} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Poll_poll} from '~/__generated__/Poll_poll.graphql'

import {PollContext, PollState} from './PollContext'
import {cardShadow, Elevation} from '~/styles/elevation'
import ThreadedItemWrapper from '../ThreadedItemWrapper'
import ThreadedAvatarColumn from '../ThreadedAvatarColumn'
import ThreadedItemHeaderDescription from '../ThreadedItemHeaderDescription'
import cardRootStyles from '~/styles/helpers/cardRootStyles'
import {PALETTE} from '~/styles/paletteV3'
import {updateLocalPollOption} from './local/newPoll'
import useAtmosphere from '~/hooks/useAtmosphere'

interface PollProps {
  children: React.ReactNode
  poll: Poll_poll
  dataCy: string
}

const BodyCol = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 8,
  width: '100%',
  marginTop: 10
})

const PollRoot = styled('div')<{
  pollState: PollState
}>(({pollState}) => ({
  ...cardRootStyles,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'start',
  outline: 'none',
  padding: `0`,
  overflow: 'hidden',
  color: PALETTE.SLATE_600,
  backgroundColor: PALETTE.WHITE,
  border: `1px solid ${PALETTE.SLATE_400}`,
  boxShadow: pollState === 'creating' ? cardShadow : Elevation.Z0
}))

const Poll = React.forwardRef((props: PollProps, ref: Ref<HTMLDivElement>) => {
  const {dataCy, poll, children} = props
  const atmosphere = useAtmosphere()

  // TODO fixme, should not be nullable
  const {picture, preferredName} = poll.createdByUser!
  const [selectedOptionId, setSelectedOptionId] = React.useState<string>('')
  const onOptionSelected = React.useCallback((optionId: string) => {
    setSelectedOptionId(optionId)
  }, [])
  const pollState: PollState = poll.id.includes('tmp') ? 'creating' : 'created'

  const updatePollOption = useCallback((id: string, updatedValue: string) => {
    updateLocalPollOption(atmosphere, id, updatedValue)
  }, [])
  const value = React.useMemo(
    () => ({pollState, poll, onOptionSelected, selectedOptionId, updatePollOption} as const),
    [onOptionSelected, selectedOptionId, pollState, poll, updatePollOption]
  )

  return (
    <PollContext.Provider value={value}>
      <ThreadedItemWrapper data-cy={`${dataCy}-wrapper`} isReply={false} ref={ref}>
        <ThreadedAvatarColumn isReply={false} picture={picture} />
        <BodyCol>
          <ThreadedItemHeaderDescription
            title={preferredName}
            subTitle={pollState === 'creating' ? 'is creating a poll...' : 'added a poll'}
          />
          <PollRoot ref={ref} pollState={pollState}>
            {children}
          </PollRoot>
        </BodyCol>
      </ThreadedItemWrapper>
    </PollContext.Provider>
  )
})

export default createFragmentContainer(Poll, {
  poll: graphql`
    fragment Poll_poll on Poll {
      id
      title
      createdBy
      createdByUser {
        id
        preferredName
        picture
      }
      threadSortOrder
      options {
        id
        title
      }
    }
  `
})
