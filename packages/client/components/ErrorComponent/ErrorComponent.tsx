import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import PrimaryButton from '~/components/PrimaryButton'
import ReportErrorFeedback from '~/components/ReportErrorFeedback'
import useModal from '~/hooks/useModal'
import {isOldBrowserError} from '~/utils/isOldBrowserError'

const ErrorBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
  height: '100%'
})

const Button = styled(PrimaryButton)({
  marginTop: 8
})

const Link = styled('a')({
  color: 'inherit'
})

interface Props {
  error: Error
  eventId: string
}

const ErrorComponent = (props: Props) => {
  const {error, eventId} = props

  const {t} = useTranslation()

  console.error(error)
  const {modalPortal, openPortal, closePortal} = useModal()
  const isOldBrowserErr = isOldBrowserError(error.message)

  if (isOldBrowserErr) {
    const url = 'https://browser-update.org/update-browser.html'
    return (
      <ErrorBlock>
        {t('ErrorComponent.OhNoYouveFoundABugBecauseTheBrowserYoureUsingNeedsToBeUpdated')}
        <Button>
          <Link href={url} target='_blank' rel='noreferrer'>
            {t('ErrorComponent.UpdateNow')}
          </Link>
        </Button>
      </ErrorBlock>
    )
  }
  return (
    <ErrorBlock>
      {t('ErrorComponent.AnErrorHasOccurredWeveAlertedTheDevelopersTryRefreshingThePage')}
      {eventId && <Button onClick={openPortal}>{t('ErrorComponent.ReportFeedback')}</Button>}
      {modalPortal(<ReportErrorFeedback closePortal={closePortal} eventId={eventId} />)}
    </ErrorBlock>
  )
}

export default ErrorComponent
