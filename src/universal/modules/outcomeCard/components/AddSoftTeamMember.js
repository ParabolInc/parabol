import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import avatarUser from 'universal/styles/theme/images/add-round-button.svg';
import InviteTeamMembersMutation from 'universal/mutations/InviteTeamMembersMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {connect} from 'react-redux';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import {emailRegex} from 'universal/validation/regex';
import legitify from 'universal/validation/legitify';
import {createFragmentContainer} from 'react-relay';
import ErrorMessageInMenu from 'universal/components/ErrorMessageInMenu';
import makePlaceholderStyles from 'universal/styles/helpers/makePlaceholderStyles';

const makeValidationSchema = (allAssignees) => {
  return legitify({
    inviteeEmail: (value) => value
      .trim()
      .required('You should enter an email here.')
      .matches(emailRegex, 'That doesn’t look like an email address.')
      .test((inviteeEmail) => {
        const alreadyInList = allAssignees.find(({email}) => email === inviteeEmail);
        return alreadyInList && 'That person is already in the list';
      })
  });
};

const validateEmailAddress = (inviteeEmail, assignees, onError) => {
  const schema = makeValidationSchema(assignees);
  const {errors} = schema({inviteeEmail});
  if (Object.keys(errors).length) {
    onError(errors.inviteeEmail);
    return false;
  }
  return true;
};

class AddSoftTeamMember extends Component {
  static propTypes = {
    area: PropTypes.string.isRequired,
    assignRef: PropTypes.instanceOf(Element),
    atmosphere: PropTypes.object.isRequired,
    dirty: PropTypes.bool.isRequired,
    setDirty: PropTypes.func.isRequired,
    closePortal: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    menuRef: PropTypes.instanceOf(Element),
    projectId: PropTypes.string.isRequired,
    error: PropTypes.any,
    submitting: PropTypes.bool,
    submitMutation: PropTypes.func.isRequired,
    onCompleted: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    setAddSoftAsActive: PropTypes.func.isRequired,
    styles: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired
  };

  state = {inviteeEmail: ''};

  componentWillReceiveProps(nextProps) {
    const {isActive, menuRef} = nextProps;
    if (isActive !== this.props.isActive) {
      if (isActive) {
        this.inputRef.focus();
      } else {
        menuRef.focus();
      }
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    const {inviteeEmail} = this.state;
    const {
      area,
      assignRef,
      atmosphere,
      closePortal,
      setDirty,
      dispatch,
      projectId,
      submitting,
      submitMutation,
      onCompleted,
      onError,
      team
    } = this.props;
    if (submitting) return;

    // validate
    setDirty();
    const {teamMembers, softTeamMembers, teamId} = team;
    const assignees = teamMembers.concat(softTeamMembers);
    const isValid = validateEmailAddress(inviteeEmail, assignees, onError);
    if (!isValid) return;

    // resolve
    closePortal();
    assignRef.focus();
    const invitees = [{email: inviteeEmail}];
    submitMutation();
    const handleCompleted = (res) => {
      onCompleted();
      const {inviteTeamMembers: {newSoftTeamMembers, reactivatedTeamMembers}} = res;
      const newSoftTeamMemberId = newSoftTeamMembers && newSoftTeamMembers[0].id;
      const reactivatedTeamMemberId = reactivatedTeamMembers && reactivatedTeamMembers[0].id;
      submitMutation();
      const updatedProject = {
        id: projectId,
        assigneeId: newSoftTeamMemberId || reactivatedTeamMemberId
      };
      UpdateProjectMutation(atmosphere, updatedProject, area, onCompleted, onError);
    };
    InviteTeamMembersMutation(atmosphere, {invitees, teamId}, dispatch, onError, handleCompleted);
  };

  onChange = (e) => {
    const {dirty, error, onCompleted, onError, team} = this.props;
    const inviteeEmail = e.target.value;
    this.setState({inviteeEmail});
    if (dirty) {
      const assignees = team.teamMembers.concat(team.softTeamMembers);
      const isValid = validateEmailAddress(inviteeEmail, assignees, onError);
      if (isValid && error) {
        onCompleted();
      }
    }
  };

  onClick = () => {
    this.inputRef.focus();
  };

  render() {
    const {inviteeEmail} = this.state;
    const {
      isActive,
      error,
      styles,
      setAddSoftAsActive
    } = this.props;
    const rootStyles = css(styles.root, isActive && styles.active);
    const inputStyles = css(styles.input, isActive && styles.inputActive);
    return (
      <div title="Invite a new teammate by email">
        <div className={rootStyles} onClick={this.onClick}>
          <img alt="Invite a new teammate by email" className={css(styles.avatar)} src={avatarUser} />
          <form onSubmit={this.onSubmit}>
            <input
              className={inputStyles}
              onChange={this.onChange}
              onFocus={setAddSoftAsActive}
              placeholder="name@company.co"
              ref={(c) => { this.inputRef = c; }}
              value={inviteeEmail}
            />
          </form>
        </div>
        {error && <ErrorMessageInMenu error={error} />}
      </div>
    );
  }
}

const hoverFocusStyles = {
  backgroundColor: ui.menuItemBackgroundColorHover,
  outline: 0
};

const activeHoverFocusStyles = {
  backgroundColor: ui.menuItemBackgroundColorActive
};

const styleThunk = () => ({
  active: {
    backgroundColor: ui.menuItemBackgroundColorActive,
    cursor: 'default',

    ':hover': {
      ...activeHoverFocusStyles
    },
    ':focus': {
      ...activeHoverFocusStyles
    }
  },

  avatar: {
    borderRadius: '100%',
    height: '1.5rem',
    marginLeft: ui.menuGutterHorizontal,
    marginRight: ui.menuGutterInner,
    width: '1.5rem'
  },

  root: {
    alignItems: 'center',
    backgroundColor: ui.menuBackgroundColor,
    cursor: 'pointer',
    display: 'flex',
    padding: '.25rem 0',
    transition: `background-color ${ui.transition[0]}`,

    ':hover': {
      ...hoverFocusStyles
    },
    ':focus': {
      ...hoverFocusStyles
    }
  },

  input: {
    appearance: 'none',
    background: 'transparent',
    border: 0,
    borderRadius: 0,
    color: ui.menuItemColor,
    fontSize: ui.menuItemFontSize,
    lineHeight: '1.5rem',
    outline: 0,
    padding: 0,
    width: '100%',

    ...makePlaceholderStyles(ui.placeholderColor)
  },

  inputActive: {
    color: ui.menuItemColorHoverActive,

    ...makePlaceholderStyles(appTheme.palette.dark70l)
  }
});

export default createFragmentContainer(
  withMutationProps(connect()(withAtmosphere(withStyles(styleThunk)(AddSoftTeamMember)))),
  graphql`
    fragment AddSoftTeamMember_team on Team {
      teamId: id
      teamMembers(sortBy: "preferredName") {
        email
      }
      softTeamMembers {
        email
      }
    }
  `
);
