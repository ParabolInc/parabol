import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import useModal from '../hooks/useModal'
import {PALETTE} from '../styles/paletteV3'
import lazyPreload from '../utils/lazyPreload'
import IconLabel from './IconLabel'
import LinkButton from './LinkButton'

const DeleteAccountModal = lazyPreload(
  () => import(/* webpackChunkName: 'DeleteAccountModal' */ './DeleteAccountModal')
)

const Hint = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 13,
  marginTop: 8
})

const DeleteAccount = () => {
  //FIXME i18n: Click to permanently delete your account.
  //FIXME i18n: Delete Account
  const {t} = useTranslation()

  const {togglePortal, modalPortal} = useModal()
  return (
    <>
      <div>
        <LinkButton
          aria-label='Click to permanently delete your account.'
          palette='red'
          onClick={togglePortal}
        >
          <IconLabel icon='remove_circle' label='Delete Account' />
        </LinkButton>
        <Hint>
          <b>{t('DeleteAccount.Note')}</b>
          {t('DeleteAccount.:')}
          {t('DeleteAccount.ThisCanTBeUndone.')}
        </Hint>
      </div>
      {modalPortal(<DeleteAccountModal />)}
    </>
  )
}

export default DeleteAccount
