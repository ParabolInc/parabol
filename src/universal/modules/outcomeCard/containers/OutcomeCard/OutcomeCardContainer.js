import {cashay} from 'cashay';
import {convertToRaw, EditorState} from 'draft-js';
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
      cardHasHover: false,
      cardHasFocus: false,
      editorState: EditorState.createWithContent(contentState, editorDecorators)
  }
    ;
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

  setEditorState = (editorState) => {
    const wasFocused = this.state.editorState.getSelection().getHasFocus();
    const isFocused = editorState.getSelection().getHasFocus();
    if (wasFocused !== isFocused) {
      this.annouceEditing(isFocused);
      //if (!isFocused) {
      //  this.handleCardUpdate();
      //}
    }
    this.setState({
      editorState
    });
  };


  setEditorRef = (c) => {
    this.setState({
      editorRef: c
    });
  };

  handleCardUpdate = (canDelete) => {
    const {editorState} = this.state;
    const {outcome: {id: projectId}, contentState: initialContentState} = this.props;
    const contentState = editorState.getCurrentContent();
    if (canDelete && !contentState.hasText()) {
      cashay.mutate('deleteProject', {variables: {projectId}});
    } else if (initialContentState !== contentState) {
      cashay.mutate('updateProject', {
        ops: {},
        variables: {
          updatedProject: {
            id: projectId,
            content: JSON.stringify(convertToRaw(contentState))
          }
        }
      });
    }
  };

  handleBlur = (e) => {
    console.log('cur', e.currentTarget, e.relatedTarget)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.handleCardUpdate(true);
    }
  };

  handleCardMouseEnter = () => this.setState({cardHasHover: true});
  handleCardMouseLeave = () => this.setState({cardHasHover: false});

  handleCardBlur = () => this.setState({cardHasFocus: false});
  handleCardFocus = () => this.setState({cardHasFocus: true});

  annouceEditing = (isEditing) => {
    this.setState({
      isEditing
    });
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
    const {cardHasFocus, cardHasHover, isEditing, editorRef, editorState} = this.state;
    const {area, hasDragStyles, isAgenda, outcome, teamMembers, isDragging} = this.props;
    return (
      <div tabIndex={-1} onBlur={this.handleBlur} style={{outline: 'none'}}>
        <OutcomeCard
          area={area}
          editorRef={editorRef}
          editorState={editorState}
          cardHasHover={cardHasHover}
          cardHasFocus={cardHasFocus}
          handleCardBlur={this.handleCardBlur}
          handleCardFocus={this.handleCardFocus}
          handleCardMouseLeave={this.handleCardMouseLeave}
          handleCardMouseEnter={this.handleCardMouseEnter}
          hasDragStyles={hasDragStyles}
          isAgenda={isAgenda}
          isDragging={isDragging}
          isEditing={isEditing}
          outcome={outcome}
          setEditorRef={this.setEditorRef}
          setEditorState={this.setEditorState}
          teamMembers={teamMembers}
          unarchiveProject={this.unarchiveProject}
        />
      </div>
    );
  }
}

OutcomeCardContainer.propTypes = {
  area: PropTypes.string,
  outcome: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs),
    teamMemberId: PropTypes.string
  }),
  editorState: PropTypes.object,
  editors: PropTypes.array,
  field: PropTypes.string,
  focus: PropTypes.func,
  form: PropTypes.string,
  handleSubmit: PropTypes.func,
  hasDragStyles: PropTypes.bool,
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isAgenda: PropTypes.bool,
  isDragging: PropTypes.bool,
  owner: PropTypes.object,
  teamMembers: PropTypes.array,
  tags: PropTypes.array,
  createdAt: PropTypes.instanceOf(Date),
  updatedAt: PropTypes.instanceOf(Date)
};

export default OutcomeCardContainer;
