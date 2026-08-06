import type {ReactNode} from 'react'
import {cn} from '../ui/cn'

interface Props {
  className?: string
  dataCy?: string
  cloudName: string
  issueKey: string
  projectKey: string
  children?: ReactNode
  showLabelPrefix?: boolean
}

const JiraIssueLink = (props: Props) => {
  const {
    dataCy,
    className,
    cloudName,
    issueKey,
    projectKey,
    children,
    showLabelPrefix = true
  } = props
  const href =
    cloudName === 'jira-demo'
      ? 'https://www.parabol.co/features/integrations'
      : `https://${cloudName}.atlassian.net/browse/${issueKey}`
  return (
    <a
      className={cn(
        'block px-4 text-[14px] text-fg-primary leading-5 underline hover:underline focus:underline',
        className
      )}
      data-cy={dataCy}
      href={href}
      rel='noopener noreferrer'
      target='_blank'
      title={`Jira Issue #${issueKey} on ${projectKey}`}
    >
      {`${showLabelPrefix ? 'Issue #' : ''}
      ${issueKey}`}
      {children}
    </a>
  )
}

export default JiraIssueLink
