const STORAGE_KEY = "localProducts";

export const getLocalProducts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to read local products", error);
    return [];
  }
};

export const saveLocalProducts = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const getLocalProductById = (id) =>
  getLocalProducts().find((product) => Number(product.id) === Number(id));

export const getNextLocalProductId = (preferredId) => {
  const localProducts = getLocalProducts();
  const numericPreferredId = Number(preferredId);
  const preferredIdIsAvailable =
    Number.isInteger(numericPreferredId) &&
    numericPreferredId > 0 &&
    !localProducts.some(
      (product) => Number(product.id) === numericPreferredId,
    );

  if (preferredIdIsAvailable) {
    return numericPreferredId;
  }

  const highestLocalId = localProducts.reduce(
    (highestId, product) => Math.max(highestId, Number(product.id) || 0),
    0,
  );

  return Math.max(highestLocalId + 1, Date.now());
};

export const upsertLocalProduct = (product) => {
  const current = getLocalProducts();
  const index = current.findIndex((item) => Number(item.id) === Number(product.id));

  if (index >= 0) {
    current[index] = { ...current[index], ...product };
  } else {
    current.unshift(product);
  }

  saveLocalProducts(current);
  return current;
};

export const removeLocalProduct = (id) => {
  const updated = getLocalProducts().filter((item) => Number(item.id) !== Number(id));
  saveLocalProducts(updated);
  return updated;
};

export const mergeLocalProducts = (serverProducts) => {
  const localProducts = getLocalProducts();
  const merged = [...serverProducts];

  localProducts.forEach((localProduct) => {
    const foundIndex = merged.findIndex(
      (item) => Number(item.id) === Number(localProduct.id),
    );

    if (foundIndex >= 0) {
      merged[foundIndex] = { ...merged[foundIndex], ...localProduct };
    } else {
      merged.push(localProduct);
    }
  });

  return merged;
};
