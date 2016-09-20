import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import tinycolor from 'tinycolor2';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import Avatar from 'universal/components/Avatar/Avatar';
import voidClick from 'universal/utils/voidClick';

const combineStyles = StyleSheet.combineStyles;
const warmLinkHover = tinycolor(theme.palette.warm).darken(15).toHexString();
let styles = {};

const AgendaItem = props => {
  const {desc, idx, handleRemove, isComplete, agendaPhaseItem, gotoAgendaItem, teamMember = {}} = props;
  const isCurrent = idx + 1 === agendaPhaseItem;
  const canDelete = !isComplete && !isCurrent;
  const isMeeting = agendaPhaseItem !== undefined;
  const handleGoto = isMeeting ? gotoAgendaItem : voidClick;
  let rootStyles = combineStyles(styles.root, styles[status]);
  let descStyles;
  if (isComplete) descStyles = styles.strikethrough;
  if (isCurrent) descStyles = combineStyles(descStyles, styles.descActive);
  if (isCurrent) rootStyles = combineStyles(rootStyles, styles.itemActive);
  if (isComplete) rootStyles = combineStyles(rootStyles, styles.processed);
  // const descTrim = desc.replace(/\s+/g, '');

  return (
    <div className={rootStyles} title={desc}>
      {canDelete &&
        <div className={styles.del} onClick={handleRemove}>
          <FontAwesome name="times-circle" style={{lineHeight: 'inherit'}}/>
        </div>
      }
      <div className={styles.index}>{idx + 1}.</div>
      <div className={styles.desc} onClick={handleGoto}>
        <a className={descStyles} >{desc}</a>”
      </div>
      <div className={styles.author}>
        <Avatar hasBadge={false} picture={teamMember.picture} size="smallest"/>
      </div>
    </div>
  );
};

const block = {
  lineHeight: '1.5rem'
};

const inlineBlock = {
  ...block,
  display: 'inline-block',
  verticalAlign: 'top'
};

styles = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
    color: theme.palette.cool,
    fontSize: theme.typography.s3,
    padding: '.5rem .5rem .5rem 0',
    position: 'relative',
    width: '100%',

    ':hover': {
      backgroundColor: theme.palette.dark20l
    },
    ':focus': {
      backgroundColor: theme.palette.dark20l
    },
    ':hover > div': {
      opacity: 1
    }
  },

  ib: {
    ...inlineBlock
  },

  del: {
    ...block,
    color: theme.palette.dark,
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
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s3,
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
    color: theme.palette.warm
  },

  descActive: {
    color: theme.palette.warm,
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
    color: theme.palette.warm
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
  teamMember: PropTypes.object
};

AgendaItem.defaultProps = {
  desc: 'pull request',
  index: 1,
  status: 'waiting'
};

export default look(AgendaItem);
