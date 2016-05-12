import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';
import IconButton from '../../components/IconButton/IconButton';
import SetupField from '../../components/SetupField/SetupField';

const combineStyles = StyleSheet.combineStyles;

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
                <div className={styles.fieldRemovalBlock}>
                  <IconButton iconName="times-circle" iconSize="2x" />
                </div>
                <div className={styles.fieldLabel}>
                  {field.label}
                </div>
              </div>
              <div className={columnStyles}>
                <SetupField {...field.input} />
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

  fieldLabel: {
    color: theme.palette.c,
    fontSize: theme.typography.fs4,
    lineHeight: 1.5
  },

  fieldRemovalBlock: {
    padding: '0 1rem 0 0',
    position: 'absolute',
    right: '100%',
    top: '-.125rem',
  },
});
