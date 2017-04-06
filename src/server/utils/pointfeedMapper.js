export default function (row, requestedFields) {
  return {
    new_val: row('new_val').default({}).pluck(requestedFields),
    old_val: row('old_val').default({}).pluck(requestedFields)
  };
}
