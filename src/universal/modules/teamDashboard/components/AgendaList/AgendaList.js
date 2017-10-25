import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {overflowTouch} from 'universal/styles/helpers';
import {cashay} from 'cashay';
import AgendaItem from 'universal/modules/teamDashboard/components/AgendaItem/AgendaItem';
import {AGENDA_ITEM, phaseArray} from 'universal/utils/constants';
import handleAgendaHover from 'universal/dnd/handleAgendaHover';
import {DropTarget as dropTarget} from 'react-dnd';
import withDragState from 'universal/dnd/withDragState';
import handleDrop from 'universal/dnd/handleDrop';

const columnTarget = {
  drop: handleDrop,
  hover: handleAgendaHover
};

const removeItemFactory = (itemId) => () => {
  const options = {variables: {id: itemId}};
  cashay.mutate('removeAgendaItem', options);
};

const AgendaList = (props) => {
  const {
    agenda,
    agendaPhaseItem,
    canNavigate,
    connectDropTarget,
    context,
    disabled,
    dragState,
    facilitatorPhase,
    facilitatorPhaseItem,
    gotoAgendaItem,
    localPhase,
    localPhaseItem,
    styles
  } = props;

  const canNavigateItems = canNavigate && !disabled;

  dragState.clear();

  const makeAgendaItemLoading = () =>
    <div className={css(styles.agendaItemLoading)} />;

  const makeLoadingState = () => (
    <div className={css(styles.agendaItemsLoadingBlock)}>
      {makeAgendaItemLoading()}
      {makeAgendaItemLoading()}
      {makeAgendaItemLoading()}
    </div>
  );

  const meetingContext = context === 'dashboard' ? 'next meeting' : 'meeting';

  const makeEmptyState = () => (
    <div className={css(styles.emptyBlock)}>
      <div className={css(styles.emptyEmoji)}>
        🤓
      </div>
      <div className={css(styles.emptyMessage)}>
        {`Pssst. Add topics for your ${meetingContext}! Use a phrase like “`}<b><i>{'upcoming vacation'}</i></b>{'.”'}
      </div>
    </div>
  );

  const isLoading = false;

  return connectDropTarget(
    <div className={css(styles.root)}>
      {agenda.length > 0 ?
        <div className={css(styles.inner)}>
          {agenda.map((item, idx) =>
            (<AgendaItem
              key={`agendaItem${item.id}`}
              agendaItem={item}
              agendaLength={agenda.length}
              agendaPhaseItem={agendaPhaseItem}
              canNavigate={canNavigateItems}
              disabled={disabled}
              facilitatorPhase={facilitatorPhase}
              facilitatorPhaseItem={facilitatorPhaseItem}
              gotoAgendaItem={gotoAgendaItem && gotoAgendaItem(idx)}
              handleRemove={removeItemFactory(item.id)}
              idx={idx}
              localPhase={localPhase}
              localPhaseItem={localPhaseItem}
              ref={(c) => {
                if (c) {
                  dragState.components.push(c);
                }
              }}
            />)
          )}
        </div> :
        <div>
          {isLoading ? makeLoadingState() : makeEmptyState()}
        </div>
      }
    </div>
  );
};

AgendaList.propTypes = {
  agenda: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string
  })),
  agendaPhaseItem: PropTypes.number,
  connectDropTarget: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  facilitatorPhase: PropTypes.oneOf(phaseArray),
  facilitatorPhaseItem: PropTypes.number,
  gotoAgendaItem: PropTypes.func,
  localPhase: PropTypes.oneOf(phaseArray),
  localPhaseItem: PropTypes.number,
  styles: PropTypes.object,
  teamId: PropTypes.string.isRequired
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'relative',
    width: '100%'
  },

  inner: {
    ...overflowTouch,
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: '100%'
  },

  emptyBlock: {
    alignItems: 'flex-start',
    display: 'flex',
    padding: ui.meetingSidebarGutter,
    paddingTop: 0
  },

  emptyEmoji: {
    fontSize: appTheme.typography.s4,
    minWidth: '2rem',
    paddingLeft: '.75rem'
  },

  emptyMessage: {
    color: ui.palette.dark,
    flex: 1,
    fontSize: appTheme.typography.s2,
    lineHeight: '1.5',
    paddingLeft: '.5rem',
    paddingTop: '.25rem'
  },

  agendaItemsLoadingBlock: {
    padding: ui.meetingSidebarGutter,
    paddingLeft: '1.625rem',
    paddingTop: 0,
    width: '100%'
  },

  agendaItemLoading: {
    display: 'flex',
    padding: `${ui.meetingSidebarGutter} 0`,

    ':before': {
      backgroundColor: appTheme.palette.mid20l,
      borderRadius: ui.borderRadiusSmall,
      display: 'block',
      content: '""',
      flex: 1,
      height: '1.5rem',
      marginRight: ui.meetingSidebarGutter
    },

    ':after': {
      backgroundColor: appTheme.palette.mid50l,
      borderRadius: '100%',
      display: 'block',
      content: '""',
      height: '1.5rem',
      width: '1.5rem'
    }
  }
});

const dropTargetCb = (connectTarget) => ({
  connectDropTarget: connectTarget.dropTarget()
});
export default withDragState(
  dropTarget(AGENDA_ITEM, columnTarget, dropTargetCb)(
    withStyles(styleThunk)(AgendaList)
  )
);
