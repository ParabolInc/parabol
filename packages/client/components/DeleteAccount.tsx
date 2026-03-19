import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {DeleteAccount_viewer$key} from '../__generated__/DeleteAccount_viewer.graphql'
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
  const {togglePortal, modalPortal} = useModal()
  return (
    <>
      <div>
        <LinkButton
          aria-label='Click to permanently delete your account.'
          palette='red'
          onClick={togglePortal}
        >
          <IconLabel iconLarge icon='remove_circle' label='Delete Account' />
        </LinkButton>
        <Hint>
          <b>Note</b>: {"This can't be undone."}
        </Hint>
      </div>
      {modalPortal(<DeleteAccountModal viewerRef={viewer} />)}
    </>
  )
}

export default DeleteAccount
