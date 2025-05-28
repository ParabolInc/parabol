import {useState} from 'react'
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
  const [unlinkApproved, setUnlinkApproved] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [attemptedRole, setAttemptedRole] = useState<PageRoleEnum | null>(null)
  const closeDialog = () => {
    setIsDialogOpen(false)
  }
  const approveUnlink = () => {
    closeDialog()
    setUnlinkApproved(true)
    toggleRole(attemptedRole)
  }

  const toggleRole = (role: PageRoleEnum | null) => {
    if (submitting) return
    execute({
      variables: {
        pageId,
        role,
        subjectId,
        subjectType,
        unlinkApproved
      },
      onCompleted(_res, errors) {
        const firstError = errors?.[0]
        if (firstError) {
          if ((firstError as any).extensions?.code === 'UNAPPROVED_UNLINK') {
            setIsDialogOpen(true)
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
      {isDialogOpen && <UnlinkPageDialog approveUnlink={approveUnlink} closeDialog={closeDialog} />}
    </>
  )
}
