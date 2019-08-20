import React, {useState} from 'react'
import CreditCardForm from './CreditCardForm'
import DialogTitle from 'components/DialogTitle'
import DialogContainer from '../../../../components/DialogContainer'
import UpgradeSuccess from '../../../../components/UpgradeSuccess'
import UpgradeLater from '../../../../components/UpgradeLater'
import styled from '@emotion/styled'
import CreditCardReassurance from './CreditCardReassurance'

export type CreditCardModalActionType = 'update' | 'upgrade' | 'squeeze'

const Container = styled(DialogContainer)({
  width: 312
})

interface Props {
  actionType: CreditCardModalActionType
  activeUserCount?: number
  closePortal: () => void
  orgId: string
}

type Status = 'success' | 'later' | 'init'

const CreditCardModal = (props: Props) => {
  const {actionType, activeUserCount, closePortal, orgId} = props
  const [status, setStatus] = useState<Status>('init')
  const onSuccess = actionType === 'update' ? closePortal : () => {
    setStatus('success')
  }
  const onLater = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('later')
  }

  if (status === 'success') return <UpgradeSuccess closePortal={closePortal}/>
  if (status === 'later') return <UpgradeLater closePortal={closePortal}/>

  return (
    <Container>
      <DialogTitle>{actionType === 'update' ? 'Update Credit Card' : 'Upgrade to Pro'}</DialogTitle>
      <CreditCardReassurance actionType={actionType}/>
      <CreditCardForm actionType={actionType} activeUserCount={activeUserCount} orgId={orgId} onSuccess={onSuccess} onLater={onLater}/>
    </Container>
  )
}

export default CreditCardModal
