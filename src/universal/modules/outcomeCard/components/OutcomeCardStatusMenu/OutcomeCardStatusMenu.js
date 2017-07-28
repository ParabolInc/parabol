import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton';
import {convertToRaw} from 'draft-js';
import addTagToProject from 'universal/utils/draftjs/addTagToProject';
import {textOverflow} from 'universal/styles/helpers';
import {Menu, MenuItem} from 'universal/modules/menu';

const statusItems = labels.projectStatus.slugs.slice(0);

const OutcomeCardStatusMenu = (props) => {
  const {onComplete, outcome, isAgenda, styles, editorState} = props;
  const {id: projectId, status} = outcome;

  const privateLabel = <div className={css(styles.label)}>{'Set as '}<b>{'#private'}</b></div>;
  const archiveLabel = <div className={css(styles.label)}>{'Set as '}<b>{'#archived'}</b></div>;
  const deleteOutcomeLabel = <div className={css(styles.label)}>{'Delete this Project'}</div>;

  const archiveProject = () => {
    const contentState = editorState.getCurrentContent();
    const newContent = addTagToProject(contentState, '#archived');
    const rawContentStr = JSON.stringify(convertToRaw(newContent));
    const options = {
      ops: {},
      variables: {
        updatedProject: {
          id: projectId,
          content: rawContentStr
        }
      }
    };
    cashay.mutate('updateProject', options);
  };

  const deleteOutcome = () => {
    const options = {
      variables: {
        projectId
      }
    };
    cashay.mutate('deleteProject', options);
    if (onComplete) {
      onComplete();
    }
  };

  const handleProjectUpdateFactory = (newStatus) => () => {
    if (newStatus === status) {
      return;
    }
    const options = {
      ops: {},
      variables: {
        updatedProject: {
          id: projectId,
          status: newStatus
        }
      }
    };
    cashay.mutate('updateProject', options);
    if (onComplete) {
      onComplete();
    }
  };

  const originAnchor = {
    vertical: 'bottom',
    horizontal: 'right'
  };

  const targetAnchor = {
    vertical: 'top',
    horizontal: 'right'
  };

  const toggle = <OutcomeCardFooterButton icon="ellipsis-v" />;

  const itemFactory = () => {
    const listItems = [];
    statusItems.map((btn, idx) => {
      const itemStatus = labels.projectStatus[btn];
      const {color, icon, label, slug} = itemStatus;
      const handleProjectUpdate = handleProjectUpdateFactory(slug);
      const labelBlock = <div className={css(styles.label)}>{'Move to '}<b style={{color}}>{label}</b></div>;
      listItems.push(
        <MenuItem
          icon={icon}
          iconColor={color}
          isActive={status === itemStatus.slug}
          key={btn}
          label={labelBlock}
          onClick={handleProjectUpdate}
        />
      );
    });
    listItems.push(
      <MenuItem
        hr="before"
        icon="lock"
        key="private"
        label={privateLabel}
        onClick={console.log('add #private tag!')}
      />
    );
    { !isAgenda &&
      listItems.push(
        <MenuItem
          icon="archive"
          key="archive"
          label={archiveLabel}
          onClick={archiveProject}
        />
      );
    }
    { isAgenda &&
      listItems.push(
        <MenuItem
          icon="times"
          key="delete"
          label={deleteOutcomeLabel}
          onClick={deleteOutcome}
        />
      );
    }
    return listItems;
  };

  return (
    <Menu
      itemFactory={itemFactory}
      maxHeight="14.0625rem"
      originAnchor={originAnchor}
      targetAnchor={targetAnchor}
      toggle={toggle}
    />
  );
};

OutcomeCardStatusMenu.propTypes = {
  editorState: PropTypes.object,
  outcome: PropTypes.object,
  isAgenda: PropTypes.bool,
  onComplete: PropTypes.func,
  styles: PropTypes.object
};

const styleThunk = () => ({
  label: {
    ...textOverflow,
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal} 0 0`
  }
});

export default withStyles(styleThunk)(OutcomeCardStatusMenu);
