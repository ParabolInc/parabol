import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {DeleteOutline} from '~/ui/icons'
import type {OrgAuthenticationDisconnectIdP_saml$key} from '../../../../__generated__/OrgAuthenticationDisconnectIdP_saml.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useDisconnectSAMLMutation from '../../../../mutations/useDisconnectSAMLMutation'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

interface Props {
  samlRef: OrgAuthenticationDisconnectIdP_saml$key
  disabled: boolean
}

const OrgAuthenticationDisconnectIdP = (props: Props) => {
  const {samlRef, disabled} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationDisconnectIdP_saml on SAML {
        id
        domains
      }
    `,
    samlRef
  )
  const {id: samlId, domains} = saml
  const atmosphere = useAtmosphere()
  const [isOpen, setIsOpen] = useState(false)
  const [disconnect, submitting] = useDisconnectSAMLMutation()
  const close = () => setIsOpen(false)
  const closeWithError = (message: string) => {
    close()
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'disconnectSAMLError',
      message,
      autoDismiss: 5
    })
  }
  const confirm = () => {
    disconnect({
      variables: {samlId},
      onCompleted: (_res, errors) => {
        const error = errors?.[0]
        if (error) {
          closeWithError(error.message)
        } else {
          close()
        }
      },
      onError: (error) => closeWithError(error.message)
    })
  }
  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='px-0 text-fg-error'
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        <DeleteOutline className='size-5' />
        Disconnect identity provider
      </Button>
      <Dialog isOpen={isOpen} onClose={close}>
        <DialogContent className='md:max-w-md'>
          <DialogTitle>Disconnect {samlId}?</DialogTitle>
          <DialogDescription>
            People with {domains.map((domain) => `@${domain}`).join(' or ')} email addresses will no
            longer be able to sign in with SSO, and SCIM provisioning for this provider will stop.
            Their Parabol accounts and data stay intact; they’ll sign in with email instead. Email
            domains stay reserved for your organization.
          </DialogDescription>
          <DialogActions>
            <Button variant='outline' size='md' onClick={close}>
              Cancel
            </Button>
            <Button variant='destructive' size='md' disabled={submitting} onClick={confirm}>
              Disconnect identity provider
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default OrgAuthenticationDisconnectIdP
