import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import CopyToClipboard from 'react-copy-to-clipboard';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import voidClick from 'universal/utils/voidClick';

const inlineBlock = {
  display: 'inline-block',
  height: '1.75rem',
  lineHeight: '1.75rem',
  verticalAlign: 'top'
};

const CopyShortLink = (props) => {
  const {styles, url} = props;
  return (
    <CopyToClipboard text={url}>
      {/* TODO: prevent navigation and show a “Copied!” message inline or toast */}
      <a
        className={css(styles.link)}
        href={url}
        onClick={voidClick}
        title={`Copy link to meeting: ${url}`}
      >
        <span className={css(styles.linkText)}>{url}</span>
        <span className={css(styles.icon)}>
          <FontAwesome
            name="copy"
            style={inlineBlock}
          />
        </span>
      </a>
    </CopyToClipboard>
  );
};

CopyShortLink.propTypes = {
  styles: PropTypes.object,
  url: PropTypes.string
};

const styleThunk = () => ({
  link: {
    backgroundColor: appTheme.palette.cool10l,
    borderRadius: '.375rem',
    display: 'block',
    fontSize: 0,
    lineHeight: '1.75rem',
    margin: '0 auto',
    maxWidth: '24rem',
    padding: '.625rem .5rem',
    textAlign: 'center',
    textDecoration: 'none !important',

    ':hover': {
      backgroundColor: appTheme.palette.cool20l
    },
    ':focus': {
      backgroundColor: appTheme.palette.cool20l
    }
  },

  linkText: {
    ...inlineBlock,
    ...textOverflow,
    fontSize: appTheme.typography.s6,
    maxWidth: '20rem'
  },

  icon: {
    ...inlineBlock,
    fontSize: ui.iconSize2x,
    marginLeft: '.5rem'
  }
});

export default withStyles(styleThunk)(CopyShortLink);
