import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import ProjectEditor from 'universal/components/ProjectEditor/ProjectEditor';
import ProjectIntegrationLink from 'universal/components/ProjectIntegrationLink';
import ProjectWatermark from 'universal/components/ProjectWatermark';
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer';
import OutcomeCardFooter from 'universal/modules/outcomeCard/components/OutcomeCardFooter/OutcomeCardFooter';
import {cardBorderTop, cardRootStyles} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {ACTIVE, DONE, FUTURE, STUCK} from 'universal/utils/constants';
import isProjectArchived from 'universal/utils/isProjectArchived';
import isProjectPrivate from 'universal/utils/isProjectPrivate';

const OutcomeCard = (props) => {
  const {
    cardHasFocus,
    cardHasHover,
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
    styles,
    teamMembers
  } = props;
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
  const {integration} = outcome;
  const {service} = integration || {};
  return (
    <div
      className={rootStyles}
      onBlur={handleCardBlur}
      onFocus={handleCardFocus}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      tabIndex="-1"
    >
      <ProjectWatermark service={service} />
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
          readOnly={Boolean(isArchived || isDragging || service)}
          setEditorRef={setEditorRef}
          setEditorState={setEditorState}
          teamMembers={teamMembers}
        />
        <ProjectIntegrationLink integration={integration} />
        <OutcomeCardFooter
          cardHasHover={cardHasHover}
          cardHasFocus={cardHasFocus}
          editorState={editorState}
          isAgenda={isAgenda}
          isPrivate={isPrivate}
          outcome={outcome}
          teamMembers={teamMembers}
        />
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
  styles: PropTypes.object,
  teamMembers: PropTypes.array
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
    boxShadow: ui.shadow[1]
  },

  cardHasFocus: {
    boxShadow: ui.shadow[2]
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
  }
});

export default withStyles(styleThunk)(OutcomeCard);
