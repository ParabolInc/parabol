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

  return connectDropTarget(
    <div className={css(styles.root)}>
      {agenda.length > 0 ?
        <div className={css(styles.inner)}>
          {agenda.map((item, idx) =>
            <AgendaItem
              key={`agendaItem${item.id}`}
              agendaItem={item}
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
            />
          )}
        </div> :
        <div className={css(styles.empty)}>
          <div className={css(styles.emptyInner)}>
            {context === 'meeting' ?
              'Add a placeholder to be discussed with others during the meeting. ' :
              'Add a reminder to be discussed with others during the next meeting. '
            }
            {'Use a few short words to jog your memory like: “'}<b>{'upcoming vacation'}</b>{'”'}
          </div>
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
  router: PropTypes.object,
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

  empty: {
    padding: '.5rem .5rem 0 1.875rem',
    width: '100%'
  },

  emptyInner: {
    backgroundColor: 'rgba(0, 0, 0, .05)',
    borderRadius: ui.borderRadiusSmall,
    color: appTheme.palette.dark10d,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    lineHeight: '1.125rem',
    padding: '.5rem',
    width: '100%'
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
