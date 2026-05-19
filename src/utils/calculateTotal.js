export default function calculateTotal(
  array,
  field
) {

  return array.reduce(
    (sum, item) =>
      sum + Number(item[field]),
    0
  );

}