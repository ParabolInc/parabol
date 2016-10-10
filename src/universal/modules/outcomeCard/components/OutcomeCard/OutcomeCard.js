import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';
import OutcomeCardTextarea from 'universal/modules/outcomeCard/components/OutcomeCardTextarea/OutcomeCardTextarea';
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer';
import OutcomeCardFooter from 'universal/modules/outcomeCard/components/OutcomeCardFooter/OutcomeCardFooter';
import OutcomeCardAssignMenu from 'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from 'universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu';
import {Field} from 'redux-form';
import {USER_DASH} from 'universal/utils/constants';

const OutcomeCard = (props) => {
  const {
    area,
    isAgenda,
    form,
    handleCardActive,
    handleCardUpdate,
    handleSubmit,
    hasHover,
    hoverOn,
    hoverOff,
    openArea,
    toggleAssignMenu,
    openContentMenu,
    toggleStatusMenu,
    outcome,
    styles,
    teamMembers,
  } = props;

  const isProject = Boolean(outcome.status);
  const {isArchived} = outcome;
  const rootStyles = css(
    styles.root,
    styles.cardBlock,
    isProject ? styles[status] : styles.isAction,
    isArchived && styles.isArchived
  );

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
          isProject={isProject}
          onComplete={openContentMenu}
          outcome={outcome}
        />
      }
      {openArea === 'content' &&
        <div>
          <form>
            <EditingStatusContainer
              form={form}
              outcomeId={outcome.id}
              updatedAt={outcome.updatedAt}
            />
            <Field
              cardHasHover={hasHover}
              component={OutcomeCardTextarea}
              handleActive={handleCardActive}
              handleSubmit={handleSubmit(handleCardUpdate)}
              isProject={isProject}
              name={outcome.id}
              isArchived={outcome.isArchived}
              doFocus={!outcome.content}
            />
          </form>
        </div>
      }
      <OutcomeCardFooter
        cardHasHover={hasHover}
        hasOpenStatusMenu={openArea === 'status'}
        outcome={outcome}
        showTeam={area === USER_DASH}
        toggleAssignMenu={toggleAssignMenu}
        toggleStatusMenu={toggleStatusMenu}
      />
    </div>
  );
};

OutcomeCard.propTypes = {
  children: PropTypes.any,
  isArchived: PropTypes.bool,
  isProject: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.cardBorderColor}`,
    borderRadius: ui.cardBorderRadius,
    maxWidth: '20rem',
    minHeight: ui.cardMinHeight,
    paddingTop: '.1875rem',
    position: 'relative',
    width: '100%',

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

  isAction: {
    backgroundColor: appTheme.palette.light50l,

    '::after': {
      color: labels.action.color
    }
  },

  isArchived: {
    '::after': {
      color: labels.archived.color
    }
  }
});

export default withStyles(styleThunk)(OutcomeCard);
