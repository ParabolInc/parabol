import useAtmosphere from '~/hooks/useAtmosphere'
import {useUpdatePageAccessMutation} from '~/mutations/useUpdatePageAccessMutation'
import type {
  PageRoleEnum,
  PageSubjectEnum
} from '../../__generated__/useUpdatePageAccessMutation.graphql'
import {PageAccessComboboxControl} from './PageAccessComboboxControl'

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
  const toggleRole = (role: PageRoleEnum) => {
    if (submitting) return
    execute({
      variables: {
        pageId,
        role,
        subjectId,
        subjectType,
        unlinkApproved: false
      },
      onCompleted(_res, errors) {
        const firstError = errors?.[0]?.message
        if (firstError) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'PageAccessCombobox',
            message: firstError,
            autoDismiss: 5
          })
        }
      }
    })
  }
  return <PageAccessComboboxControl onClick={toggleRole} defaultRole={defaultRole} />
}
