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
  const {t} = useTranslation()

  const {togglePortal, modalPortal} = useModal()
  return (
    <>
      <div>
        <LinkButton
          aria-label={t('DeleteAccount.ClickToPermanentlyDeleteYourAccount')}
          palette='red'
          onClick={togglePortal}
        >
          <IconLabel icon='remove_circle' label={t('DeleteAccount.DeleteAccount')} />
        </LinkButton>
        <Hint>
          <b>{t('DeleteAccount.Note')}</b>: {t('DeleteAccount.ThisCantBeUndone')}
        </Hint>
      </div>
      {modalPortal(<DeleteAccountModal />)}
    </>
  )
}

export default DeleteAccount
