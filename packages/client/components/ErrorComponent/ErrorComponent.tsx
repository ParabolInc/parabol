import styled from '@emotion/styled'
import React from 'react'
import PrimaryButton from '~/components/PrimaryButton'
import ReportErrorFeedback from '~/components/ReportErrorFeedback'
import useModal from '~/hooks/useModal'
import useAtmosphere from '../../hooks/useAtmosphere'

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
  console.error(error)
  const {modalPortal, openPortal, closePortal} = useModal()
  const oldBrowserErrs = ['flatMap is not a function']
  const atmosphere = useAtmosphere()
  const {version} = atmosphere

  if (version && version !== __APP_VERSION__) {
    const handleClick = () => {
      window.location.reload()
    }
    return (
      <ErrorBlock>
        {`Oh no! You've found a bug because you're using an old version of Parabol. Try refreshing the page.`}
        <Button>
          <Link onClick={handleClick} target='_blank' rel='noreferrer'>
            Refresh
          </Link>
        </Button>
      </ErrorBlock>
    )
  }
  const isOldBrowserErr = oldBrowserErrs.find((err) => error.message.includes(err))
  if (isOldBrowserErr) {
    const url = 'https://browser-update.org/update-browser.html'
    return (
      <ErrorBlock>
        {"Oh no! You've found a bug because the browser you're using needs to be updated."}
        <Button>
          <Link href={url} target='_blank' rel='noreferrer'>
            Update now
          </Link>
        </Button>
      </ErrorBlock>
    )
  }
  return (
    <ErrorBlock>
      {'An error has occurred! We’ve alerted the developers. Try refreshing the page'}
      {eventId && <Button onClick={openPortal}>Report Feedback</Button>}
      {modalPortal(<ReportErrorFeedback closePortal={closePortal} eventId={eventId} />)}
    </ErrorBlock>
  )
}

export default ErrorComponent
