export const getClientX = (e: MouseEvent | TouchEvent) => {
  if (e instanceof MouseEvent) {
    return e.clientX;
  } else {
    return e.touches[0]?.clientX;
  }
};
