import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import useAtmosphere from '../../hooks/useAtmosphere'
import {PALETTE} from '../../styles/paletteV3'
import {Polls, PollsAriaLabels} from '../../types/constEnums'
import {EditablePollOption_option$key} from '../../__generated__/EditablePollOption_option.graphql'
import {updateLocalPollOption} from './local/newPoll'

const PollOptionInputRoot = styled('div')({
  position: 'relative',
  width: '100%',
  height: '36px',
  display: 'flex',
  alignItems: 'center'
})

const Input = styled('input')({
  width: '100%',
  padding: `8px 12px`,
  fontSize: '14px',
  color: PALETTE.SLATE_900,
  borderRadius: '7px',
  border: `1.5px solid ${PALETTE.SLATE_400}`,
  ':hover, :focus, :active': {
    outline: `none`,
    border: `1.5px solid ${PALETTE.SKY_500}`
  }
})

const Counter = styled('div')<{
  isVisible: boolean
  isMax: boolean
}>(({isVisible, isMax}) => ({
  display: isVisible ? 'block' : 'none',
  position: 'absolute',
  top: '0',
  right: '0',
  margin: '2px 6px',
  fontSize: '10px',
  color: isMax ? PALETTE.TOMATO_500 : PALETTE.SLATE_600
}))

interface Props {
  optionRef: EditablePollOption_option$key
  shouldAutoFocus: boolean
  placeholder: string
}

const EditablePollOption = (props: Props) => {
  const {optionRef, shouldAutoFocus, placeholder} = props

  const {t} = useTranslation()

  const pollOption = useFragment(
    graphql`
      fragment EditablePollOption_option on PollOption {
        id
        title
      }
    `,
    optionRef
  )

  const {id, title} = pollOption
  const atmosphere = useAtmosphere()
  const [isCounterVisible, setIsCounterVisible] = React.useState(false)
  const handlePollOptionUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateLocalPollOption(atmosphere, id, event.target.value)
  }
  const showCounter = () => {
    setIsCounterVisible(true)
  }
  const hideCounter = () => {
    setIsCounterVisible(false)
  }

  return (
    <PollOptionInputRoot>
      <Input
        aria-label={PollsAriaLabels.POLL_OPTION_EDITOR}
        placeholder={placeholder}
        value={title}
        onChange={handlePollOptionUpdate}
        maxLength={Polls.MAX_OPTION_TITLE_LENGTH}
        onFocus={showCounter}
        onBlur={hideCounter}
        autoFocus={shouldAutoFocus}
      />
      <Counter isVisible={isCounterVisible} isMax={title.length >= Polls.MAX_OPTION_TITLE_LENGTH}>
        {title.length}
        {t('EditablePollOption./')}
        {Polls.MAX_OPTION_TITLE_LENGTH}
      </Counter>
    </PollOptionInputRoot>
  )
}

export default EditablePollOption
