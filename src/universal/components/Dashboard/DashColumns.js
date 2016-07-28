import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';

const borderColor = 'rgba(0, 0, 0, .1)';
let styles = {};

const DashColumns = () =>
  <div className={styles.root}>
    <div className={styles.columns}>
      <div className={styles.columnFirst}>
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
      <div className={styles.column}>
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

styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${borderColor}`,
    margin: '1rem 0',
    width: '100%'
  },

  columns: {
    display: 'flex !important',
    maxWidth: '80rem'
  },

  columnFirst: {
    flex: 1,
    padding: '1rem 1rem 0 0'
  },

  column: {
    borderLeft: `1px solid ${borderColor}`,
    flex: 1,
    padding: '1rem 1rem 0'
  },

  columnHeading: {
    color: theme.palette.dark,
    fontWeight: 700,
    margin: '0 0 1rem'
  },

  cardBlock: {
    marginBottom: '1rem',
    minWidth: '15rem',
    width: '100%'
  }
});

export default look(DashColumns);
