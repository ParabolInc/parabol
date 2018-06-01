// @flow
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoHeader from 'universal/components/Row/RowInfoHeader'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import RowInfoLink from 'universal/components/Row/RowInfoLink'
import Tag from 'universal/components/Tag/Tag'
import LeaveTeamModal from 'universal/modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal'
import PromoteTeamMemberModal from 'universal/modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal'
import RemoveTeamMemberModal from 'universal/modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal'
import UserRowFlatButton from 'universal/modules/teamDashboard/components/TeamSettings/UserRowFlatButton'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import type {TeamMemberRow_teamMember as TeamMember} from './__generated__/TeamMemberRow_teamMember.graphql'
import type {TeamMemberRow_teamLead as TeamLead} from './__generated__/TeamMemberRow_teamLead.graphql'
import UserRowActionsBlock from 'universal/components/UserRowActionsBlock'

type Props = {|
  isSelf: boolean,
  isViewerLead: boolean,
  teamLead: TeamLead,
  teamMember: TeamMember
|}

const TeamMemberRow = (props: Props) => {
  const {teamLead, teamMember, isSelf, isViewerLead} = props
  const {email, isLead, picture, preferredName} = teamMember
  return (
    <Row>
      <div>
        {picture ? (
          <Avatar hasBadge={false} picture={picture} size='small' />
        ) : (
          <img alt='' src={defaultUserAvatar} />
        )}
      </div>
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{preferredName}</RowInfoHeading>
          {isLead && <Tag colorPalette='blue' label='Team Lead' />}
        </RowInfoHeader>
        <RowInfoLink href={`mailto:${email}`} title='Send an email'>
          {email}
        </RowInfoLink>
      </RowInfo>
      <RowActions>
        <UserRowActionsBlock>
          {isViewerLead &&
            !isSelf && (
              <React.Fragment>
                <PromoteTeamMemberModal
                  toggle={
                    <UserRowFlatButton>{`Promote ${preferredName} to Team Lead`}</UserRowFlatButton>
                  }
                  teamMember={teamMember}
                />
                <RemoveTeamMemberModal
                  toggle={<UserRowFlatButton>{'Remove'}</UserRowFlatButton>}
                  teamMember={teamMember}
                />
              </React.Fragment>
            )}
          {!isViewerLead &&
            isSelf && (
              <LeaveTeamModal
                toggle={<UserRowFlatButton>{'Leave Team'}</UserRowFlatButton>}
                teamLead={teamLead}
                teamMember={teamMember}
              />
            )}
        </UserRowActionsBlock>
      </RowActions>
    </Row>
  )
}

export default createFragmentContainer(
  TeamMemberRow,
  graphql`
    fragment TeamMemberRow_teamLead on TeamMember {
      ...LeaveTeamModal_teamLead
    }

    fragment TeamMemberRow_teamMember on TeamMember {
      email
      isLead
      picture
      preferredName
      ...LeaveTeamModal_teamMember
      ...PromoteTeamMemberModal_teamMember
      ...RemoveTeamMemberModal_teamMember
    }
  `
)
