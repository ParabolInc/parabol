import {useState} from 'react'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewLinearIssueInput from './NewLinearIssueInput'

const NewLinearIssueInputRoot = (props: NewRecordInputProps) => {
  const {isEditing} = props
  const [wasEditing, setWasEditing] = useState(isEditing)
  if (isEditing && !wasEditing) setWasEditing(true)
  if (!wasEditing) return null
  return <NewLinearIssueInput {...props} />
}

export default NewLinearIssueInputRoot
