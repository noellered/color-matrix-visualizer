export const isValidMatrix = (matrixString: string) => {
  const cleanedString = matrixString
    .replace(/\[|\]/g, "")
    .replace(/\s+/g, "")
    .trim();

  const regex = /^([-+]?\d*\.?\d+)(,[-+]?\d*\.?\d+)*$/;
  if (!regex.test(cleanedString)) {
    console.log(cleanedString, "FAILED: Regex check");
    return false;
  }

  const values = cleanedString.split(",");

  if (values.length !== 20) {
    console.log("Matrix does not have exactly 20 values.");
    return false;
  }

  for (let value of values) {
    if (isNaN(parseFloat(value))) {
      console.log(`${value} is not a valid number.`);
      return false;
    }
  }

  return true;
};

export const convertMatrixStringToArray = (matrixString: string): number[] => {
  const cleanedString = matrixString
    .replace(/\[|\]/g, "")
    .replace(/\s+/g, "")
    .trim();

  const stringArray = cleanedString.split(",");
  const numberArray = stringArray.map((value) => parseFloat(value.trim()));
  return numberArray;
};
