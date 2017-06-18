import {cashay} from 'cashay';
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import editorDecorators from 'universal/components/ProjectEditor/decorators';
import OutcomeCard from 'universal/modules/outcomeCard/components/OutcomeCard/OutcomeCard';
import labels from 'universal/styles/theme/labels';
import mergeServerContent from 'universal/utils/mergeServerContent';
import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity';

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
    const {outcome: {content}} = props;
    this.state = {
      hasHover: false,
      openArea: 'content',
      editorState: content ?
        EditorState.createWithContent(convertFromRaw(JSON.parse(content)), editorDecorators) :
        EditorState.createEmpty(editorDecorators)
    };
    // this.tags = content ? getTagsFromEntityMap(JSON.parse(content).entityMap) : [];
  }

  // componentWillMount() {
  //  // const {outcome: {content}} = this.props;
  //  const {outcome: {content}} = this.props;
  //  if (!content) {
  //    // if there is no content, delete it if the user clicks away from the card
  //    document.addEventListener('click', this.handleDocumentClick);
  //  }
  // }

  componentWillReceiveProps(nextProps) {
    const {content: nextContent} = nextProps.outcome;
    const {outcome: {content}} = this.props;
    if (content !== nextContent) {
      const {editorState} = this.state;
      const newContentState = mergeServerContent(editorState, convertFromRaw(JSON.parse(nextContent)));
      const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
      this.setEditorState(newEditorState);
      // this.tags = getTagsFromEntityMap(JSON.parse(nextContent).entityMap);
    }

    if (!this.props.isDragging && nextProps.isDragging) {
      this.handleCardUpdate();
    }
  }

  // componentWillUnmount() {
  //  document.removeEventListener('click', this.handleDocumentClick);
  // }

  setEditorState = (editorState) => {
    const wasFocused = this.state.editorState.getSelection().getHasFocus();
    const isFocused = editorState.getSelection().getHasFocus();
    if (wasFocused !== isFocused) {
      this.annouceEditing(isFocused);
    }
    this.setState({
      editorState
    });
  };

  // setEditing = () => {
  //  this.setState({isEditing: true});
  //  document.addEventListener('click', this.handleDocumentClick);
  //  const {outcome: {id: projectId}} = this.props;
  //  const [teamId] = projectId.split('::');
  //  cashay.mutate('edit', {
  //    variables: {
  //      teamId,
  //      editing: `Task::${projectId}`
  //    }
  //  });
  // };

  setEditorRef = (c) => {
    this.setState({
      editorRef: c
    });
  };

  handleCardUpdate = () => {
    const {editorState} = this.state;
    const {outcome: {id: projectId, content}} = this.props;
    const contentState = editorState.getCurrentContent();
    if (contentState.getPlainText() === '') {
      cashay.mutate('deleteProject', {variables: {projectId}});
    } else {
      const rawContentStr = JSON.stringify(convertToRaw(contentState));
      if (rawContentStr !== content) {
        cashay.mutate('updateProject', {
          ops: {},
          variables: {
            updatedProject: {
              id: projectId,
              content: rawContentStr
            }
          }
        });
      }
    }
  };

  unarchiveProject = () => {
    const {outcome: {id, content}} = this.props;
    const {editorState} = this.state;
    const eqFn = (data) => data.value === 'archived';
    const nextContentState = removeAllRangesForEntity(editorState, content, 'TAG', eqFn);
    const options = {
      ops: {},
      variables: {
        updatedProject: {
          id,
          content: JSON.stringify(convertToRaw(nextContentState))
        }
      }
    };
    cashay.mutate('updateProject', options);
  };

  handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.handleCardUpdate();
    }
  };

  openMenu = (nextArea) => () => {
    const {openArea} = this.state;
    const newOpenArea = nextArea === openArea ? 'content' : nextArea;
    this.setState({openArea: newOpenArea});
  };

  hoverOn = () => this.setState({hasHover: true});

  hoverOff = () => this.setState({hasHover: false});

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
    const {hasHover, isEditing, openArea, editorRef, editorState} = this.state;
    const {area, isAgenda, outcome, teamMembers, isDragging} = this.props;
    return (
      <div tabIndex={-1} onBlur={this.handleBlur} style={{outline: 'none'}}>
        <OutcomeCard
          area={area}
          editorRef={editorRef}
          editorState={editorState}
          handleCardUpdate={this.handleCardUpdate}
          hasHover={hasHover}
          hoverOff={this.hoverOff}
          hoverOn={this.hoverOn}
          isAgenda={isAgenda}
          isDragging={isDragging}
          isEditing={isEditing}
          openArea={openArea}
          openMenu={this.openMenu}
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
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isAgenda: PropTypes.bool,
  isDragging: PropTypes.bool,
  owner: PropTypes.object,
  teamMembers: PropTypes.array,
  tags: PropTypes.array,
  updatedAt: PropTypes.instanceOf(Date)
};

export default OutcomeCardContainer;
