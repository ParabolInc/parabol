import {cashay} from 'cashay';
import {ContentState, convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';
import OutcomeCard from 'universal/modules/outcomeCard/components/OutcomeCard/OutcomeCard';
import labels from 'universal/styles/theme/labels';
import removeTagFromString from 'universal/utils/removeTagFromString';
import targetIsDescendant from 'universal/utils/targetIsDescendant';
import editorDecorators from 'universal/components/ProjectEditor/decorators';

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
      isEditing: !content,
      openArea: 'content',
      editorState: content ? EditorState.createWithContent(convertFromRaw(JSON.parse(content)), editorDecorators) : EditorState.createEmpty(editorDecorators)
    };
  }

  componentWillMount() {
    // const {outcome: {content}} = this.props;
    const {outcome: {content}} = this.props;
    if (!content) {
      // if there is no content, delete it if the user clicks away from the card
      document.addEventListener('click', this.handleDocumentClick);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {content: nextContent} = nextProps.outcome;
    const {content} = this.props.outcome;
    if (content !== nextContent) {
      const newContentState = nextContent ? convertFromRaw(JSON.parse(nextContent)) : ContentState.createFromText('');
      const newEditorState = EditorState.push(this.state.editorState, newContentState);
      this.setEditorState(newEditorState)
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  setEditorState = (editorState) => {
    this.setState({
      editorState
    });
  };

  setEditing = () => {
    this.setState({isEditing: true});
    document.addEventListener('click', this.handleDocumentClick);
    const {outcome: {id: projectId}} = this.props;
    const [teamId] = projectId.split('::');
    cashay.mutate('edit', {
      variables: {
        teamId,
        editing: `Task::${projectId}`
      }
    });
  };

  hoverOn = () => this.setState({hasHover: true});

  hoverOff = () => this.setState({hasHover: false});

  openMenu = (nextArea) => () => {
    const {openArea} = this.state;
    if (nextArea === openArea) {
      this.setState({openArea: 'content'});
    } else {
      this.setState({openArea: nextArea});
    }
  };

  handleCardUpdate = () => {
    const {editorState} = this.state;
    const {outcome: {id: projectId, content}} = this.props;
    if (!editorState) {
      cashay.mutate('deleteProject', {variables: {projectId}});
    } else if (editorState !== content) {
      cashay.mutate('updateProject', {
        ops: {},
        variables: {
          updatedProject: {
            id: projectId,
            content: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
          }
        }
      });
    }
  };

  handleDocumentClick = (e) => {
    // try to delete empty card unless they click inside the card
    if (!targetIsDescendant(e.target, findDOMNode(this))) {
      this.handleCardUpdate();
      this.unsetEditing();
    }
  };

  unarchiveProject = () => {
    const {outcome: {id, content}} = this.props;

    const options = {
      ops: {},
      variables: {
        updatedProject: {
          id,
          content: removeTagFromString(content, '#archived')
        }
      }
    };
    cashay.mutate('updateProject', options);
  };

  unsetEditing = () => {
    const {outcome: {id: projectId}} = this.props;
    this.setState({isEditing: false});
    document.removeEventListener('click', this.handleDocumentClick);
    const [teamId] = projectId.split('::');
    cashay.mutate('edit', {
      variables: {
        teamId,
        editing: null
      }
    });
  };

  render() {
    const {hasHover, isEditing, openArea, editorState} = this.state;
    const {area, isAgenda, outcome, teamMembers} = this.props;
    return (
      <OutcomeCard
        area={area}
        handleCardUpdate={this.handleCardUpdate}
        hasHover={hasHover}
        hoverOn={this.hoverOn}
        hoverOff={this.hoverOff}
        isAgenda={isAgenda}
        isEditing={isEditing}
        openArea={openArea}
        openMenu={this.openMenu}
        outcome={outcome}
        unarchiveProject={this.unarchiveProject}
        setEditing={this.setEditing}
        setEditorState={this.setEditorState}
        teamMembers={teamMembers}
        editorState={editorState}
        unsetEditing={this.unsetEditing}
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
