import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {DeleteAccount_viewer$key} from '../__generated__/DeleteAccount_viewer.graphql'
import DeleteAccountModal from './DeleteAccountModal'
import IconLabel from './IconLabel'
import LinkButton from './LinkButton'

interface Props {
  viewerRef: DeleteAccount_viewer$key
}

const DeleteAccount = ({viewerRef}: Props) => {
  const viewer = useFragment(
    graphql`
      fragment DeleteAccount_viewer on User {
        ...DeleteAccountModal_viewer
      }
    `,
    viewerRef
  )
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <div>
        <LinkButton
          aria-label='Click to permanently delete your account.'
          palette='red'
          onClick={() => setIsOpen(true)}
        >
          <IconLabel iconLarge icon='remove_circle' label='Delete Account' />
        </LinkButton>
        <div className='mt-2 text-[13px] text-slate-600'>
          <b>Note</b>: {"This can't be undone."}
        </div>
      </div>
      <DeleteAccountModal isOpen={isOpen} onClose={() => setIsOpen(false)} viewerRef={viewer} />
    </>
  )
}

export default DeleteAccount
