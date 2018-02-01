import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {DropTarget as dropTarget} from 'react-dnd';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import handleAgendaHover from 'universal/dnd/handleAgendaHover';
import handleDrop from 'universal/dnd/handleDrop';
import withDragState from 'universal/dnd/withDragState';
import AgendaItem from 'universal/modules/teamDashboard/components/AgendaItem/AgendaItem';
import RemoveAgendaItemMutation from 'universal/mutations/RemoveAgendaItemMutation';
import {overflowTouch} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {AGENDA_ITEM, phaseArray} from 'universal/utils/constants';

const columnTarget = {
  drop: handleDrop,
  hover: handleAgendaHover
};

class AgendaList extends Component {
  state = {
    overflownAbove: false,
    overflownBelow: false
  };

  setOverflowContainerElRef = (el) => {
    this.overflowContainerEl = el;
    this.setState({
      overflownAbove: this.isOverflownAbove(),
      overflownBelow: this.isOverflownBelow()
    });
    if (!el) { return; }
    this.overflowContainerEl.addEventListener('scroll', () => {
      const overflownAbove = this.isOverflownAbove();
      const overflownBelow = this.isOverflownBelow();
      const newState = {};
      if (this.state.overflownAbove !== overflownAbove) {
        newState.overflownAbove = overflownAbove;
      }
      if (this.state.overflownBelow !== overflownBelow) {
        newState.overflownBelow = overflownBelow;
      }
      if (Object.keys(newState).length) {
        this.setState(newState);
      }
    });
  }

  makeLoadingState() {
    const {styles} = this.props;
    const loadingItem = <div className={css(styles.agendaItemLoading)} />;
    return (
      <div className={css(styles.agendaItemsLoadingBlock)}>
        {loadingItem}
        {loadingItem}
        {loadingItem}
      </div>
    );
  }

  makeEmptyState() {
    const {context, styles} = this.props;
    const meetingContext = context === 'dashboard' ? 'next meeting' : 'meeting';
    return (<div className={css(styles.emptyBlock)}>
      <div className={css(styles.emptyEmoji)}>
          🤓
      </div>
      <div className={css(styles.emptyMessage)}>
        {`Pssst. Add topics for your ${meetingContext}! Use a phrase like “`}<b><i>{'upcoming vacation'}</i></b>{'.”'}
      </div>
    </div>
    );
  }

  makeOverflownAboveShadow = () => {
    return (
      <div
        style={{
          boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
          height: '1px'
        }}
      />
    );
  };

  makeOverflownBelowShadow = () => {
    return (
      <div
        style={{
          boxShadow: '0 -1px 1px rgba(0, 0, 0, 0.25)',
          height: '1px'
        }}
      />
    );
  };

  overflowContainerEl = null;

  isOverflownAbove = () => {
    const {overflowContainerEl} = this;
    if (!overflowContainerEl) { return false; }
    return overflowContainerEl.scrollTop > 0;
  };

  isOverflownBelow = () => {
    const {overflowContainerEl} = this;
    if (!overflowContainerEl) { return false; }
    return overflowContainerEl.scrollHeight - overflowContainerEl.scrollTop > overflowContainerEl.clientHeight;
  };

  removeItemFactory = (agendaId) => () => {
    const {atmosphere} = this.props;
    RemoveAgendaItemMutation(atmosphere, agendaId);
  };

  render() {
    const {
      agendaPhaseItem,
      canNavigate,
      connectDropTarget,
      disabled,
      dragState,
      facilitatorPhase,
      facilitatorPhaseItem,
      gotoAgendaItem,
      localPhase,
      localPhaseItem,
      styles,
      team
    } = this.props;
    const {overflownAbove, overflownBelow} = this.state;
    const {agendaItems} = team;
    const canNavigateItems = canNavigate && !disabled;
    dragState.clear();
    // TODO handle isLoading
    const isLoading = false;
    return connectDropTarget(
      <div className={css(styles.root)}>
        {overflownAbove && this.makeOverflownAboveShadow()}
        {agendaItems.length > 0 ?
          <div className={css(styles.inner)} ref={this.setOverflowContainerElRef}>
            {agendaItems.map((item, idx) =>
              (<AgendaItem
                key={`agendaItem${item.id}`}
                agendaItem={item}
                agendaLength={agendaItems.length}
                agendaPhaseItem={agendaPhaseItem}
                canNavigate={canNavigateItems}
                disabled={disabled}
                facilitatorPhase={facilitatorPhase}
                facilitatorPhaseItem={facilitatorPhaseItem}
                gotoAgendaItem={gotoAgendaItem && gotoAgendaItem(idx)}
                handleRemove={this.removeItemFactory(item.id)}
                idx={idx}
                isCurrent={idx + 1 === agendaPhaseItem}
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
            {isLoading ? this.makeLoadingState() : this.makeEmptyState()}
          </div>
        }
        {overflownBelow && this.makeOverflownBelowShadow()}
      </div>
    );
  }
}

AgendaList.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  agendaPhaseItem: PropTypes.number,
  canNavigate: PropTypes.bool,
  connectDropTarget: PropTypes.func.isRequired,
  context: PropTypes.string,
  disabled: PropTypes.bool,
  dragState: PropTypes.object.isRequired,
  facilitatorPhase: PropTypes.oneOf(phaseArray),
  facilitatorPhaseItem: PropTypes.number,
  gotoAgendaItem: PropTypes.func,
  localPhase: PropTypes.oneOf(phaseArray),
  localPhaseItem: PropTypes.number,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '5rem',
    maxHeight: '15rem',
    width: '100%'
  },

  inner: {
    ...overflowTouch,
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

export default createFragmentContainer(
  withAtmosphere(withDragState(
    dropTarget(AGENDA_ITEM, columnTarget, dropTargetCb)(
      withStyles(styleThunk)(AgendaList)
    )
  )),
  graphql`
    fragment AgendaList_team on Team {
      agendaItems {
        id
        # need these 2 for the DnD
        isComplete
        sortOrder
        ...AgendaItem_agendaItem
      }
    }`
);
