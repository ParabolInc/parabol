import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, STUCK, DONE, FUTURE, USER_DASH} from 'universal/utils/constants';
import {cardBorderTop} from 'universal/styles/helpers';
import OutcomeCardTextarea from 'universal/modules/outcomeCard/components/OutcomeCardTextarea/OutcomeCardTextarea';
import EditingStatusContainer from 'universal/containers/EditingStatus/EditingStatusContainer';
import OutcomeCardFooter from 'universal/modules/outcomeCard/components/OutcomeCardFooter/OutcomeCardFooter';
import OutcomeCardAssignMenu from 'universal/modules/outcomeCard/components/OutcomeCardAssignMenu/OutcomeCardAssignMenu';
import OutcomeCardStatusMenu from 'universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu';
import {Field} from 'redux-form';

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
    openMenu,
    outcome,
    styles,
    teamMembers,
    unarchiveProject
  } = props;
  const isProject = Boolean(outcome.status);
  const {isArchived, status} = outcome;
  const rootStyles = css(
    styles.root,
    styles.cardBlock,
    isProject ? styles[status] : styles.isAction,
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
          isProject={isProject}
          onComplete={openContentMenu}
          outcome={outcome}
        />
      }
      {openArea === 'content' &&
        <div>
          <EditingStatusContainer
            form={form}
            outcomeId={outcome.id}
            updatedAt={outcome.updatedAt}
          />
          <form>
            <Field
              cardHasHover={hasHover}
              component={OutcomeCardTextarea}
              handleActive={handleCardActive}
              handleSubmit={handleSubmit(handleCardUpdate)}
              isProject={isProject}
              name={outcome.id}
              isArchived={outcome.isArchived}
            />
          </form>
        </div>
      }
      <OutcomeCardFooter
        cardHasHover={hasHover}
        hasOpenStatusMenu={openArea === 'status'}
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
  handleCardActive: PropTypes.func,
  handleCardUpdate: PropTypes.func,
  hasHover: PropTypes.bool,
  hoverOn: PropTypes.func,
  hoverOff: PropTypes.func,
  openArea: PropTypes.string,
  openMenu: PropTypes.func,
  styles: PropTypes.object,
  outcome: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs),
    teamMemberId: PropTypes.string,
  }),
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.string,
  editors: PropTypes.array,
  field: PropTypes.string,
  focus: PropTypes.func,
  hasOpenAssignMenu: PropTypes.bool,
  hasOpenStatusMenu: PropTypes.bool,
  isProject: PropTypes.bool,
  owner: PropTypes.object,
  teamMembers: PropTypes.array,
  updatedAt: PropTypes.instanceOf(Date),
  handleSubmit: PropTypes.func,
  unarchiveProject: PropTypes.func.isRequired
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.cardBorderColor}`,
    borderRadius: ui.cardBorderRadius,
    maxWidth: ui.cardMaxWidth,
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
