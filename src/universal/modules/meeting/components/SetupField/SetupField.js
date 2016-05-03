import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

// TODO: Use theme and tinycolor.mix()
const fieldLightGray = '#a7a4af';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class SetupField extends Component {
  // static propTypes = {
  //   href: PropTypes.string,
  //   icon: PropTypes.string,
  //   label: PropTypes.string
  // }

  render() {
    // const { href, icon, label } = this.props;

    return (
      <div>
        {/* Field block */}
        <div className={styles.fieldBlock}>
          <input className={combineStyles(styles.field, styles.fieldLarger)} placeholder="Team name" type="text" />
          <button className={combineStyles(styles.fieldButton, styles.fieldSubmit)}>
            <FontAwesome name="check-circle" size="2x" />
          </button>
          <div className={styles.fieldShortcutHint}>Press enter</div>
        </div>
        <br />
        <br />
        <br />
        <br />
        {/* Field block */}
        <div className={styles.fieldBlock}>
          <input className={combineStyles(styles.field, styles.fieldLarger, styles.fieldWider)} placeholder="Search users or invite by email*" type="text" />
          <button className={combineStyles(styles.fieldButton, styles.fieldSubmit)}>
            <FontAwesome name="check-circle" size="2x" />
          </button>
          <div className={styles.fieldHelpText}>*You can paste a comma-separated string of multiple emails.</div>
        </div>
        <br />
        <br />
        <br />
        <br />
        {/* Field group (with two columns) */}
        <div className={styles.fieldGroup}>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <div className={styles.fieldGroupLabel}>Invited</div>
          </div>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <div className={combineStyles(styles.fieldGroupLabel, styles.fieldGroupLabelForFields)}>Outcome</div>
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <button className={combineStyles(styles.fieldButton, styles.fieldRemoval)}>
              <FontAwesome name="times-circle" size="2x" />
            </button>
            <div className={styles.fieldLabel}>jordan@parabol.co</div>
          </div>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <input className={styles.field} placeholder="Outcome realized" type="text" value="Project iterated" />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <button className={combineStyles(styles.fieldButton, styles.fieldRemoval)}>
              <FontAwesome name="times-circle" size="2x" />
            </button>
            <div className={styles.fieldLabel}>robert@parabol.co</div>
          </div>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <input className={styles.field} placeholder="Outcome realized" type="text" value="Project iterated" />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <button className={combineStyles(styles.fieldButton, styles.fieldRemoval)}>
              <FontAwesome name="times-circle" size="2x" />
            </button>
            <div className={styles.fieldLabel}>taya@parabol.co</div>
          </div>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <input className={styles.field} placeholder="Outcome realized" type="text" value="Project iterated" />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <button className={combineStyles(styles.fieldButton, styles.fieldRemoval)}>
              <FontAwesome name="times-circle" size="2x" />
            </button>
            <div className={styles.fieldLabel}>terry@parabol.co</div>
          </div>
          <div className={combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2)}>
            <input className={styles.field} placeholder="Outcome realized" type="text" value="Project iterated" />
          </div>
        </div>
      </div>
    );
  }
}

styles = StyleSheet.create({
  fieldGroup: {
    display: 'flex',
    maxWidth: '40rem',
    width: '100%'
  },

  fieldGroupColumn: {
    margin: '0 0 1rem',
    position: 'relative',
  },

  // NOTE: Modifies fieldGroupColumn
  fieldGroupColumn1of2: {
    width: '50%'
  },

  fieldGroupLabel: {
    // TODO: Use theme etc. for color value
    color: '#4e495f',
    fontSize: theme.typography.fs2,
    fontWeight: 700,
    margin: '0 0 .5rem',
    textTransform: 'uppercase'
  },

  // NOTE: Modifies fieldGroupLabel
  fieldGroupLabelForFields: {
    paddingLeft: '.5rem'
  },

  fieldBlock: {
    margin: '0 auto',
    maxWidth: '100%',
    minWidth: '20rem',
    position: 'relative'
  },

  fieldLabel: {
    // TODO: Use theme etc. for color value
    color: '#4e495f',
    fontSize: theme.typography.fs4,
    lineHeight: 1.5
  },

  field: {
    border: 0,
    borderBottom: `1px dashed ${fieldLightGray}`,
    boxShadow: 'none',
    fontSize: theme.typography.fs4,
    fontWeight: 700,
    lineHeight: 1.5,
    margin: '0 0 .5rem',
    padding: '.125rem .5rem',
    width: '100%',

    '::selection': {
      backgroundColor: '#e6f4f4'
    },

    '::placeholder': {
      color: fieldLightGray
    },

    // NOTE: :focus, :active have same styles
    ':focus': {
      borderColor: '#84c6c7',
      borderStyle: 'solid',
      color: theme.palette.a,
      outline: 'none'
    },
    ':active': {
      borderColor: '#84c6c7',
      borderStyle: 'solid',
      color: theme.palette.a,
      outline: 'none'
    }
  },

  // NOTE: Modifies field
  fieldLarger: {
    borderBottomWidth: '2px',
    fontSize: theme.typography.fs6,
    fontWeight: 400
  },

  // NOTE: Modifies field
  fieldWider: {
    minWidth: '30rem'
  },

  fieldButton: {
    background: 'none',
    border: 0,
    // TODO: Use theme etc. for color value
    color: '#9dd2d3',
    cursor: 'pointer',
    fontSize: theme.typography.fs3,

    // NOTE: :hover, :focus, :active have the same styling
    ':hover': {
      color: theme.palette.a,
      outline: 'none'
    },
    ':focus': {
      color: theme.palette.a,
      outline: 'none'
    },
    ':active': {
      color: theme.palette.a,
      outline: 'none'
    }
  },

  // NOTE: Modifies fieldButton
  fieldRemoval: {
    padding: '0 1rem 0 0',
    position: 'absolute',
    right: '100%',
    top: '-.125rem',
  },

  // NOTE: Modifies fieldRemoval
  //       Use when hidden until parent:hover
  //       Touch devices need to show at all times (no hover state)
  //       Alternately, hide/show using only JS (no CSS, detect touchevens/no-touchevents)
  fieldRemovalHoverOnly: {
    display: 'none'
  },

  // NOTE: Modifies fieldRemoval, fieldRemovalHoverOnly
  //       When the parent item has :hover, set this to show via JS
  //       Alternately, hide/show using only JS (no CSS, detect touchevens/no-touchevents)
  fieldRemovalHasParentHover: {
    display: 'block'
  },

  // NOTE: Modifies fieldButton
  fieldSubmit: {
    left: '100%',
    padding: '0 0 0 1rem',
    position: 'absolute',
    top: '.25rem'
  },

  fieldHelpText: {
    // TODO: Use theme etc. for color value
    color: '#4e495f',
    fontSize: theme.typography.fs3,
    fontStyle: 'italic',
    fontWeight: 700
  },

  fieldShortcutHint: {
    color: theme.palette.b,
    fontSize: theme.typography.fs3,
    fontStyle: 'italic',
    fontWeight: 700,
    textAlign: 'right'
  }
});
