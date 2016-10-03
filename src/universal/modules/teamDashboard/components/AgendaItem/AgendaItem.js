import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import tinycolor from 'tinycolor2';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import voidClick from 'universal/utils/voidClick';

const AgendaItem = props => {
  const {desc, idx, handleRemove, isComplete, agendaPhaseItem, gotoAgendaItem, styles, teamMember = {}} = props;
  const isCurrent = idx + 1 === agendaPhaseItem;
  const canDelete = !isComplete && !isCurrent;
  const isMeeting = agendaPhaseItem !== undefined;
  const handleGoto = isMeeting ? gotoAgendaItem : voidClick;
  const rootStyles = css(
    styles.root,
    styles[status],
    isCurrent && styles.itemActive,
    isComplete && styles.processed
  );
  const descStyles = css(
    isCurrent && styles.descActive,
    isComplete && styles.strikethrough
  );
  return (
    <div className={rootStyles} title={desc}>
      {canDelete &&
        <div className={css(styles.del)} onClick={handleRemove}>
          <FontAwesome name="times-circle" style={{lineHeight: 'inherit'}}/>
        </div>
      }
      <div className={css(styles.index)}>{idx + 1}.</div>
      <div className={css(styles.desc)} onClick={handleGoto}>
        <a className={descStyles} >{desc}</a>”
      </div>
      <div className={css(styles.author)}>
        <Avatar hasBadge={false} picture={teamMember.picture} size="smallest"/>
      </div>
    </div>
  );
};

AgendaItem.propTypes = {
  agendaPhaseItem: PropTypes.number,
  desc: PropTypes.string,
  idx: PropTypes.number,
  isCurrent: PropTypes.bool,
  isComplete: PropTypes.bool,
  gotoAgendaItem: PropTypes.func,
  handleRemove: PropTypes.func,
  status: PropTypes.oneOf([
    'active',
    'onDrag',
    'onHover',
    'processed',
    'waiting'
  ]),
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

  desc: {
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

export default withStyles(styleThunk)(AgendaItem);
