import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {reduxForm} from 'redux-form';
import InviteUser from 'universal/components/InviteUser/InviteUser';
import UserRow from 'universal/components/UserRow/UserRow';
import fromNow from 'universal/utils/fromNow';
import {cashay} from 'cashay';
import RemoveTeamMemberModal from 'universal/modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal';
import PromoteTeamMemberModal from 'universal/modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal';
import LeaveTeamModal from 'universal/modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import Panel from 'universal/components/Panel/Panel';
import ArchiveTeamContainer from 'universal/modules/teamDashboard/containers/ArchiveTeamContainer/ArchiveTeamContainer';
import ui from 'universal/styles/ui';
import IntegrationsContainer from '../../../integrations/containers/Integrations/IntegrationsContainer';
import Button from '../../../../components/Button/Button';

const TeamSettings = (props) => {
  const {
    beta,
    dispatch,
    invitations,
    orgApprovals,
    myTeamMember,
    team,
    teamMembers,
    styles
  } = props;
  const teamLeadObj = teamMembers.find((m) => m.isLead === true);
  const teamLead = teamLeadObj && teamLeadObj.preferredName;

  const invitationRowActions = (invitation) => {
    const cashayOptions = {
      variables: {
        inviteId: invitation.id
      }
    };
    const resend = () => {
      cashay.mutate('resendInvite', cashayOptions);
      dispatch(showSuccess({
        title: 'Invitation sent!',
        message: 'We sent your friend a nice little reminder'
      }));
    };
    const cancel = () => {
      cashay.mutate('cancelInvite', cashayOptions);
    };
    return (
      <div className={css(styles.actionLinkBlock)}>
        <div className={css(styles.actionLink)} onClick={resend}>
          Resend Invitation
        </div>
        <div className={css(styles.actionLink)} onClick={cancel}>
          Cancel Invitation
        </div>
      </div>
    );
  };
  const orgApprovalRowActions = (orgApproval) => {
    const options = {
      variables: {
        id: orgApproval.id
      }
    };
    const cancel = () => {
      cashay.mutate('cancelApproval', options);
    };
    return (
      <div className={css(styles.actionLinkBlock)}>
        <div className={css(styles.actionLink)} onClick={cancel}>
          Cancel Pending Approval
        </div>
      </div>
    );
  };
  const teamMemberRowActions = (teamMember) => {
    const {id, preferredName} = teamMember;
    return (
      <div className={css(styles.actionLinkBlock)}>
        {myTeamMember.isLead && myTeamMember.id !== teamMember.id &&
          <PromoteTeamMemberModal
            toggle={
              <div className={css(styles.actionLink)}>
              Promote {teamMember.preferredName} to Team Lead
              </div>
            }
            preferredName={preferredName}
            teamMemberId={id}
          />
        }
        {myTeamMember.isLead && myTeamMember.id !== teamMember.id &&
          <RemoveTeamMemberModal
            toggle={<div className={css(styles.actionLink)}>Remove</div>}
            preferredName={preferredName}
            teamMemberId={id}
          />
        }
        {!myTeamMember.isLead && myTeamMember.id === teamMember.id &&
          <LeaveTeamModal
            toggle={<div className={css(styles.actionLink)}>Leave Team</div>}
            teamLead={teamLead}
            teamMemberId={id}
          />

        }
      </div>
    );
  };

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.panels)}>
        <Panel label="Manage Team">
          <div className={css(styles.panelBorder)}>
            <InviteUser
              dispatch={dispatch}
              teamId={team.id}
              invitations={invitations}
              orgApprovals={orgApprovals}
              teamMembers={teamMembers}
            />
            {teamMembers.map((teamMember) => {
              return (
                <UserRow
                  {...teamMember}
                  actions={teamMemberRowActions(teamMember)}
                  key={`teamMemberKey${teamMember.id}`}
                />
              );
            })
            }
            {invitations.map((invitation) => {
              return (
                <UserRow
                  {...invitation}
                  email={invitation.email}
                  invitedAt={`invited ${fromNow(invitation.updatedAt)}`}
                  actions={invitationRowActions(invitation)}
                  key={`invitationKey${invitation.email}`}
                />
              );
            })
            }
            {orgApprovals.map((orgApproval) => {
              return (
                <UserRow
                  key={`approval${orgApproval.id}`}
                  id={orgApproval.id}
                  email={orgApproval.email}
                  invitedAt={`invited ${fromNow(orgApproval.createdAt)}`}
                  actions={orgApprovalRowActions(orgApproval)}
                />
              );
            })}
          </div>
        </Panel>
        {myTeamMember.isLead &&
          <Panel label="Danger Zone">
            <div className={css(styles.dangerZoneChildren)}>
              <ArchiveTeamContainer
                teamId={team.id}
                teamName={team.name}
              />
            </div>
          </Panel>
        }
      </div>
      {beta &&
        <IntegrationsContainer
          teamMemberId={myTeamMember.id}
          toggle={<Button colorPalette="cool" label="Integrations" size="medium" buttonStyle="solid" />}
        />
      }
    </div>
  );
};

TeamSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  invitations: PropTypes.array.isRequired,
  myTeamMember: PropTypes.object.isRequired,
  orgApprovals: PropTypes.array,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  panels: {
    maxWidth: '42rem',
    padding: '0 1rem'
  },

  actionLinkBlock: {
    fontSize: 0,
    textAlign: 'right'
  },

  actionLink: {
    color: appTheme.palette.dark,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    marginLeft: '1.25rem',
    textDecoration: 'underline',
    verticalAlign: 'middle',

    ':hover': {
      opacity: '.5'
    }
  },

  panelBorder: {
    borderTop: `1px solid ${ui.panelBorderColor}`
  },

  dangerZoneChildren: {
    borderTop: `1px solid ${ui.panelBorderColor}`,
    padding: `${ui.panelGutter}`
  }
});

export default reduxForm({form: 'teamSettings'})(
  withStyles(styleThunk)(TeamSettings)
);
