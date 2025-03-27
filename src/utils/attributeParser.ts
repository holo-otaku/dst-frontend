import moment from "moment";

export const parseAttributes = (attributes: { value: string | number }[]) => {
  return attributes.map((attribute) => {
    if (typeof attribute.value === "string") {
      // Check for date format yyyy-MM-dd or yyyy/MM/dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(attribute.value)) {
        return {
          ...attribute,
          value: moment(attribute.value).format("YYYY/MM/DD"),
        };
      } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(attribute.value)) {
        return {
          ...attribute,
          value: moment(attribute.value, "YYYY/MM/DD").format("YYYY/MM/DD"),
        };
      }
      // Strict numeric check (including negative and decimal numbers)
      else if (/^-?\d+(\.\d+)?$/.test(attribute.value)) {
        return {
          ...attribute,
          value: parseFloat(attribute.value),
        };
      }
    }
    // If none of the above conditions match, return the original value
    return attribute;
  });
};
