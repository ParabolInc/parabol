interface Response {
  comment: string | null
  commentParaphrased: string | null
  isAnonymous: boolean
}

/**
 * The only copy of a team health comment that may be shown to anyone but its author. An anonymous
 * comment is readable solely as its AI rewrite: empty while the rewrite is in flight, null if it
 * failed, and either way the raw comment stays unread. A signed comment is shown as written.
 */
const getTeamHealthDisplayComment = ({comment, commentParaphrased, isAnonymous}: Response) => {
  return isAnonymous ? commentParaphrased || null : comment
}

export default getTeamHealthDisplayComment
