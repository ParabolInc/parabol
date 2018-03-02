import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {DragSource as dragSource} from 'react-dnd';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import Avatar from 'universal/components/Avatar/Avatar';
import inAgendaGroup from 'universal/modules/meeting/helpers/inAgendaGroup';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {AGENDA_ITEM, phaseArray} from 'universal/utils/constants';

const taskSource = {
  beginDrag(props) {
    return {
      id: props.agendaItem.id
    };
  }
};

class AgendaItem extends Component {
  static propTypes = {
    agendaItem: PropTypes.object.isRequired,
    agendaLength: PropTypes.number.isRequired,
    canNavigate: PropTypes.bool,
    connectDragSource: PropTypes.func.isRequired,
    content: PropTypes.string,
    disabled: PropTypes.bool,
    ensureVisible: PropTypes.bool,
    handleRemove: PropTypes.func,
    idx: PropTypes.number,
    isCurrent: PropTypes.bool,
    isComplete: PropTypes.bool,
    isFacilitator: PropTypes.bool,
    facilitatorPhase: PropTypes.oneOf(phaseArray),
    gotoAgendaItem: PropTypes.func,
    localPhase: PropTypes.oneOf(phaseArray),
    localPhaseItem: PropTypes.number,
    styles: PropTypes.object,
    teamMember: PropTypes.object
  };

  componentDidMount() {
    this.scrollToIfNeeded();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.ensureVisible && this.props.ensureVisible) {
      this.scrollToIfNeeded();
    }
  }

  scrollToIfNeeded = () => {
    if (this.props.ensureVisible && this.el) {
      this.el.scrollIntoView({behavior: 'smooth'});
    }
  };

  el = null;

  render() {
    const {
      agendaItem,
      agendaLength,
      canNavigate,
      connectDragSource,
      disabled,
      idx,
      isCurrent,
      isFacilitator,
      handleRemove,
      localPhase,
      facilitatorPhase,
      gotoAgendaItem,
      localPhaseItem,
      styles
    } = this.props;
    const {content, isComplete, teamMember = {}} = agendaItem;
    const isLocal = idx + 1 === localPhaseItem;
    const canDelete = !isComplete && !isCurrent && !disabled;
    const inAgendaGroupLocal = inAgendaGroup(localPhase);
    const inAgendaGroupFacilitator = inAgendaGroup(facilitatorPhase);
    const rootStyles = css(
      styles.root,
      inAgendaGroupLocal && isLocal && styles.itemLocal,
      inAgendaGroupFacilitator && isFacilitator && styles.itemFacilitator,
      isComplete && styles.processed,
      disabled && styles.rootDisabled,
      isComplete && disabled && styles.processedDisabled
    );
    const contentStyles = css(
      styles.link,
      isComplete && styles.strikethrough,
      canNavigate && styles.canNavigate,
      inAgendaGroupLocal && isLocal && styles.descLocal,
      inAgendaGroupFacilitator && isFacilitator && styles.descFacilitator
    );
    const delStyles = css(
      styles.del,
      disabled && styles.delDisabled,
      // we can make the position of the del (x) more centered when there’s a low number of agenda items
      agendaLength < 10 ? styles.delBumpRight : styles.delBumpLeft
    );
    return connectDragSource(
      <div className={rootStyles} title={content} ref={(el) => { this.el = el; }}>
        {canDelete &&
        <div className={delStyles} onClick={handleRemove}>
          <FontAwesome name="times-circle" style={{lineHeight: 'inherit'}} />
        </div>
        }
        <div className={css(styles.index)}>{idx + 1}.</div>
        <div className={css(styles.content)} onClick={gotoAgendaItem}>
          <a className={contentStyles}>{content}</a>”
        </div>
        <div className={css(styles.author)}>
          <Avatar hasBadge={false} picture={teamMember.picture} size="smallest" />
        </div>
      </div>
    );
  }
}

const lineHeight = '1.5rem';

const styleThunk = () => ({
  root: {
    backgroundColor: 'transparent',
    color: ui.palette.mid,
    display: 'flex',
    fontSize: appTheme.typography.s3,
    padding: '.5rem .5rem .5rem 0',
    position: 'relative',
    width: '100%',

    ':hover': {
      backgroundColor: appTheme.palette.light50l
    },
    ':focus': {
      backgroundColor: appTheme.palette.light50l
    },
    ':hover > div': {
      opacity: 1
    }
  },

  rootDisabled: {
    ':hover': {
      backgroundColor: 'transparent'
    },
    ':focus': {
      backgroundColor: 'transparent'
    }
  },

  del: {
    color: appTheme.palette.warm,
    cursor: 'pointer',
    height: '1.5rem',
    left: ui.meetingSidebarGutter,
    lineHeight,
    opacity: 0,
    position: 'absolute',
    textAlign: 'center',
    top: '.5rem',
    transition: 'opacity .1s ease-in',
    width: ui.iconSize
  },

  delDisabled: {
    opacity: '0 !important'
  },

  delBumpLeft: {
    left: ui.meetingSidebarGutter
  },

  delBumpRight: {
    left: '.8125rem'
  },

  content: {
    fontSize: appTheme.typography.s3,
    flex: 1,
    fontWeight: 400,
    lineHeight,
    position: 'relative',
    wordBreak: 'break-word',

    '::before': {
      content: '"“"',
      display: 'block',
      position: 'absolute',
      right: '100%',
      textAlign: 'right',
      width: '1rem'
    }
  },

  link: {
    color: ui.palette.mid,

    ...makeHoverFocus({
      color: ui.palette.mid,
      textDecoration: 'none'
    })
  },

  itemLocal: {
    color: ui.colorText
  },

  descLocal: {
    color: ui.linkColor,
    ':hover': {
      color: ui.linkColorHover
    },
    ':focus': {
      color: ui.linkColorHover
    }
  },

  itemFacilitator: {
    backgroundColor: ui.navMenuLightBackgroundColorActive,
    boxShadow: `inset 3px 0 0 ${ui.palette.mid}`,
    color: ui.colorText
  },

  descFacilitator: {
    color: ui.linkColor,
    ':hover': {
      color: ui.linkColorHover
    },
    ':focus': {
      color: ui.linkColorHover
    }
  },

  index: {
    fontWeight: 400,
    height: '1.5rem',
    lineHeight,
    opacity: '.5',
    paddingRight: '.75rem',
    paddingTop: '.0625rem',
    textAlign: 'right',
    width: '3.75rem'
  },

  author: {
    textAlign: 'right',
    width: '2rem'
  },

  active: {
    color: appTheme.palette.warm
  },

  processed: {
    opacity: '.5',

    ':hover': {
      opacity: '1'
    }
  },

  processedDisabled: {
    ':hover': {
      opacity: '.5'
    }
  },

  strikethrough: {
    textDecoration: 'line-through',

    ...makeHoverFocus({
      textDecoration: 'line-through'
    })
  },

  canNavigate: {
    color: ui.colorText,

    ...makeHoverFocus({
      cursor: 'pointer',
      opacity: '.5',
      textDecoration: 'underline'
    })
  }
});

const dragSourceCb = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

export default createFragmentContainer(
  dragSource(AGENDA_ITEM, taskSource, dragSourceCb)(
    withStyles(styleThunk)(AgendaItem)
  ),
  graphql`
    fragment AgendaItem_agendaItem on AgendaItem {
      id
      content
      isComplete
      teamMember {
        picture
      }
    }`
);
