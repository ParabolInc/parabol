import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import {Field, reduxForm, initialize, focus} from 'redux-form';
import labels from 'universal/styles/theme/labels';
import TayaAvatar from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import OutcomeCardAssignMenuContainer
  from 'universal/modules/teamDashboard/containers/OutcomeCardAssignMenu/OutcomeCardAssignMenuContainer';

import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
import OutcomeCardTextareaContainer from 'universal/modules/teamDashboard/containers/OutcomeCardTextarea/OutcomeCardTextareaContainer';
import OutcomeCardFooter from 'universal/components/OutcomeCard/OutcomeCardFooter';
import OutcomeCardStatusMenu from 'universal/components/OutcomeCard/OutcomeCardStatusMenu';

const OPEN_CONTENT_MENU = 'TeamProjectCard/openContentMenu';
const OPEN_ASSIGN_MENU = 'TeamProjectCard/openAssignMenu';
const OPEN_STATUS_MENU = 'TeamProjectCard/openStatusMenu';

let styles = {};

@reduxForm()
@look
export default class TeamProjectCard extends Component {
  componentWillMount() {
    const {project: {content}, dispatch, field, form} = this.props;
    this.state = {
      cardHasHover: false,
      openMenu: OPEN_CONTENT_MENU
    };
    if (content) {
      this.initializeValues(content);
    } else {
      // manually align redux-state with DOM
      dispatch(focus(form, field));
    }
  }

  componentWillReceiveProps(nextProps) {
    const {content} = this.props.project;
    const nextContent = nextProps.project.content;
    if (nextContent !== content) {
      this.initializeValues(nextContent);
    }
  }

  onEnterTeamProjectCard = () => {
    this.setState({cardHasHover: true});
  }

  onLeaveTeamProjectCard = () => {
    this.setState({cardHasHover: false});
  }

  initializeValues(content) {
    const {dispatch, form, project: {id}} = this.props;
    dispatch(initialize(form, {[id]: content}));
  }

  toggleStatusMenu = () => {
    if (this.props.isArchived) {
      return;
    }
    const {openMenu} = this.state;
    const nextOpenMenu = openMenu === OPEN_STATUS_MENU ? OPEN_CONTENT_MENU : OPEN_STATUS_MENU;
    this.setState({openMenu: nextOpenMenu});
  };

  toggleAssignMenu = () => {
    if (this.props.isArchived) {
      return;
    }
    const {openMenu} = this.state;
    const nextOpenMenu = openMenu === OPEN_ASSIGN_MENU ? OPEN_CONTENT_MENU : OPEN_ASSIGN_MENU;
    this.setState({openMenu: nextOpenMenu});
  };

  closeMenu = () => {
    this.setState({openMenu: OPEN_CONTENT_MENU});
  };

  render() {
    const {openMenu} = this.state;
    const {
      handleSubmit,
      isArchived,
      isProject,
      project,
    } = this.props;
    const {content, status, id: projectId} = project;
    const hasOpenStatusMenu = openMenu === OPEN_STATUS_MENU;
    const hasOpenAssignMenu = openMenu === OPEN_ASSIGN_MENU;
    const handleCardActive = (isActive) => {
      if (isActive === undefined) { return; }
      const [teamId] = projectId.split('::');
      const editing = isActive ? `Task::${projectId}` : null;
      const options = {
        variables: {
          teamId,
          editing
        }
      };
      cashay.mutate('edit', options);
    };
    const handleCardUpdate = (submittedData) => {
      const submittedContent = submittedData[projectId];
      if (submittedContent !== content) {
        const options = {
          variables: {
            updatedProject: {
              id: projectId,
              content: submittedContent
            }
          }
        };
        cashay.mutate('updateProject', options);
      }
    };

    return (
      <OutcomeCard
        isArchived={isArchived}
        isProject={isProject}
        onEnterCard={this.onEnterTeamProjectCard}
        onLeaveCard={this.onLeaveTeamProjectCard}
        status={status}
      >
        {/* card main */}
        {hasOpenAssignMenu &&
          <OutcomeCardAssignMenuContainer
            onComplete={this.closeMenu}
            project={project}
          />
        }
        {hasOpenStatusMenu && <OutcomeCardStatusMenu isProject={isProject} project={project}/>}
        {!hasOpenAssignMenu && !hasOpenStatusMenu &&
          <div className={styles.body}>
            <form>
              <Field
                name={projectId}
                component={OutcomeCardTextareaContainer}
                handleActive={handleCardActive}
                handleSubmit={handleSubmit(handleCardUpdate)}
                isArchived={isArchived}
                isProject={isProject}
                project={project}
                doFocus={!content}
                cardHasHover={this.state.cardHasHover}
              />
            </form>
          </div>
        }
        {/* card footer */}
        <OutcomeCardFooter
          cardHasHover={this.state.cardHasHover}
          hasOpenStatusMenu={hasOpenStatusMenu}
          isArchived={isArchived}
          isProject={isProject}
          owner={project.teamMember}
          status={status}
          toggleAssignMenu={this.toggleAssignMenu}
          toggleStatusMenu={this.toggleStatusMenu}
        />
      </OutcomeCard>
    );
  }
}

TeamProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs),
    teamMemberId: PropTypes.string,
  }),
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.string,
  editors: PropTypes.array,
  field: PropTypes.string,
  focus: PropTypes.func,
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  owner: PropTypes.object,
  teamMembers: PropTypes.array,
  updatedAt: PropTypes.instanceOf(Date),
  handleSubmit: PropTypes.func,
};

TeamProjectCard.defaultProps = {
  status: labels.projectStatus.active.slug,
  hasOpenAssignMenu: false,
  hasOpenStatusMenu: false,
  isArchived: false,
  isProject: true,
  owner: {
    preferredName: 'Taya Mueller',
    picture: TayaAvatar
  },
  team: {
    preferredName: 'Engineering',
    picture: 'https://placekitten.com/g/24/24'
  },
};

styles = StyleSheet.create({
  body: {
    width: '100%'
  }
});
