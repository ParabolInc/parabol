import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';
import IconButton from '../../components/IconButton/IconButton';
import SetupField from '../../components/SetupField/SetupField';

const combineStyles = StyleSheet.combineStyles;
const fieldLightGray = tinycolor.mix(theme.palette.c, '#fff', 50).toHexString();

let styles = {};

// NOTE: Just a single place to port all of the field markup and styles.
//       Breaking these into smaller, reusable components. (TA)

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class SetupFieldGroup extends Component {
  static propTypes = {
    contentLabel: PropTypes.string,
    fields: PropTypes.array,
    fieldLabel: PropTypes.string
  }

  render() {
    const { contentLabel, fields, fieldLabel } = this.props;
    const columnStyles = combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumn1of2);
    const fieldLabelStyles = combineStyles(styles.fieldGroupLabel, styles.fieldGroupLabelForFields);

    const handleMouseOut = () => {
      console.log('SetupFieldGroupRow.onMouseOut.handleMouseOut()');
      // TODO: Dispatch UI state for hover to hide/show removal button
    };

    const handleMouseOver = () => {
      console.log('SetupFieldGroupRow.onMouseOver.handleMouseOver()');
      // TODO: Dispatch UI state for hover to hide/show removal button
    };

    return (
      <div className={styles.fieldGroup}>

        {/* Field group (with two columns) */}

        <div className={styles.fieldGroupRow}>
          <div className={columnStyles}>
            <div className={styles.fieldGroupLabel}>
              {contentLabel}
            </div>
          </div>
          <div className={columnStyles}>
            <div className={fieldLabelStyles}>
              {fieldLabel}
            </div>
          </div>
        </div>
        {
          fields.map((field, index) =>
            <div
              className={styles.fieldGroupRow}
              key={index}
              onMouseOut={handleMouseOut}
              onMouseOver={handleMouseOver}
            >
              <div className={columnStyles}>
                <div className={styles.fieldRemoval}>
                  <IconButton iconName="times-circle" iconSize="2x" />
                </div>
                <div className={styles.fieldLabel}>
                  {field.label}
                </div>
              </div>
              <div className={columnStyles}>
                <SetupField {...field} />
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

styles = StyleSheet.create({
  // NOTE: fieldGroup can be discarded
  //       once the field elements are properly
  //       abstracted as components (TA)
  fieldGroup: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%'
  },

  fieldGroupRow: {
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
    color: theme.palette.c,
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
    color: theme.palette.c,
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
    color: theme.palette.tuColorA40o.color,
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
  //       Alternately, hide/show using only JS (no CSS, detect touchevents/no-touchevents)
  fieldRemovalHoverOnly: {
    display: 'none'
  },

  // NOTE: Modifies fieldRemoval, fieldRemovalHoverOnly
  //       When the parent item has :hover, set this to show via JS
  //       Alternately, hide/show using only JS (no CSS, detect touchevents/no-touchevents)
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
    color: theme.palette.c,
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
