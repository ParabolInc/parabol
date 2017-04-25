import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import {cashay} from 'cashay';
import labels from 'universal/styles/theme/labels';
import OutcomeCard from 'universal/modules/outcomeCard/components/OutcomeCard/OutcomeCard';
import targetIsDescendant from 'universal/utils/targetIsDescendant';
import removeTagFromString from 'universal/utils/removeTagFromString';

class OutcomeCardContainer extends Component {
  constructor(props) {
    super(props);
    const {outcome: {content}} = props;
    this.state = {
      hasHover: false,
      isEditing: !content,
      openArea: 'content',
      textAreaValue: content
    };
  }

  componentWillMount() {
    // const {outcome: {content}} = this.props;
    const {isEditing} = this.state;
    if (isEditing) {
      // if there is no content, delete it if the user clicks away from the card
      document.addEventListener('click', this.handleDocumentClick);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {content: nextContent} = nextProps.outcome;
    const {content} = this.props.outcome;
    if (content !== nextContent) {
      // if (!content) {
      //   document.removeEventListener('click', this.handleDocumentClick);
      // }
      this.setState({
        textAreaValue: nextContent
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  setValue = (textAreaValue) => {
    this.setState({
      textAreaValue
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
    const {textAreaValue} = this.state;
    const {outcome: {id: projectId, content}} = this.props;
    if (!textAreaValue) {
      cashay.mutate('deleteProject', {variables: {projectId}});
    } else if (textAreaValue !== content) {
      cashay.mutate('updateProject', {
        variables: {
          updatedProject: {
            id: name,
            content: textAreaValue
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
    const {hasHover, isEditing, openArea, textAreaValue} = this.state;
    return (
      <OutcomeCard
        {...this.props}
        handleCardUpdate={this.handleCardUpdate}
        hasHover={hasHover}
        hoverOn={this.hoverOn}
        hoverOff={this.hoverOff}
        isEditing={isEditing}
        openArea={openArea}
        openMenu={this.openMenu}
        unarchiveProject={this.unarchiveProject}
        setEditing={this.setEditing}
        setValue={this.setValue}
        textAreaValue={textAreaValue}
      />

    );
  }
}

OutcomeCardContainer.propTypes = {
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
  owner: PropTypes.object,
  tags: PropTypes.array,
  updatedAt: PropTypes.instanceOf(Date)
};

export default OutcomeCardContainer;
