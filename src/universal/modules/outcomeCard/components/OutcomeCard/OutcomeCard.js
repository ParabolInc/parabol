import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {cardRootStyles} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE, USER_DASH} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer';
import OutcomeCardFooter from 'universal/modules/outcomeCard/components/OutcomeCardFooter/OutcomeCardFooter';
import OutcomeCardMessage from 'universal/modules/outcomeCard/components/OutcomeCardMessage/OutcomeCardMessage';
import OutcomeCardAssignMenu from 'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from 'universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu';
import isProjectPrivate from 'universal/utils/isProjectPrivate';
import isProjectArchived from 'universal/utils/isProjectArchived';
import ProjectEditor from 'universal/components/ProjectEditor/ProjectEditor';
import FontAwesome from 'react-fontawesome';

const OutcomeCard = (props) => {
  const {
    area,
    cardHasFocus,
    cardHasHover,
    cardHasIntegration,
    editorRef,
    editorState,
    isAgenda,
    isDragging,
    isEditing,
    handleCardBlur,
    handleCardFocus,
    handleCardMouseEnter,
    handleCardMouseLeave,
    hasDragStyles,
    outcome,
    setEditorRef,
    setEditorState,
    setIntegrationStyles,
    styles,
    teamMembers,
    unarchiveProject
  } = props;
  const cardHasMessage = true;
  const isPrivate = isProjectPrivate(outcome.tags);
  const isArchived = isProjectArchived(outcome.tags);
  const {status} = outcome;
  const rootStyles = css(
    styles.root,
    styles.cardBlock,
    styles[status],
    isPrivate && styles.isPrivate,
    isArchived && styles.isArchived,
    // hover before focus, it matters
    cardHasHover && styles.cardHasHover,
    cardHasFocus && styles.cardHasFocus,
    hasDragStyles && styles.hasDragStyles
  );
  return (
    <div
      className={rootStyles}
      onBlur={handleCardBlur}
      onFocus={handleCardFocus}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      tabIndex="-1"
    >
      {cardHasIntegration &&
        <div className={css(styles.watermarkBlock)}>
          <FontAwesome name="github" className={css(styles.watermark)} />
        </div>
      }
      <div className={css(styles.contentBlock)}>
        <EditingStatusContainer
          isEditing={isEditing}
          outcomeId={outcome.id}
          createdAt={outcome.createdAt}
          updatedAt={outcome.updatedAt}
        />
        <ProjectEditor
          editorRef={editorRef}
          editorState={editorState}
          isArchived={isArchived}
          isDragging={isDragging}
          setEditorRef={setEditorRef}
          setEditorState={setEditorState}
          teamMembers={teamMembers}
        />
        {cardHasIntegration &&
          <a className={css(styles.demoLink)} href="#" title="action issue #1158 on GitHub">
            {'action #1158'}
          </a>
        }
        <OutcomeCardFooter
          cardHasHover={cardHasHover}
          cardHasFocus={cardHasFocus}
          editorState={editorState}
          isAgenda={isAgenda}
          isPrivate={isPrivate}
          outcome={outcome}
          setIntegrationStyles={setIntegrationStyles}
          showTeam={area === USER_DASH}
          teamMembers={teamMembers}
          unarchiveProject={unarchiveProject}
        />
        {cardHasMessage &&
          <OutcomeCardMessage
            hasClose
            message="Looks like there was an issue. We’re working on it!"
          />
        }
      </div>
    </div>
  );
};

OutcomeCard.propTypes = {
  area: PropTypes.string,
  editorRef: PropTypes.any,
  editorState: PropTypes.object,
  cardHasHover: PropTypes.bool,
  cardHasFocus: PropTypes.bool,
  cardHasIntegration: PropTypes.bool,
  handleCardBlur: PropTypes.func,
  handleCardFocus: PropTypes.func,
  handleCardMouseEnter: PropTypes.func,
  handleCardMouseLeave: PropTypes.func,
  hasDragStyles: PropTypes.bool,
  isAgenda: PropTypes.bool,
  isDragging: PropTypes.bool,
  isEditing: PropTypes.bool,
  outcome: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs),
    teamMemberId: PropTypes.string,
    createdAt: PropTypes.instanceOf(Date),
    updatedAt: PropTypes.instanceOf(Date)
  }),
  setEditorRef: PropTypes.func.isRequired,
  setEditorState: PropTypes.func,
  setIntegrationStyles: PropTypes.func,
  styles: PropTypes.object,
  teamMembers: PropTypes.array,
  unarchiveProject: PropTypes.func.isRequired
};

const styleThunk = () => ({
  root: {
    ...cardRootStyles,
    outline: 'none',
    paddingTop: '.1875rem',

    '::after': {
      ...cardBorderTop
    }
  },

  [ACTIVE]: {
    '::after': {
      color: labels.projectStatus[ACTIVE].color
    }
  },

  [STUCK]: {
    '::after': {
      color: labels.projectStatus[STUCK].color
    }
  },

  [DONE]: {
    '::after': {
      color: labels.projectStatus[DONE].color
    }
  },

  [FUTURE]: {
    '::after': {
      color: labels.projectStatus[FUTURE].color
    }
  },

  // hover before focus, it matters

  cardHasHover: {
    boxShadow: ui.cardBoxShadow[1],
  },

  cardHasFocus: {
    boxShadow: ui.cardBoxShadow[2],
  },

  hasDragStyles: {
    boxShadow: 'none'
  },

  // TODO: Cards need block containers, not margin (TA)
  cardBlock: {
    marginBottom: '.5rem'
  },

  isPrivate: {
    backgroundColor: appTheme.palette.light50l
  },

  isArchived: {
    '::after': {
      color: labels.archived.color
    }
  },

  contentBlock: {
    position: 'relative',
    zIndex: ui.ziMenu - 1
  },

  watermarkBlock: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 0,
    verticalAlign: 'middle',
    zIndex: ui.ziMenu - 2
  },

  watermark: {
    bottom: 0,
    color: ui.palette.dark,
    fontSize: '7rem',
    height: '8rem',
    lineHeight: '8rem',
    margin: 'auto -1.5rem -1.5rem auto',
    opacity: .12,
    position: 'absolute',
    right: 0,
    width: '8rem',
  },

  demoLink: {
    color: ui.palette.cool,
    display: 'block',
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: '1.25rem',
    padding: '0 .5rem'
  }
});

export default withStyles(styleThunk)(OutcomeCard);
