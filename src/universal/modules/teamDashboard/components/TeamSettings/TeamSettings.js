import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {overflowTouch} from 'universal/styles/helpers';
import {reduxForm} from 'redux-form';
import InviteUser from 'universal/components/InviteUser/InviteUser';
import UserRow from 'universal/components/UserRow/UserRow';
import fromNow from 'universal/utils/fromNow';
import {cashay} from 'cashay';
import {toggleRemoveModal, togglePromoteModal} from 'universal/modules/teamDashboard/ducks/teamSettingsDuck';
import RemoveTeamMemberModal from 'universal/modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal';

const TeamSettings = (props) => {
  const {
    dispatch,
    invitations,
    modalPreferredName,
    modalTeamMemberId,
    myTeamMember,
    promoteTeamMemberModal,
    removeTeamMemberModal,
    team,
    teamMembers,
    styles
  } = props;
  const invitationRowActions = (invitation) => {
    const cashayOptions = {
      variables: {
        inviteId: invitation.id
      }
    };
    const resend = () => {
      cashay.mutate('resendInvite', cashayOptions)
    };
    const cancel = () => {
      cashay.mutate('cancelInvite', cashayOptions)
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
  const teamMemberRowActions = (teamMember) => {
    const {id, preferredName} = teamMember;
    const openRemoveModal = (e) => {
      dispatch(toggleRemoveModal(id, preferredName))
    };
    const openPromoteModal = (e) => {
      dispatch(togglePromoteModal(id, preferredName))
    };
    return (
      <div className={css(styles.actionLinkBlock)}>
        {removeTeamMemberModal &&
          <RemoveTeamMemberModal
            onBackdropClick={openRemoveModal}
            onBlur={openRemoveModal}
            preferredName={modalPreferredName}
            teamMemberId={modalTeamMemberId}
          />
        }
        {promoteTeamMemberModal &&
          <PromoteTeamMemberModal
            onBackdropClick={openRemoveModal}
            onBlur={openPromoteModal}
            preferredName={modalPreferredName}
            teamMemberId={modalTeamMemberId}
          />
        }
        {myTeamMember.isLead && myTeamMember.id !== teamMember.id &&
          <div className={css(styles.actionLink)} onClick={openPromoteModal}>
            Promote {teamMember.preferredName} to Team Lead
          </div>
        }
        {myTeamMember.isLead && myTeamMember.id !== teamMember.id &&
          <div className={css(styles.actionLink)} onClick={openRemoveModal}>
            Remove
          </div>
        }
        {!myTeamMember.isLead && myTeamMember.id === teamMember.id &&
          <div className={css(styles.actionLink)}>
            Leave Team
          </div>
        }
      </div>
    );
  };
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.inviteBlock)}>
        <InviteUser dispatch={dispatch} teamId={team.id} invitations={invitations} teamMembers={teamMembers}/>
      </div>
      <div className={css(styles.body)}>
        <div className={css(styles.scrollable)}>
          {
            teamMembers.map((teamMember, idx) => {
              return (
                <UserRow
                  {...teamMember}
                  actions={teamMemberRowActions(teamMember)}
                  key={`teamMemberKey${idx}`}
                />
              );
            }).concat(invitations.map((invitation, idx) => {
              return (
                <UserRow
                  {...invitation}
                  preferredName={invitation.email}
                  email={`invited ${fromNow(invitation.createdAt)}`}
                  actions={invitationRowActions(invitation)}
                  key={`invitationKey${idx}`}
                />
              )
            }))
          }
        </div>
      </div>
    </div>
  );
};

TeamSettings.propTypes = {
  invitations: PropTypes.array.isRequired,
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

  inviteBlock: {
    maxWidth: '42rem',
    padding: '0 1rem'
  },

  body: {
    flex: 1,
    position: 'relative',
    width: '100%'
  },

  scrollable: {
    ...overflowTouch,
    bottom: 0,
    left: 0,
    maxWidth: '42rem',
    padding: '0 1rem 1rem',
    position: 'absolute',
    right: 0,
    top: 0,
  },

  actionLinkBlock: {
    fontSize: 0
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
  }
});

export default reduxForm({form: 'teamSettings'})(
  withStyles(styleThunk)(TeamSettings)
);
