import moment from "moment";

export const parseAttributes = (
  attributes: { fieldId: number; value: string | number | boolean }[]
) => {
  return attributes.map(({ fieldId, value }) => {
    if (typeof value === "string") {
      // Check for date format yyyy-MM-dd or yyyy/MM/dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return {
          fieldId,
          value: moment(value).format("YYYY/MM/DD"),
        };
      }
    }
    // If none of the above conditions match, return the original value
    return { fieldId, value };
  });
};
