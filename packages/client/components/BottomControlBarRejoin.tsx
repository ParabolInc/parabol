import React from 'react'
import {useTranslation} from 'react-i18next'
import {TransitionStatus} from '~/hooks/useTransition'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

interface Props {
  onClick: () => void
  status: TransitionStatus
  onTransitionEnd: () => void
}

const BottomControlBarRejoin = (props: Props) => {
  const {onClick, onTransitionEnd, status} = props

  const {t} = useTranslation()

  return (
    <BottomNavControl onClick={onClick} status={status} onTransitionEnd={onTransitionEnd}>
      <BottomNavIconLabel
        icon='person_pin_circle'
        iconColor='warm'
        label={t('BottomControlBarRejoin.Rejoin')}
      />
    </BottomNavControl>
  )
}

export default BottomControlBarRejoin
