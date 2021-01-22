/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    CREATE TABLE audit (id int, name text);
  `)
};

exports.down = pgm => {
  pgm.sql(`
    DROP TABLE audit;
  `)
};

