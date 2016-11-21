import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import tinycolor from 'tinycolor2';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import voidClick from 'universal/utils/voidClick';
import {DragSource as dragSource} from 'react-dnd';
import {AGENDA_ITEM} from 'universal/utils/constants';

const projectSource = {
  beginDrag(props) {
    return {
      id: props.agendaItem.id,
      dragState: props.agendaDragState
    };
  },
  // isDragging(props, monitor) {
  //   return props.project.id === monitor.getItem().id;
  // },
  endDrag(props) {
    props.agendaDragState.handleEndDrag();
  }
};

const AgendaItem = props => {
  const {agendaItem, connectDragSource, idx, handleRemove, agendaPhaseItem, gotoAgendaItem, styles} = props;
  const {content, isComplete, teamMember = {}} = agendaItem;
  const isCurrent = idx + 1 === agendaPhaseItem;
  const canDelete = !isComplete && !isCurrent;
  const isMeeting = agendaPhaseItem !== undefined;
  const handleGoto = isMeeting ? gotoAgendaItem : voidClick;
  const rootStyles = css(
    styles.root,
    // styles[status],
    isCurrent && styles.itemActive,
    isComplete && styles.processed
  );
  const contentStyles = css(
    isCurrent && styles.descActive,
    isComplete && styles.strikethrough
  );
  return connectDragSource(
    <div className={rootStyles} title={content}>
      {canDelete &&
        <div className={css(styles.del)} onClick={handleRemove}>
          <FontAwesome name="times-circle" style={{lineHeight: 'inherit'}}/>
        </div>
      }
      <div className={css(styles.index)}>{idx + 1}.</div>
      <div className={css(styles.content)} onClick={handleGoto}>
        <a className={contentStyles} >{content}</a>”
      </div>
      <div className={css(styles.author)}>
        <Avatar hasBadge={false} picture={teamMember.picture} size="smallest"/>
      </div>
    </div>
  );
};

AgendaItem.propTypes = {
  agendaDragState: PropTypes.object,
  agendaPhaseItem: PropTypes.number,
  connectDragSource: PropTypes.func.isRequired,
  content: PropTypes.string,
  idx: PropTypes.number,
  isCurrent: PropTypes.bool,
  isComplete: PropTypes.bool,
  gotoAgendaItem: PropTypes.func,
  handleRemove: PropTypes.func,
  // status: PropTypes.oneOf([
  //   'active',
  //   'onDrag',
  //   'onHover',
  //   'processed',
  //   'waiting'
  // ]),
  styles: PropTypes.object,
  teamMember: PropTypes.object
};

const warmLinkHover = tinycolor(appTheme.palette.warm).darken(15).toHexString();
const block = {
  lineHeight: '1.5rem'
};

const inlineBlock = {
  ...block,
  display: 'inline-block',
  verticalAlign: 'top'
};

const styleThunk = () => ({
  root: {
    backgroundColor: 'transparent',
    color: appTheme.palette.cool,
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

  del: {
    ...block,
    color: appTheme.palette.dark,
    cursor: 'pointer',
    left: '1.125rem',
    height: '1.5rem',
    opacity: 0,
    position: 'absolute',
    top: '.5rem',
    transition: 'opacity .1s ease-in'
  },

  content: {
    ...inlineBlock,
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    padding: '0 40px 0 0',
    position: 'relative',
    cursor: 'pointer',
    width: '168px',

    '::before': {
      content: '"“"',
      display: 'block',
      position: 'absolute',
      right: '100%',
      textAlign: 'right',
      width: '1rem'
    }
  },

  itemActive: {
    color: appTheme.palette.warm
  },

  descActive: {
    color: appTheme.palette.warm,
    ':hover': {
      color: warmLinkHover
    },
    ':focus': {
      color: warmLinkHover
    },
  },

  index: {
    ...inlineBlock,
    fontWeight: 700,
    height: '1.5rem',
    paddingRight: '.75rem',
    paddingTop: '1px',
    textAlign: 'right',
    width: '4rem'
  },

  author: {
    position: 'absolute',
    right: '.5rem',
    top: '.5rem'
  },

  active: {
    color: appTheme.palette.warm
  },

  processed: {
    opacity: '.5',

    ':hover': {
      opacity: '1'
    },
    ':focus': {
      opacity: '1'
    }
  },

  strikethrough: {
    textDecoration: 'line-through',

    ':hover': {
      textDecoration: 'underline'
    },
    ':focus': {
      textDecoration: 'underline'
    }
  }
});

const dragSourceCb = (connectSource, monitor) => ({
  connectDragSource: connectSource.dragSource(),
  connectDragPreview: connectSource.dragPreview(),
  isDragging: monitor.isDragging()
});

export default dragSource(AGENDA_ITEM, projectSource, dragSourceCb)(
  withStyles(styleThunk)(AgendaItem)
);
