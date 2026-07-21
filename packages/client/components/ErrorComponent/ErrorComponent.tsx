import styled from '@emotion/styled'
import {useState} from 'react'
import PrimaryButton from '~/components/PrimaryButton'
import ReportErrorFeedback from '~/components/ReportErrorFeedback'
import {
  isExtensionError,
  isIgnoredError,
  isNetworkError,
  isOldBrowserError
} from '../../utils/errorFilters'

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
  if (!isIgnoredError(error)) {
    console.error(error)
  }
  const [isOpen, setIsOpen] = useState(false)

  if (isExtensionError(error)) {
    return (
      <ErrorBlock>
        <div>
          Oh no! Seems like you're using Google Translate or a similar extension, which has a bug in
          it that can crash apps like ours.
        </div>
        <div>If this continues, please disable the extension</div>
        <Button onClick={() => window.location.reload()}>Refresh the page</Button>
      </ErrorBlock>
    )
  }

  if (isOldBrowserError(error)) {
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

  if (isNetworkError(error)) {
    return (
      <ErrorBlock>
        There was a network issue. Please check your connection and try again.
        <Button onClick={() => window.location.reload()}>Refresh the page</Button>
      </ErrorBlock>
    )
  }

  return (
    <ErrorBlock>
      {'An error has occurred! We’ve alerted the developers. Try refreshing the page'}
      {eventId && <Button onClick={() => setIsOpen(true)}>Report Feedback</Button>}
      <ReportErrorFeedback
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        error={error}
        eventId={eventId}
      />
    </ErrorBlock>
  )
}

export default ErrorComponent
