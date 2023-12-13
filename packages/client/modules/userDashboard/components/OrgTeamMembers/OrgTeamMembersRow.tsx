import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgTeamMembersRow_teamMember$key} from '../../../../__generated__/OrgTeamMembersRow_teamMember.graphql'
import {Avatar} from '../../../../UI/Avatar/Avatar'
import {AvatarFallback} from '../../../../UI/Avatar/AvatarFallback'
import {AvatarImage} from '../../../../UI/Avatar/AvatarImage'
import {Button} from '../../../../ui/Button/Button'
import {MoreVert} from '@mui/icons-material'

type Props = {
  teamMemberRef: OrgTeamMembersRow_teamMember$key
}

export const OrgTeamMembersRow = (props: Props) => {
  const {teamMemberRef} = props
  const member = useFragment(
    graphql`
      fragment OrgTeamMembersRow_teamMember on TeamMember {
        id
        picture
        preferredName
        isLead
        isOrgAdmin
        isSelf
        email
        user {
          teams {
            name
          }
        }
      }
    `,
    teamMemberRef
  )

  return (
    <div className='flex w-full items-center justify-center gap-4 p-4'>
      <div>
        <Avatar className='h-8 w-8'>
          <AvatarImage src={member.picture} alt={member.preferredName} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <div className='flex w-full flex-col gap-y-1 py-1'>
        <div className='text-gray-700 inline-flex items-center gap-x-2 text-lg font-bold'>
          {member.preferredName}{' '}
          {member.isLead ? (
            <span className='rounded-full bg-primary px-2 py-0.5 text-xs text-white'>
              Team Lead
            </span>
          ) : null}
        </div>
        <div>
          <Button asChild variant='link'>
            <a href={`mailto:${member.email}`}>{member.email}</a>
          </Button>
        </div>
        <div className='flex items-center gap-x-1 text-base'>
          <div>Teams:</div>
          <div className='space-x-1 font-semibold'>
            {member.user.teams.map((team) => team.name).join(', ')}
          </div>
        </div>
      </div>
      <div>
        <Button shape='circle' variant='ghost'>
          <MoreVert />
        </Button>
      </div>
    </div>
  )
}
