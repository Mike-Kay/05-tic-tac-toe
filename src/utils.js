export const getElement = (selection) => {
  const element = document.querySelector(selection);
  if (element) return element;
  throw new Error(
    `Pls check the "${selection}" selector, no such element exist`
  );
};

export const getLocalStorage = (item) => {
  const storageItem = localStorage.getItem(item)
    ? JSON.parse(localStorage.getItem(item))
    : {};
  return storageItem;
};

export const setStorageItem = (name, item) => {
  localStorage.setItem(name, JSON.stringify(item));
};
