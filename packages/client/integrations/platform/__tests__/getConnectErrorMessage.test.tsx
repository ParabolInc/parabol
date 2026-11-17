import {isValidElement} from 'react'
import {ERROR_POPUP_CLOSED} from '../../../utils/oauthPopupError'
import {getConnectErrorMessage} from '../getConnectErrorMessage'

const popupClosed = {message: ERROR_POPUP_CLOSED}

describe('getConnectErrorMessage', () => {
  it('is undefined without an error', () => {
    expect(getConnectErrorMessage(undefined, {})).toBeUndefined()
  })

  it('passes ordinary messages through', () => {
    expect(getConnectErrorMessage({message: 'nope'}, {authorizationHelpUrl: 'https://x'})).toBe(
      'nope'
    )
  })

  it('links the troubleshooting guide when the popup closed and the service has one', () => {
    const message = getConnectErrorMessage(popupClosed, {authorizationHelpUrl: 'https://x'})
    expect(isValidElement(message)).toBe(true)
  })

  it('shows the raw popup-closed message when the service has no guide', () => {
    expect(getConnectErrorMessage(popupClosed, {})).toBe(popupClosed.message)
  })
})
