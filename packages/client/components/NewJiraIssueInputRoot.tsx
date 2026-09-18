import {useState} from 'react'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewJiraIssueInput from './NewJiraIssueInput'

const NewJiraIssueInputRoot = (props: NewRecordInputProps) => {
  const {isEditing} = props
  const [wasEditing, setWasEditing] = useState(isEditing)
  if (isEditing && !wasEditing) setWasEditing(true)
  if (!wasEditing) return null
  return <NewJiraIssueInput {...props} />
}

export default NewJiraIssueInputRoot
