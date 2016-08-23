import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import tinycolor from 'tinycolor2';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';
import Avatar from 'universal/components/Avatar/Avatar';

const combineStyles = StyleSheet.combineStyles;
const warmLinkHover = tinycolor(theme.palette.warm).darken(15).toHexString();
let s = {};

const AgendaItem = props => {
  const {desc, index, onClick, status, teamMember = {}} = props;
  const rootStyles = combineStyles(s.root, s[status]);
  let descStyles;
  if (status === 'processed') descStyles = s.strikethrough;
  if (status === 'active') descStyles = s.descActive;
  const descTrim = desc.replace(/\s+/g, '');
  const hash = `#${descTrim}`;

  return (
    <div className={rootStyles} onClick={onClick} title={desc}>
      <div className={s.del}><FontAwesome name="times-circle"/></div>
      <div className={s.index}>{index + 1}.</div>
      <div className={s.desc}>
        <a className={descStyles} href={hash}>{desc}</a>”
      </div>
      <Avatar hasBadge={false} picture={teamMember.picture} size="smallest"/>
    </div>
  );
};

const inlineBlock = {
  display: 'inline-block',
  verticalAlign: 'middle'
};

s = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
    color: theme.palette.cool,
    display: 'flex !important',
    fontSize: theme.typography.s3,
    padding: '.5rem .75rem .5rem 0',
    position: 'relative',
    width: '100%',

    ':hover': {
      backgroundColor: theme.palette.dark20l
    },
    ':focus': {
      backgroundColor: theme.palette.dark20l
    }
  },

  ib: {
    ...inlineBlock
  },

  del: {
    color: theme.palette.dark,
    left: '1.25rem',
    paddingTop: '1px',
    position: 'absolute'
  },

  desc: {
    ...inlineBlock,
    flex: 1,
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    position: 'relative',

    '::before': {
      content: '"“"',
      display: 'block',
      position: 'absolute',
      right: '100%',
      textAlign: 'right',
      width: '1rem'
    }
  },

  descActive: {
    color: theme.palette.warm,
    cursor: 'pointer',

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
    paddingRight: '.75rem',
    paddingTop: '1px',
    textAlign: 'right',
    width: '4rem'
  },

  owner: {
    ...inlineBlock,
    fontWeight: 700,
    paddingTop: '1px',
    textAlign: 'right',
    width: '2rem'
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
  desc: PropTypes.string,
  index: PropTypes.number,
  onClick: PropTypes.func,
  owner: PropTypes.string,
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
  onClick() {
    console.log('AgendaItem.onClick (default)');
  },
  owner: 'MK',
  status: 'waiting'
};

export default look(AgendaItem);
