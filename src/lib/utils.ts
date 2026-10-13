export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function toIsoDate(value: string) {
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (iso) return iso[1];

  const str = /^\w{3} (\w{3}) (\d{1,2}) (\d{4})/.exec(value);
  const month = str ? MONTHS.indexOf(str[1]) : -1;
  if (str && month >= 0) {
    return `${str[3]}-${String(month + 1).padStart(2, "0")}-${str[2].padStart(2, "0")}`;
  }

  throw new Error("One of the dates is not valid.");
}
