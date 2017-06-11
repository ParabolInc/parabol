import {cashay} from 'cashay';
import {convertFromRaw, convertToRaw, EditorState, Modifier} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
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
    const {outcome: {content}} = props;
    this.state = {
      hasHover: false,
      openArea: 'content',
      editorState: content ?
        EditorState.createWithContent(convertFromRaw(JSON.parse(content)), editorDecorators) :
        EditorState.createEmpty(editorDecorators)
    };
  }

  //componentWillMount() {
  //  // const {outcome: {content}} = this.props;
  //  const {outcome: {content}} = this.props;
  //  if (!content) {
  //    // if there is no content, delete it if the user clicks away from the card
  //    document.addEventListener('click', this.handleDocumentClick);
  //  }
  //}

  componentWillReceiveProps(nextProps) {
    const {content: nextContent} = nextProps.outcome;
    const {content} = this.props.outcome;
    if (content !== nextContent) {
      const {editorState} = this.state;
      const newContentState = mergeServerContent(editorState, convertFromRaw(JSON.parse(nextContent)));
      const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
      this.setEditorState(newEditorState);
    }
  }

  //componentWillUnmount() {
  //  document.removeEventListener('click', this.handleDocumentClick);
  //}

  annouceEditing = (isEditing) => {
    const {outcome: {id: projectId}} = this.props;
    const [teamId] = projectId.split('::');
    cashay.mutate('edit', {
      variables: {
        teamId,
        editing: isEditing ? `Task::${projectId}` : null
      }
    });
  };

  setEditorState = (editorState) => {
    this.setState({
      editorState
    });
  };

  //setEditing = () => {
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
  //};

  hoverOn = () => this.setState({hasHover: true});

  hoverOff = () => this.setState({hasHover: false});

  openMenu = (nextArea) => () => {
    const {openArea} = this.state;
    const newOpenArea = nextArea === openArea ? 'content' : nextArea;
    this.setState({openArea: newOpenArea});
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

  //handleDocumentClick = (e) => {
  //  // try to delete empty card unless they click inside the card
  //  if (!targetIsDescendant(e.target, findDOMNode(this))) {
  //    this.handleCardUpdate();
  //    this.unsetEditing();
  //  }
  //};

  unarchiveProject = () => {
    const {outcome: {id, content}} = this.props;
    const {editorState} = this.state;
    const rawContent = JSON.parse(content);
    const {blocks, entityMap} = rawContent;
    const entityKeys = Object.keys(entityMap);
    const archivedTags = [];
    for (let i =0; i < entityKeys.length; i++) {
      const key = entityKeys[i];
      const entity = entityMap[key];
      if (entity.type === 'TAG' && entity.data.value === 'archived') {
        archivedTags.push(key);
      }
    }
    let contentState = editorState.getCurrentContent();
    const selectionState= editorState.getSelection();
    for (let i = blocks.length -1; i >= 0; i--) {
      const block = blocks[i];
      const {entityRanges, key: blockKey, text} = block;
      const removalRanges = [];
      for (let j = 0; j < entityRanges.length; j++) {
        const range = entityRanges[j];
        const entityKey = String(range.key);
        if (archivedTags.indexOf(entityKey) !== -1) {
          const offset = range.offset;
          const entityEnd = offset + range.length;
          const end = offset === 0 && text[entityEnd] === ' ' ? entityEnd + 1 : entityEnd;
          const start = text[offset - 1] === ' ' ? offset - 1 : offset;
          removalRanges.push({start, end});
        }
      }
      removalRanges.sort((a, b) => a.end < b.end ? 1 : -1);
      for (let j = 0; j < removalRanges.length; j++) {
        const range = removalRanges[j];
        const selectionToRemove = selectionState.merge({
          anchorKey: blockKey,
          focusKey: blockKey,
          anchorOffset: range.start,
          focusOffset: range.end
        });
        contentState = Modifier.removeRange(contentState, selectionToRemove, 'backward');
      }
      if (contentState.getBlockForKey(blockKey).getText() === '') {
        contentState = contentState.merge({
          blockMap: contentState.getBlockMap().delete(blockKey)
        });
      }
    }
    const options = {
      ops: {},
      variables: {
        updatedProject: {
          id,
          content: JSON.stringify(convertToRaw(contentState))
        }
      }
    };
    cashay.mutate('updateProject', options);
  };

  render() {
    const {hasHover, isEditing, openArea, editorState} = this.state;
    const {area, isAgenda, outcome, teamMembers, isDragging} = this.props;
    return (
      <OutcomeCard
        annouceEditing={this.annouceEditing}
        isDragging={isDragging}
        area={area}
        handleCardUpdate={this.handleCardUpdate}
        hasHover={hasHover}
        hoverOn={this.hoverOn}
        hoverOff={this.hoverOff}
        isAgenda={isAgenda}
        openArea={openArea}
        openMenu={this.openMenu}
        outcome={outcome}
        unarchiveProject={this.unarchiveProject}
        setEditorState={this.setEditorState}
        teamMembers={teamMembers}
        editorState={editorState}
      />

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
  editors: PropTypes.array,
  field: PropTypes.string,
  focus: PropTypes.func,
  form: PropTypes.string,
  handleSubmit: PropTypes.func,
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isAgenda: PropTypes.bool,
  owner: PropTypes.object,
  teamMembers: PropTypes.array,
  tags: PropTypes.array,
  updatedAt: PropTypes.instanceOf(Date)
};

export default OutcomeCardContainer;
