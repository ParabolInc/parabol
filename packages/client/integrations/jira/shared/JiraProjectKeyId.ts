const JiraProjectKeyId = {
  join: (issueKey: string) => issueKey.slice(0, issueKey.indexOf('-'))
}

export default JiraProjectKeyId
