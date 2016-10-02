import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import {cashay} from 'cashay';
import {Field, reduxForm, initialize} from 'redux-form';
import labels from 'universal/styles/theme/labels';
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer';
import OutcomeCardAssignMenuContainer
  from '../OutcomeCardAssignMenu/OutcomeCardAssignMenuContainer';
import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
import OutcomeCardTextarea from 'universal/components/OutcomeCard/OutcomeCardTextarea';
import OutcomeCardFooter from 'universal/components/OutcomeCard/OutcomeCardFooter';
import OutcomeCardStatusMenu from 'universal/components/OutcomeCard/OutcomeCardStatusMenu';
import throttle from 'lodash.throttle';
import {USER_DASH} from 'universal/utils/constants';
const OPEN_CONTENT_MENU = 'TeamProjectCard/openContentMenu';
const OPEN_ASSIGN_MENU = 'TeamProjectCard/openAssignMenu';
const OPEN_STATUS_MENU = 'TeamProjectCard/openStatusMenu';

@reduxForm()
export default class TeamProjectCard extends Component {
  componentWillMount() {
    const {project: {content}} = this.props;
    this.state = {
      cardHasHover: false,
      openMenu: OPEN_CONTENT_MENU
    };
    if (content) {
      this.initializeValues(content);
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
    const {openMenu} = this.state;
    const nextOpenMenu = openMenu === OPEN_STATUS_MENU ? OPEN_CONTENT_MENU : OPEN_STATUS_MENU;
    this.setState({openMenu: nextOpenMenu});
  };

  toggleAssignMenu = () => {
    // REVIEW: next line a bad way to disable assign menu for archived cards? (TA)
    if (this.props.isArchived) return;

    const {openMenu} = this.state;
    const nextOpenMenu = openMenu === OPEN_ASSIGN_MENU ? OPEN_CONTENT_MENU : OPEN_ASSIGN_MENU;
    this.setState({openMenu: nextOpenMenu});
  };

  unarchiveCard = () => {
    const {project} = this.props;
    const options = {
      variables: {
        updatedProject: {
          id: project.id,
          isArchived: false
        }
      }
    };
    cashay.mutate('updateProject', options);
  };

  closeMenu = () => {
    this.setState({openMenu: OPEN_CONTENT_MENU});
  };

  handleCardUpdate = throttle((submittedData) => {
    const {id: projectId, content} = this.props.project;
    const submittedContent = submittedData[projectId];
    if (submittedContent !== content) {
      // strictly for undefined to delete a card if & only if it never had a value in it
      if (submittedContent === undefined) {
        // delete blank cards
        cashay.mutate('deleteProject', {variables: {projectId}});
      } else {
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
    }
  }, 300);

  render() {
    const {openMenu} = this.state;
    const {
      area,
      form,
      handleSubmit,
      project,
      isArchived,
    } = this.props;
    const {content, status, id: projectId} = project;
    const hasOpenStatusMenu = openMenu === OPEN_STATUS_MENU;
    const hasOpenAssignMenu = openMenu === OPEN_ASSIGN_MENU;
    const handleCardActive = (isActive) => {
      if (isActive === undefined) {
        return;
      }
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


    const handleStatusClick = isArchived ? this.unarchiveCard : this.toggleStatusMenu;
    return (
      <OutcomeCard
        isArchived={isArchived}
        isProject={true}
        onEnterCard={this.onEnterTeamProjectCard}
        onLeaveCard={this.onLeaveTeamProjectCard}
        status={status}
      >
        {/* card main */}
        {hasOpenAssignMenu &&
          <OutcomeCardAssignMenuContainer
            onComplete={this.closeMenu}
            outcome={project}
          />
        }
        {hasOpenStatusMenu && <OutcomeCardStatusMenu isProject={true} outcome={project}/>}
        {!hasOpenAssignMenu && !hasOpenStatusMenu &&
          <div style={{width: '100%'}}>
            <form>
              <EditingStatusContainer
                form={form}
                outcomeId={project.id}
                updatedAt={project.updatedAt}
              />
              <Field
                name={projectId}
                component={OutcomeCardTextarea}
                handleActive={handleCardActive}
                handleSubmit={handleSubmit(this.handleCardUpdate)}
                isArchived={isArchived}
                isProject={true}
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
          isProject={true}
          owner={project.teamMember}
          outcome={project}
          showTeam={area === USER_DASH}
          status={status}
          toggleAssignMenu={this.toggleAssignMenu}
          handleStatusClick={handleStatusClick}
        />
      </OutcomeCard>
    );
  }
}

TeamProjectCard.propTypes = {
  area: PropTypes.string,
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
