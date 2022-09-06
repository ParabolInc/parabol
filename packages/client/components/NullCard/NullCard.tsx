import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../../styles/paletteV3'
import {Card} from '../../types/constEnums'
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles'
import Ellipsis from '../Ellipsis/Ellipsis'

const CardBlock = styled('div')({
  ...CreateCardRootStyles,
  border: 0
})

const AddingHint = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: Card.FONT_SIZE,
  textAlign: 'center'
})

interface Props {
  className?: string
  preferredName: string
}

const NullCard = (props: Props) => {
  const {className, preferredName} = props

  const {t} = useTranslation()

  return (
    <CardBlock className={className}>
      <AddingHint>
        {preferredName}
        {t('NullCard.IsAddingATask')}
        <Ellipsis />
      </AddingHint>
    </CardBlock>
  )
}

export default NullCard
