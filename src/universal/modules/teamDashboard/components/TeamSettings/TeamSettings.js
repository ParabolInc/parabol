import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {connect} from 'react-redux';
import {createFragmentContainer} from 'react-relay';
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
import CancelApprovalMutation from 'universal/mutations/CancelApprovalMutation';
import CancelTeamInviteMutation from 'universal/mutations/CancelTeamInviteMutation';
import ResendTeamInviteMutation from 'universal/mutations/ResendTeamInviteMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
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
    styles,
    submitMutation,
    submitting,
    onCompleted,
    onError,
    viewer: {team}
  } = props;
  const {invitations, orgApprovals, teamName, teamMembers, teamId} = team;
  const myTeamMember = teamMembers.find((m) => m.isSelf);
  const {isLead: viewerIsLead, teamMemberId: myTeamMemberId} = myTeamMember;
  const invitationRowActions = (invitationId) => {
    const resend = () => {
      submitMutation();
      const onResendCompleted = () => {
        dispatch(showSuccess({
          title: 'Invitation sent!',
          message: 'We sent your friend a nice little reminder'
        }));
        onCompleted();
      };
      ResendTeamInviteMutation(atmosphere, invitationId, onError, onResendCompleted);
    };
    const cancel = () => {
      submitMutation();
      CancelTeamInviteMutation(atmosphere, invitationId, onError, onCompleted);
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
  const orgApprovalRowActions = (orgApprovalId) => {
    const cancel = () => {
      if (submitting) return;
      submitMutation();
      CancelApprovalMutation(atmosphere, orgApprovalId, teamId, onError, onCompleted);
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
    );
  };
  const teamMemberRowActions = (teamMember) => {
    const {teamMemberId, preferredName} = teamMember;
    return (
      <div className={css(styles.actionLinkBlock)}>
        {viewerIsLead && myTeamMemberId !== teamMemberId &&
        <PromoteTeamMemberModal
          toggle={
            <div className={css(styles.actionLink)}>
              Promote {preferredName} to Team Lead
            </div>
          }
          teamMember={teamMember}
        />
        }
        {viewerIsLead && myTeamMemberId !== teamMemberId &&
        <RemoveTeamMemberModal
          toggle={<div className={css(styles.actionLink)}>Remove</div>}
          teamMember={teamMember}
        />
        }
        {!viewerIsLead && myTeamMemberId === teamMemberId &&
        <LeaveTeamModal
          toggle={<div className={css(styles.actionLink)}>Leave Team</div>}
          team={team}
          teamMember={teamMember}
        />

        }
      </div>
    );
  };

  return (
    <div className={css(styles.root)}>
      <Helmet title={`${teamName} Settings | Parabol`} />
      <div className={css(styles.panels)}>
        <Panel label="Manage Team">
          <div className={css(styles.panelBorder)}>
            <InviteUser
              dispatch={dispatch}
              team={team}
            />
            {teamMembers.map((teamMember) => {
              const {teamMemberId} = teamMember;
              return (
                <UserRow
                  key={`teamMemberKey${teamMemberId}`}
                  actions={teamMemberRowActions(teamMember)}
                  possibleTeamMember={teamMember}
                />
              );
            })
            }
            {invitations.map((invitation) => {
              const {invitationId} = invitation;
              return (
                <UserRow
                  key={`invitationKey${invitationId}`}
                  actions={invitationRowActions(invitationId)}
                  possibleTeamMember={invitation}
                />
              );
            })
            }
            {orgApprovals.map((orgApproval) => {
              const {orgApprovalId} = orgApproval;
              return (
                <UserRow
                  key={`approval${orgApprovalId}`}
                  actions={orgApprovalRowActions(orgApprovalId)}
                  possibleTeamMember={orgApproval}
                />
              );
            })}
          </div>
        </Panel>
        {viewerIsLead &&
        <Panel label="Danger Zone">
          <div className={css(styles.panelRow)}>
            <ArchiveTeamContainer team={team} />
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
  styles: PropTypes.object,
  viewer: PropTypes.object.isRequired,
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

export default createFragmentContainer(
  withAtmosphere(
    withMutationProps(
      connect()(withStyles(styleThunk)(TeamSettings))
    )
  ),
  graphql`
    fragment TeamSettings_viewer on User {
      team(teamId: $teamId) {
        ...InviteUser_team
        ...LeaveTeamModal_team
        ...ArchiveTeamContainer_team
        teamId: id
        teamName: name
        teamMembers(sortBy: "preferredName") {
          ...PromoteTeamMemberModal_teamMember
          ...RemoveTeamMemberModal_teamMember
          ...LeaveTeamModal_teamMember
          ...UserRow_possibleTeamMember
          teamMemberId: id
          isLead
          isSelf
          preferredName
        }
        invitations {
          ...UserRow_possibleTeamMember
          invitationId: id
        }
        orgApprovals {
          ...UserRow_possibleTeamMember
          orgApprovalId: id
        }
      }
    }
  `
);
