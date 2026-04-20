let counter = 0;

export const getCount = () => {
  counter++;
  return counter;
};

export const resetCount = (value: number = 0) => {
  counter = value;
};
