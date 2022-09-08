import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../../../../styles/paletteV3'
import {Pricing} from '../../../../types/constEnums'
import plural from '../../../../utils/plural'
import {CreditCardModalActionType} from './CreditCardModal'

interface Props {
  activeUserCount?: number
  actionType: CreditCardModalActionType
}

const Line = styled('div')({
  background: PALETTE.SLATE_100,
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  display: 'flex',
  fontSize: 13,
  lineHeight: '20px',
  marginTop: 8
})

const UserBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  padding: 9,
  justifyContent: 'center',
  textAlign: 'center' // for multi-line
})

const UnitPriceBlock = styled('div')({
  alignItems: 'center',
  borderLeft: `1px solid ${PALETTE.SLATE_400}`,
  borderRight: `1px solid ${PALETTE.SLATE_400}`,
  display: 'flex',
  justifyContent: 'center',
  padding: 9
})

const TotalBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontWeight: 600,
  justifyContent: 'center',
  padding: 9
})

const CreditCardPricingLine = (props: Props) => {
  const {actionType, activeUserCount} = props

  const {t} = useTranslation()

  if (actionType === 'update' || !activeUserCount) return null
  const unitPriceString = (Pricing.PRO_SEAT_COST / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })
  const totalPriceString = ((Pricing.PRO_SEAT_COST / 100) * activeUserCount).toLocaleString(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }
  )
  return (
    <Line>
      <UserBlock>
        {t('CreditCardPricingLine.ActiveUserCountActivePluralActiveUserCountUser', {
          activeUserCount,
          pluralActiveUserCountUser: plural(activeUserCount, 'User')
        })}
      </UserBlock>
      <UnitPriceBlock>
        {t('CreditCardPricingLine.UnitPriceStringEa', {
          unitPriceString
        })}
      </UnitPriceBlock>
      <TotalBlock>
        {t('CreditCardPricingLine.TotalPriceStringMo', {
          totalPriceString
        })}
      </TotalBlock>
    </Line>
  )
}

export default CreditCardPricingLine
