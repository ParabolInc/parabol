import {useState} from 'react'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewGitLabIssueInput from './NewGitLabIssueInput'

const NewGitLabIssueInputRoot = (props: NewRecordInputProps) => {
  const {isEditing} = props
  const [wasEditing, setWasEditing] = useState(isEditing)
  if (isEditing && !wasEditing) setWasEditing(true)
  if (!wasEditing) return null
  return <NewGitLabIssueInput {...props} />
}

export default NewGitLabIssueInputRoot
