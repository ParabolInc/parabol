import {useRef, useState} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useUpdatePageAccessMutation} from '~/mutations/useUpdatePageAccessMutation'
import type {
  PageRoleEnum,
  PageSubjectEnum
} from '../../__generated__/useUpdatePageAccessMutation.graphql'
import {PageAccessComboboxControl} from './PageAccessComboboxControl'
import {UnlinkPageDialog} from './UnlinkPageDialog'

interface Props {
  defaultRole: PageRoleEnum
  pageId: string
  subjectId: string
  subjectType: PageSubjectEnum
}

export const PageAccessCombobox = (props: Props) => {
  const {pageId, subjectId, subjectType, defaultRole} = props
  const atmosphere = useAtmosphere()
  const [execute, submitting] = useUpdatePageAccessMutation()
  const [attemptedRole, setAttemptedRole] = useState<PageRoleEnum | null>(null)
  const unlinkApprovedRef = useRef(false)

  const closeDialog = () => {
    setAttemptedRole(null)
  }

  const approveUnlink = () => {
    unlinkApprovedRef.current = true
    toggleRole(attemptedRole)
    closeDialog()
  }

  const toggleRole = (role: PageRoleEnum | null) => {
    if (submitting) return
    execute({
      variables: {
        pageId,
        role,
        subjectId,
        subjectType,
        unlinkApproved: unlinkApprovedRef.current
      },
      onCompleted(_res, errors) {
        const firstError = errors?.[0]
        if (firstError) {
          if ((firstError as any).extensions?.code === 'UNAPPROVED_UNLINK') {
            setAttemptedRole(role)
            return
          }
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'PageAccessCombobox',
            message: firstError.message,
            autoDismiss: 5
          })
        }
      }
    })
  }
  return (
    <>
      <PageAccessComboboxControl onClick={toggleRole} defaultRole={defaultRole} canRemove />
      {attemptedRole && (
        <UnlinkPageDialog approveUnlink={approveUnlink} closeDialog={closeDialog} />
      )}
    </>
  )
}
