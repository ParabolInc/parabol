import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {JiraExtraFieldsContent_issue$key} from '~/__generated__/JiraExtraFieldsContent_issue.graphql'

interface Props {
  jiraDisplayFieldIds: readonly string[] | null | undefined
  issueRef: JiraExtraFieldsContent_issue$key
}
export const JiraExtraFieldsContent = (props: Props) => {
  const {jiraDisplayFieldIds, issueRef} = props
  const issue = useFragment(
    graphql`
    fragment JiraExtraFieldsContent_issue on JiraIssue {
    extraFields {
      fieldId
      fieldName
      fieldType
      fieldValue
    }
  }`,
    issueRef
  )
  return (
    <>
      {jiraDisplayFieldIds?.map((fieldId) => {
        const {extraFields} = issue
        const extraField = extraFields?.find((field) => field.fieldId === fieldId)
        if (!extraField) return null
        const {fieldName, fieldType, fieldValue} = extraField
        return (
          <div key={fieldName}>
            <h4 className={'mt-3 mb-1'}>{fieldName}</h4>
            {fieldType === 'html' && (
              <div dangerouslySetInnerHTML={{__html: fieldValue as string}} />
            )}
            {fieldType !== 'html' && <div>{fieldValue}</div>}
          </div>
        )
      })}
    </>
  )
}
