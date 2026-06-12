export const getClientX = (e: MouseEvent | TouchEvent) => {
  if (e instanceof MouseEvent) {
    return e.clientX ?? 0;
  } else {
    return e.touches[0]?.clientX ?? 0;
  }
};
