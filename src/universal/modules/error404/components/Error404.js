import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import {Route} from 'react-router-dom';

// Images
import parabolLogoMark from 'universal/styles/theme/images/brand/parabol-lockup-h.svg';
import teamCheckIcon from 'universal/modules/landing/components/Landing/images/team-check-icon.svg';
import mapIcon from 'universal/modules/landing/components/Landing/images/map-icon.svg';
import megaphoneIcon from 'universal/modules/landing/components/Landing/images/megaphone-icon.svg';
import github from 'universal/modules/landing/components/Landing/images/github.svg';
import teamingPhoto from 'universal/styles/theme/images/banners/teaming.jpg';
import cuteCat from './images/kitten.jpg';

const Error404 = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.layout)}>
      {/* Header */}
      <div className={css(styles.header)}>
        <div className={css(styles.headerInner)}>
          <div className={css(styles.container)}>
            <h1 className={css(styles.mainHeading)}>
            {'Sorry :('}
            </h1>
            <h2 className={css(styles.mainSubheading)}>
              {"The page you're looking for doesn't exist."}
              <br />
              {`You can return to our home page 
                or stare at this cat for as long as you like.`}
            </h2>
            <div className={css(styles.primaryButtonBlock)}>
              <Route render={({ history }) => (
                <Button
                  buttonSize="large"
                  buttonStyle="solid"
                  colorPalette="warm"
                  depth={1}
                  isBlock
                  label="HOME PAGE"
                  onClick={() => { history.push('/') }}
                  textTransform="uppercase"
                />
              )} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={css(styles.footer)}>
        <div className={css(styles.container)}>
          <a href="http://www.parabol.co/" title="Parabol, Inc.">
            <img className={css(styles.footerBrand)} src={parabolLogoMark} />
          </a>
          <div className={css(styles.footerCopy)}>
            {'©2017 Crafted with care by '}
            <br className={css(styles.footerBreak)} />
            {'the friendly folks at '}
            <a
              className={css(styles.footerLink)}
              href="http://www.parabol.co/"
              title="Parabol, Inc."
            >
              Parabol, Inc.
            </a>{' '}
            <br className={css(styles.footerBreak)} />
            Say hello:{' '}
            <a
              className={css(styles.footerLink)}
              href="mailto:love@parabol.co"
              title="Say hello!"
            >
              love@parabol.co
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

Error404.propTypes = {
  // children included here for multi-part landing pages (FAQs, pricing, cha la la)
  // children: PropTypes.element,
  styles: PropTypes.object
};

// Breakpoint constants
const layoutBreakpoint = '@media (min-width: 64rem)';
const headerBreakpoint = '@media (min-width: 48rem)';
const textShadow = '0 1px 0 rgba(0, 0, 0, .5)';

const styleThunk = () => ({
  // Layout
  // -------

  layout: {
    lineHeight: 1.5,

    [layoutBreakpoint]: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }
  },

  header: {
    alignItems: 'center',
    backgroundColor: appTheme.palette.warm,
    backgroundImage: `url(${cuteCat})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 'calc(100vw * .35)',
    position: 'relative',
    textAlign: 'center',
    width: '100%',

    [headerBreakpoint]: {
      padding: '2rem 1rem'
    },

    [layoutBreakpoint]: {
      padding: 0
    },

    '::after': {
      backgroundColor: appTheme.palette.dark,
      bottom: 0,
      content: '""',
      left: 0,
      opacity: '.65',
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 100
    }
  },

  headerInner: {
    position: 'relative',
    zIndex: 200
  },

  content: {
    [layoutBreakpoint]: {
      flex: 1
    }
  },

  mainHeading: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: '0 0 .25em',
    textShadow,

    [headerBreakpoint]: {
      fontSize: '3rem'
    }
  },

  mainSubheading: {
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0 auto 1rem',
    maxWidth: '52rem',
    textShadow,

    [headerBreakpoint]: {
      fontSize: appTheme.typography.s6,
      fontWeight: 400,
      margin: '0 auto 1.5rem'
    }
  },

  primaryButtonBlock: {
    margin: '0 auto 1.5rem',
    maxWidth: '13rem',
    width: '100%'
  },

  container: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '2rem 1rem',
    position: 'relative',

    [layoutBreakpoint]: {
      padding: '4rem 2rem'
    }
  },

  // Footer
  // -------

  footer: {
    backgroundColor: appTheme.palette.dark,
    color: '#fff',
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: '1.5',
    paddingBottom: '1rem',
    textAlign: 'center',

    [layoutBreakpoint]: {
      fontSize: appTheme.typography.sBase,
      fontWeight: '400'
    }
  },

  footerBrand: {
    margin: '0 0 1rem',

    ':hover': {
      opacity: '.65'
    }
  },

  footerBreak: {
    display: 'block',

    [layoutBreakpoint]: {
      display: 'none'
    }
  },

  footerLink: {
    color: 'inherit',
    fontWeight: 700,

    // NOTE: Same styles for both :hover, :focus
    ':hover': {
      color: 'inherit',
      opacity: '.75'
    },
    ':focus': {
      color: 'inherit',
      opacity: '.75'
    }
  }
});

// injectGlobals(auth0Overrides);
export default withStyles(styleThunk)(Error404);
