/**
 * Edits the name of a reflection group.
 *
 * @flow
 */
import React from 'react';
import {css} from 'react-emotion';
import {Field, reduxForm} from 'redux-form';

import InputField from 'universal/components/InputField/InputField';
import shouldValidate from 'universal/validation/shouldValidate';

type formValues = {
  title: ?string
};

type Props = {
  form: string,
  handleSubmit: (formValues) => any,
  onSubmit:(formValues) => any,
  title: ?string
};

const TITLE_FIELD_NAME = 'title';

const ReflectionGroupTitleEditor = ({handleSubmit, title}: Props) => (
  <form onSubmit={handleSubmit}>
    <Field
      className={css({backgroundColor: 'inherit'})}
      component={InputField}
      fieldSize="small"
      name={TITLE_FIELD_NAME}
      placeholder="Group theme..."
      type="text"
      underline
      value={title}
    />
  </form>
);

const validate = (values: formValues) => {
  const errors: Object = {};
  const cleanedTitle = (values[TITLE_FIELD_NAME] || '').trim();
  if (!cleanedTitle) {
    errors[TITLE_FIELD_NAME] = '(Enter a title!)';
  }
  return errors;
};

export default reduxForm({
  shouldValidate,
  validate
})(ReflectionGroupTitleEditor);
