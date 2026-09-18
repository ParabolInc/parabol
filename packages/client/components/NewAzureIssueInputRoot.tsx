import {useState} from 'react'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewAzureIssueInput from './NewAzureIssueInput'

const NewAzureIssueInputRoot = (props: NewRecordInputProps) => {
  const {isEditing} = props
  const [wasEditing, setWasEditing] = useState(isEditing)
  if (isEditing && !wasEditing) setWasEditing(true)
  if (!wasEditing) return null
  return <NewAzureIssueInput {...props} />
}

export default NewAzureIssueInputRoot
