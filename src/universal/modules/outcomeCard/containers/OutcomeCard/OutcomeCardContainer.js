import {cashay} from 'cashay';
import {convertToRaw, EditorState} from 'draft-js';
import {Set} from 'immutable';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import editorDecorators from 'universal/components/ProjectEditor/decorators';
import OutcomeCard from 'universal/modules/outcomeCard/components/OutcomeCard/OutcomeCard';
import labels from 'universal/styles/theme/labels';
import mergeServerContent from 'universal/utils/mergeServerContent';

const teamMembersQuery = `
query {
  teamMembers(teamId: $teamId) @live {
    id
    picture
    preferredName
  }
}
`;

const mapStateToProps = (state, props) => {
  const [teamId] = props.outcome.id.split('::');
  const {teamMembers} = cashay.query(teamMembersQuery, {
    op: 'outcomeCardContainer',
    key: teamId,
    variables: {teamId}
  }).data;
  return {
    teamMembers
  };
};

@connect(mapStateToProps)
class OutcomeCardContainer extends Component {
  constructor(props) {
    super(props);
    const {contentState} = props;
    this.state = {
      activeEditingClients: Set(),
      cardHasHover: false,
      cardHasFocus: false,
      editorState: EditorState.createWithContent(contentState, editorDecorators),
      cardHasMenuOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const {contentState: nextContentState} = nextProps;
    const {contentState: initialContentState} = this.props;
    if (initialContentState !== nextContentState) {
      const {editorState} = this.state;
      const newContentState = mergeServerContent(editorState, nextContentState);
      const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
      this.setEditorState(newEditorState);
    }

    if (!this.props.isDragging && nextProps.isDragging) {
      this.handleCardUpdate();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const curEditingClients = this.state.activeEditingClients;
    const prevEditingClients = prevState.activeEditingClients;
    const shouldAnnounceEditing =
      (curEditingClients.isEmpty() && !prevEditingClients.isEmpty()) ||
      (!curEditingClients.isEmpty() && prevEditingClients.isEmpty());
    if (shouldAnnounceEditing) {
      this.announceEditing(!curEditingClients.isEmpty());
    }
  }

  setEditorState = (editorState) => {
    const wasFocused = this.state.editorState.getSelection().getHasFocus();
    const isFocused = editorState.getSelection().getHasFocus();
    if (wasFocused !== isFocused) {
      this.trackEditingClient('project-editor', isFocused);
      if (!isFocused) {
        this.handleCardUpdate();
      }
    }
    this.setState({
      editorState
    });
  };

  isEditing = () => !this.state.activeEditingClients.isEmpty();

  trackEditingClient = (uid, isEditing) => {
    this.setState((curState) => {
      const currentClients = curState.activeEditingClients;
      const updatedClients = isEditing
        ? currentClients.add(uid)
        : currentClients.remove(uid);
      return {activeEditingClients: updatedClients};
    });
  };

  setEditorRef = (c) => {
    this.setState({
      editorRef: c
    });
  };

  toggleMenuState = () => {
    this.setState({
      cardHasMenuOpen: !this.state.cardHasMenuOpen
    });
  };

  handleCardUpdate = () => {
    const {cardHasMenuOpen, cardHasFocus, editorState} = this.state;
    const {outcome: {id: projectId}, contentState: initialContentState} = this.props;
    const contentState = editorState.getCurrentContent();
    if (!cardHasFocus && !contentState.hasText() && !cardHasMenuOpen) {
      cashay.mutate('deleteProject', {variables: {projectId}});
    } else if (initialContentState !== contentState) {
      clearTimeout(this.updateTimer);
      this.updateTimer = setTimeout(() => {
        cashay.mutate('updateProject', {
          ops: {},
          variables: {
            updatedProject: {
              id: projectId,
              content: JSON.stringify(convertToRaw(contentState))
            }
          }
        });
        this.updateTimer = undefined;
      }, 15);
    }
  };

  handleCardMouseEnter = () => this.setState({cardHasHover: true});
  handleCardMouseLeave = () => this.setState({cardHasHover: false});

  handleCardBlur = (e) => {
    const cb = !e.currentTarget.contains(e.relatedTarget) && this.handleCardUpdate;
    this.setState({cardHasFocus: false}, cb);
  };

  handleCardFocus = () => this.setState({cardHasFocus: true});

  announceEditing = (isEditing) => {
    const {outcome: {id: projectId}} = this.props;
    const [teamId] = projectId.split('::');
    cashay.mutate('edit', {
      variables: {
        teamId,
        editing: isEditing ? `Task::${projectId}` : null
      }
    });
  };

  render() {
    const {isEditing} = this;
    const {cardHasFocus, cardHasHover, editorRef, editorState, editorHasModal} = this.state;
    const {area, hasDragStyles, isAgenda, outcome, teamMembers, isDragging} = this.props;
    return (
      <div
        tabIndex={-1}
        style={{outline: 'none'}}
        ref={(c) => {
          this.ref = c;
        }}
        onBlur={this.handleCardBlur}
        onFocus={this.handleCardFocus}
        onMouseEnter={this.handleCardMouseEnter}
        onMouseLeave={this.handleCardMouseLeave}
      >
        <OutcomeCard
          area={area}
          editorRef={editorRef}
          editorState={editorState}
          cardHasHover={cardHasHover}
          cardHasFocus={cardHasFocus}
          hasDragStyles={hasDragStyles}
          isAgenda={isAgenda}
          isDragging={isDragging}
          isEditing={isEditing()}
          outcome={outcome}
          setEditorRef={this.setEditorRef}
          setEditorState={this.setEditorState}
          trackEditingClient={this.trackEditingClient}
          teamMembers={teamMembers}
          toggleMenuState={this.toggleMenuState}
        />
      </div>
    );
  }
}

OutcomeCardContainer.propTypes = {
  area: PropTypes.string,
  contentState: PropTypes.object.isRequired,
  outcome: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs),
    teamMemberId: PropTypes.string
  }),
  hasDragStyles: PropTypes.bool,
  isAgenda: PropTypes.bool,
  isDragging: PropTypes.bool,
  teamMembers: PropTypes.array
};

export default OutcomeCardContainer;
