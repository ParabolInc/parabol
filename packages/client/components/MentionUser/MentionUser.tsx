import React from 'react'
import Avatar from '../Avatar/Avatar'
import DraftMentionRow from '../MentionTag/DraftMentionRow'
import DraftMentionDescription from '../MentionTag/DraftMentionDescription'

export interface MentionUserProps {
  active: boolean
  preferredName: string
  picture: string
}

const MentionUser = (props: MentionUserProps) => {
  const {active, preferredName, picture} = props
  return (
    <DraftMentionRow active={active}>
      <Avatar picture={picture} size={24} />
      <DraftMentionDescription>{preferredName}</DraftMentionDescription>
    </DraftMentionRow>
  )
}

export default MentionUser
