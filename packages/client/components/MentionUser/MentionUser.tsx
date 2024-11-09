import Avatar from '../Avatar/Avatar'
import DraftMentionDescription from '../MentionTag/DraftMentionDescription'
import DraftMentionRow from '../MentionTag/DraftMentionRow'

export interface MentionUserProps {
  active: boolean
  preferredName: string
  picture: string
}

const MentionUser = (props: MentionUserProps) => {
  const {active, preferredName, picture} = props
  return (
    <DraftMentionRow active={active}>
      <Avatar picture={picture} className='h-6 w-6' />
      <DraftMentionDescription>{preferredName}</DraftMentionDescription>
    </DraftMentionRow>
  )
}

export default MentionUser
