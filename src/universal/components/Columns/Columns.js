import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';

const borderColor = 'rgba(0, 0, 0, .1)';
let styles = {};

const Columns = () =>
  <div className={styles.root}>
    <div className={styles.columns}>
      <div className={styles.columnFirst}>
        <div className={styles.columnHeading}>Done</div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="done" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="done" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="done" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="done" />
        </div>
      </div>
      <div className={styles.column}>
        <div className={styles.columnHeading}>Active</div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="active" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="active" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="active" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="active" />
        </div>
      </div>
      <div className={styles.column}>
        <div className={styles.columnHeading}>Stuck</div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="stuck" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="stuck" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="stuck" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="stuck" />
        </div>
      </div>
      <div className={styles.columnLast}>
        <div className={styles.columnHeading}>Future</div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="future" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="future" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="future" />
        </div>
        <div className={styles.cardBlock}>
          <OutcomeCard status="future" />
        </div>
      </div>
    </div>
  </div>;

const columnStyles = {
  flex: 1,
  width: '25%'
};

styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${borderColor}`,
    margin: '1rem 0',
    width: '100%'
  },

  columns: {
    display: 'flex !important',
    maxWidth: '80rem',
    width: '100%'
  },

  columnFirst: {
    ...columnStyles,
    padding: '1rem 1rem 0 0'
  },

  column: {
    ...columnStyles,
    borderLeft: `1px solid ${borderColor}`,
    padding: '1rem 1rem 0'
  },

  columnLast: {
    ...columnStyles,
    borderLeft: `1px solid ${borderColor}`,
    padding: '1rem 0 0 1rem',
  },

  columnHeading: {
    color: theme.palette.dark,
    fontWeight: 700,
    margin: '0 0 1rem'
  },

  cardBlock: {
    marginBottom: '1rem',
    width: '100%'
  }
});

export default look(Columns);
