import styled from '@emotion/styled'
import clsx from 'clsx'
import EditableText from '../../../components/EditableText'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import RenameMeetingTemplateMutation from '../../../mutations/RenameMeetingTemplateMutation'
import Legitity from '../../../validation/Legitity'

interface Props {
  name: string
  templateId: string
  isOwner: boolean
  className?: string
}

const InheritedStyles = styled('div')({
  flex: 1,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px'
})

const EditableTemplateName = (props: Props) => {
  const {name, templateId, isOwner, className} = props
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()
  const autoFocus = name.startsWith('*New Template') || name.endsWith(' Copy')

  const handleSubmit = (rawName: string) => {
    if (submitting) return
    const {error, value: name} = validate(rawName)
    if (error) return
    submitMutation()
    RenameMeetingTemplateMutation(atmosphere, {templateId, name}, {onError, onCompleted})
  }

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a template name')
      .max(100, 'That name is probably long enough')
  }

  const validate = (rawValue: string) => {
    const res = legitify(rawValue)
    if (res.error) {
      onError(new Error(res.error))
    } else {
      onCompleted()
    }
    return res
  }

  return (
    <InheritedStyles>
      <div className={clsx('leading-6', className)}>
        <EditableText
          autoFocus={autoFocus}
          disabled={!isOwner}
          error={error ? error.message : undefined}
          handleSubmit={handleSubmit}
          initialValue={name}
          maxLength={100}
          validate={validate}
          placeholder={'*New Template'}
        />
      </div>
    </InheritedStyles>
  )
}

export default EditableTemplateName
