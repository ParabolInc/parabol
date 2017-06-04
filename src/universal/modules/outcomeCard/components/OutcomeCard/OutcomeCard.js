import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {cardRootStyles} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE, USER_DASH} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';
import OutcomeCardTextarea from 'universal/modules/outcomeCard/components/OutcomeCardTextarea/OutcomeCardTextarea';
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer';
import OutcomeCardFooter from 'universal/modules/outcomeCard/components/OutcomeCardFooter/OutcomeCardFooter';
import OutcomeCardAssignMenu from 'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from 'universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu';
import isProjectPrivate from 'universal/utils/isProjectPrivate';
import isProjectArchived from 'universal/utils/isProjectArchived';

const OutcomeCard = (props) => {
  const {
    area,
    isAgenda,
    isEditing,
    handleCardUpdate,
    hasHover,
    hoverOn,
    hoverOff,
    openArea,
    openMenu,
    outcome,
    setEditing,
    setEditorState,
    styles,
    teamMembers,
    editorState,
    unarchiveProject,
    unsetEditing,
    isDragging
  } = props;
  const isPrivate = isProjectPrivate(outcome.tags);
  const isArchived = isProjectArchived(outcome.tags);
  const {status} = outcome;
  const rootStyles = css(
    styles.root,
    styles.cardBlock,
    styles[status],
    isPrivate && styles.isPrivate,
    isArchived && styles.isArchived
  );
  const openContentMenu = openMenu('content');
  return (
    <div className={rootStyles} onMouseEnter={hoverOn} onMouseLeave={hoverOff} >
      {openArea === 'assign' &&
        <OutcomeCardAssignMenu
          onComplete={openContentMenu}
          outcome={outcome}
          teamMembers={teamMembers}
        />
      }
      {openArea === 'status' &&
        <OutcomeCardStatusMenu
          isAgenda={isAgenda}
          onComplete={openContentMenu}
          outcome={outcome}
        />
      }
      {openArea === 'content' &&
        <div>
          <EditingStatusContainer
            isEditing={isEditing}
            outcomeId={outcome.id}
            updatedAt={outcome.updatedAt}
          />
          <OutcomeCardTextarea
            isDragging={isDragging}
            cardHasHover={hasHover}
            content={outcome.content}
            handleCardUpdate={handleCardUpdate}
            isArchived={isArchived}
            isEditing={isEditing}
            isPrivate={isPrivate}
            name={outcome.id}
            setEditing={setEditing}
            setEditorState={setEditorState}
            teamMembers={teamMembers}
            editorState={editorState}
            unsetEditing={unsetEditing}
          />
        </div>
      }
      <OutcomeCardFooter
        cardHasHover={hasHover}
        hasOpenStatusMenu={openArea === 'status'}
        isPrivate={isPrivate}
        outcome={outcome}
        showTeam={area === USER_DASH}
        toggleAssignMenu={openMenu('assign')}
        toggleStatusMenu={openMenu('status')}
        unarchiveProject={unarchiveProject}
      />
    </div>
  );
};

OutcomeCard.propTypes = {
  area: PropTypes.string,
  children: PropTypes.any,
  isArchived: PropTypes.bool,
  isAgenda: PropTypes.bool,
  handleCardUpdate: PropTypes.func,
  hasHover: PropTypes.bool,
  hoverOn: PropTypes.func,
  hoverOff: PropTypes.func,
  isEditing: PropTypes.bool,
  openArea: PropTypes.string,
  openMenu: PropTypes.func,
  styles: PropTypes.object,
  outcome: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs),
    teamMemberId: PropTypes.string
  }),
  editors: PropTypes.array,
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  owner: PropTypes.object,
  setEditing: PropTypes.func,
  setEditorState: PropTypes.func,
  teamMembers: PropTypes.array,
  editorState: PropTypes.object,
  updatedAt: PropTypes.instanceOf(Date),
  unarchiveProject: PropTypes.func.isRequired,
  unsetEditing: PropTypes.func
};

const styleThunk = () => ({
  root: {
    ...cardRootStyles,
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
  }
});

export default withStyles(styleThunk)(OutcomeCard);
