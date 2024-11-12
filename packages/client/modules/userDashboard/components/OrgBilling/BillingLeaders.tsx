import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {BillingLeaders_organization$key} from '../../../../__generated__/BillingLeaders_organization.graphql'
import FlatButton from '../../../../components/FlatButton'
import IconLabel from '../../../../components/IconLabel'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import {PALETTE} from '../../../../styles/paletteV3'
import {ElementWidth} from '../../../../types/constEnums'
import plural from '../../../../utils/plural'
import BillingLeader from './BillingLeader'
import NewBillingLeaderInput from './NewBillingLeaderInput'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH,
  marginBottom: 16
})

const StyledRow = styled(Row)<{isAddingBillingLeader?: boolean}>(({isAddingBillingLeader}) => ({
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: isAddingBillingLeader ? PALETTE.SLATE_200 : 'inherit'
}))

const InfoText = styled('span')({
  fontSize: 16,
  paddingTop: 8,
  color: PALETTE.SLATE_900
})

const StyledButton = styled(FlatButton)({
  width: ElementWidth.BILLING_AVATAR,
  height: ElementWidth.BILLING_AVATAR,
  color: 'inherit',
  ':hover': {
    backgroundColor: 'transparent'
  }
})

const BillingLeaderLabel = styled(RowInfoHeading)({
  color: 'inherit',
  fontWeight: 400
})

const ButtonWrapper = styled('div')({
  color: PALETTE.SKY_500,
  flexDirection: 'row',
  display: 'flex',
  ':hover': {
    color: PALETTE.SKY_600,
    cursor: 'pointer'
  }
})

type Props = {
  organizationRef: BillingLeaders_organization$key
}

const BillingLeaders = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment BillingLeaders_organization on Organization {
        ...BillingLeader_organization
        ...NewBillingLeaderInput_organization
        isViewerBillingLeader: isBillingLeader
        billingLeaders {
          id
          ...BillingLeader_orgUser
        }
      }
    `,
    organizationRef
  )
  const [isAddingBillingLeader, setIsAddingBillingLeader] = useState(false)
  const {billingLeaders, isViewerBillingLeader} = organization
  const billingLeaderCount = billingLeaders.length

  const handleClick = () => {
    setIsAddingBillingLeader(true)
  }

  const removeInput = () => {
    setIsAddingBillingLeader(false)
  }

  return (
    <StyledPanel label={plural(billingLeaders.length, 'Billing Leader')}>
      <StyledRow>
        <InfoText>
          {
            'All billing leaders are able to see and update credit card information, change plans, and view invoices.'
          }
        </InfoText>
      </StyledRow>
      {billingLeaders.map((billingLeader, idx) => (
        <BillingLeader
          key={billingLeader.id}
          billingLeaderRef={billingLeader}
          isFirstRow={idx === 0}
          billingLeaderCount={billingLeaderCount}
          organizationRef={organization}
        />
      ))}
      {isViewerBillingLeader && (
        <StyledRow isAddingBillingLeader={isAddingBillingLeader}>
          {isAddingBillingLeader ? (
            <NewBillingLeaderInput removeInput={removeInput} organizationRef={organization} />
          ) : (
            <ButtonWrapper onClick={handleClick}>
              <StyledButton>
                <IconLabel iconLarge icon='add' />
              </StyledButton>
              <RowInfo>
                <RowInfoHeader>
                  <BillingLeaderLabel>Add Billing Leader</BillingLeaderLabel>
                </RowInfoHeader>
              </RowInfo>
            </ButtonWrapper>
          )}
        </StyledRow>
      )}
    </StyledPanel>
  )
}

export default BillingLeaders
