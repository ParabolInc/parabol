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
    const columnLeftStyles = combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumnLeft);
    const columnRightStyles = combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumnRight);
    const fieldLabelStyles = combineStyles(styles.fieldGroupLabel, styles.fieldGroupLabelForFields);

    return (
      <div className={styles.fieldGroup}>

        {/* Field group (with two columns) */}

        <div className={styles.fieldGroupRow}>
          <div className={columnLeftStyles}>
            <div className={styles.fieldGroupLabel}>
              {contentLabel}
            </div>
          </div>
          <div className={columnRightStyles}>
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
              onMouseEnter={() => field.row.onMouseEnter(index)}
              onMouseLeave={() => field.row.onMouseLeave(index)}
            >
              <div className={columnLeftStyles}>
                <div className={styles.fieldRemovalBlock}>
                  {(field.row.rowWithHover === index) &&
                    <IconButton
                      iconName="times-circle"
                      iconSize="2x"
                      onClick={field.button.onClick}
                      title={field.button.title}
                    />
                  }
                </div>
                <div className={styles.fieldLabel}>
                  {field.label}
                </div>
              </div>
              <div className={columnRightStyles}>
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
  fieldGroup: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%'
  },

  fieldGroupRow: {
    display: 'flex',
    maxWidth: '100%',
    paddingLeft: '3.5rem',
    paddingRight: '3.5rem',
    width: '47.5rem'
  },

  fieldGroupColumn: {
    margin: '0 0 1rem',
    position: 'relative',
  },

  // NOTE: Modifies fieldGroupColumn
  fieldGroupColumnLeft: {
    width: '40%'
  },
  fieldGroupColumnRight: {
    width: '60%'
  },

  fieldGroupLabel: {
    color: theme.palette.dark,
    fontSize: theme.typography.s2,
    fontWeight: 700,
    margin: '0 0 .5rem',
    textTransform: 'uppercase'
  },

  // NOTE: Modifies fieldGroupLabel
  fieldGroupLabelForFields: {
    paddingLeft: '.5rem'
  },

  fieldLabel: {
    color: theme.palette.dark,
    fontSize: theme.typography.s4,
    lineHeight: 1.5,
    overflow: 'hidden',
    padding: '.125rem 1rem .125rem 0',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%'
  },

  fieldRemovalBlock: {
    padding: '0 1rem 0 0',
    position: 'absolute',
    right: '100%',
    top: '.125rem'
  },
});
