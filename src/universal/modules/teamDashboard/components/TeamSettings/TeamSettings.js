import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import InviteUser from 'universal/components/InviteUser/InviteUser';
import Panel from 'universal/components/Panel/Panel';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import UserRow from 'universal/components/UserRow/UserRow';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import LeaveTeamModal from 'universal/modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal';
import PromoteTeamMemberModal from 'universal/modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal';
import RemoveTeamMemberModal from 'universal/modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal';
import ArchiveTeamContainer from 'universal/modules/teamDashboard/containers/ArchiveTeamContainer/ArchiveTeamContainer';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import CancelTeamInviteMutation from 'universal/mutations/CancelTeamInviteMutation';
import ResendTeamInviteMutation from 'universal/mutations/ResendTeamInviteMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import fromNow from 'universal/utils/fromNow';
import withMutationProps from 'universal/utils/relay/withMutationProps';

const tooltipIconStyle = {
  color: appTheme.palette.dark70a,
  fontSize: ui.iconSize,
  lineHeight: '1.25rem',
  verticalAlign: 'middle',
  marginLeft: '.25rem',
  marginTop: '-.0625rem'
};

const originAnchor = {
  vertical: 'center',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'center',
  horizontal: 'left'
};

const TeamSettings = (props) => {
  const {
    atmosphere,
    dispatch,
    invitations,
    orgApprovals,
    myTeamMember,
    team,
    teamMembers,
    styles,
    submitMutation,
    onCompleted,
    onError
  } = props;
  const teamLeadObj = teamMembers.find((m) => m.isLead === true);
  const teamLead = teamLeadObj && teamLeadObj.preferredName;

  const invitationRowActions = (invitation) => {
    const resend = () => {
      submitMutation();
      const onResendCompleted = () => {
        dispatch(showSuccess({
          title: 'Invitation sent!',
          message: 'We sent your friend a nice little reminder'
        }));
        onCompleted();
      };
      ResendTeamInviteMutation(atmosphere, invitation.id, onError, onResendCompleted);
    };
    const cancel = () => {
      submitMutation();
      CancelTeamInviteMutation(atmosphere, invitation.id, onError, onCompleted);
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
    const tip = (<div>{'Waiting for the organization billing leader to approve.'}</div>);
    return (
      <div className={css(styles.actionLinkBlock)}>
        <div className={css(styles.actionLink)} onClick={cancel}>
          {'Cancel Pending Approval'}
        </div>
        <span>
          <Tooltip
            maxHeight={40}
            maxWidth={500}
            originAnchor={originAnchor}
            targetAnchor={targetAnchor}
            tip={tip}
          >
            <FontAwesome name="question-circle" style={tooltipIconStyle} />
          </Tooltip>
        </span>
      </div>
    )
    ;
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
      <Helmet title={`${team.name} Settings | Parabol`} />
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
          <div className={css(styles.panelRow)}>
            <ArchiveTeamContainer
              teamId={team.id}
              teamName={team.name}
            />
          </div>
        </Panel>
        }
      </div>
    </div>
  );
};

TeamSettings.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  invitations: PropTypes.array.isRequired,
  myTeamMember: PropTypes.object.isRequired,
  orgApprovals: PropTypes.array,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  panels: {
    maxWidth: ui.settingsPanelMaxWidth
  },

  actionLinkBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
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
    verticalAlign: 'middle',

    ':hover': {
      opacity: '.5'
    }
  },

  panelBorder: {
    borderTop: `1px solid ${ui.panelInnerBorderColor}`
  },

  panelRow: {
    borderTop: `1px solid ${ui.rowBorderColor}`,
    padding: `${ui.panelGutter}`
  }
});

export default withAtmosphere(
  withMutationProps(
    withStyles(styleThunk)(TeamSettings)
  )
);
