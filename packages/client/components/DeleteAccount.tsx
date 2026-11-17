import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {DeleteAccount_viewer$key} from '../__generated__/DeleteAccount_viewer.graphql'
import {Button} from '../ui/Button/Button'
import DeleteAccountModal from './DeleteAccountModal'
import IconLabel from './IconLabel'

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
        <Button
          aria-label='Click to permanently delete your account.'
          size='default'
          className='bg-transparent p-0 text-[14px] text-tomato-600 leading-5 shadow-none hover:text-tomato-800 focus:text-tomato-800 active:text-tomato-800'
          onClick={() => setIsOpen(true)}
        >
          <IconLabel iconLarge icon='remove_circle' label='Delete Account' />
        </Button>
        <div className='mt-2 text-[13px] text-fg-secondary'>
          <b>Note</b>: {"This can't be undone."}
        </div>
      </div>
      <DeleteAccountModal isOpen={isOpen} onClose={() => setIsOpen(false)} viewerRef={viewer} />
    </>
  )
}

export default DeleteAccount
