import {useState} from 'react'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import NewGitHubIssueInput from './NewGitHubIssueInput'

const NewGitHubIssueInputRoot = (props: NewRecordInputProps) => {
  const {isEditing} = props
  const [wasEditing, setWasEditing] = useState(isEditing)
  if (isEditing && !wasEditing) setWasEditing(true)
  if (!wasEditing) return null
  return <NewGitHubIssueInput {...props} />
}

export default NewGitHubIssueInputRoot
