import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {DragSource as dragSource} from 'react-dnd';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import tinycolor from 'tinycolor2';
import Avatar from 'universal/components/Avatar/Avatar';
import inAgendaGroup from 'universal/modules/meeting/helpers/inAgendaGroup';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {AGENDA_ITEM, phaseArray} from 'universal/utils/constants';

const projectSource = {
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
    handleRemove: PropTypes.func,
    idx: PropTypes.number,
    isCurrent: PropTypes.bool,
    isComplete: PropTypes.bool,
    facilitatorPhase: PropTypes.oneOf(phaseArray),
    facilitatorPhaseItem: PropTypes.number,
    gotoAgendaItem: PropTypes.func,
    localPhase: PropTypes.oneOf(phaseArray),
    localPhaseItem: PropTypes.number,
    styles: PropTypes.object,
    teamMember: PropTypes.object
  };

  componentDidMount() {
    this.scrollToWhenCurrent();
  }

  componentDidUpdate() {
    this.scrollToWhenCurrent();
  }

  scrollToWhenCurrent = () => {
    if (this.props.isCurrent && this.el) {
      this.el.scrollIntoViewIfNeeded();
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
      handleRemove,
      localPhase,
      facilitatorPhase,
      facilitatorPhaseItem,
      gotoAgendaItem,
      localPhaseItem,
      styles
    } = this.props;
    const {content, isComplete, teamMember = {}} = agendaItem;
    const isLocal = idx + 1 === localPhaseItem;
    const isFacilitator = idx + 1 === facilitatorPhaseItem;
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

AgendaItem.propTypes = {
  agendaItem: PropTypes.object.isRequired,
  agendaLength: PropTypes.number.isRequired,
  canNavigate: PropTypes.bool,
  connectDragSource: PropTypes.func.isRequired,
  content: PropTypes.string,
  disabled: PropTypes.bool,
  handleRemove: PropTypes.func,
  idx: PropTypes.number,
  isCurrent: PropTypes.bool,
  isComplete: PropTypes.bool,
  facilitatorPhase: PropTypes.oneOf(phaseArray),
  facilitatorPhaseItem: PropTypes.number,
  gotoAgendaItem: PropTypes.func,
  localPhase: PropTypes.oneOf(phaseArray),
  localPhaseItem: PropTypes.number,
  styles: PropTypes.object,
  teamMember: PropTypes.object
};

const warmLinkHover = tinycolor(appTheme.palette.warm).darken(15).toHexString();
const lineHeight = '1.5rem';

const styleThunk = () => ({
  root: {
    backgroundColor: 'transparent',
    color: appTheme.palette.cool,
    display: 'flex',
    fontSize: appTheme.typography.s3,
    padding: '.5rem .5rem .5rem 0',
    position: 'relative',
    width: '100%',

    ':hover': {
      backgroundColor: appTheme.palette.dark20l
    },
    ':focus': {
      backgroundColor: appTheme.palette.dark20l
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
    color: appTheme.palette.dark,
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
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    flex: 1,
    fontStyle: 'italic',
    fontWeight: 700,
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
    ...makeHoverFocus({
      color: ui.linkColor,
      textDecoration: 'none'
    })
  },

  itemLocal: {
    color: appTheme.palette.dark70d
  },

  descLocal: {
    color: appTheme.palette.dark70d,
    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },

  itemFacilitator: {
    color: appTheme.palette.warm
  },

  descFacilitator: {
    color: appTheme.palette.warm,
    ':hover': {
      color: warmLinkHover
    },
    ':focus': {
      color: warmLinkHover
    }
  },

  index: {
    fontWeight: 700,
    height: '1.5rem',
    lineHeight,
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
    color: ui.linkColor,

    ...makeHoverFocus({
      color: ui.linkColorHover,
      cursor: 'pointer',
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
  dragSource(AGENDA_ITEM, projectSource, dragSourceCb)(
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
