import api from './axios';
import {
  getLocalProductById,
  removeLocalProduct,
} from '../utils/productStorage';

const sortProducts = (products, sortValue) => {
  if (!sortValue || sortValue === 'none') {
    return [...products];
  }

  const sorted = [...products];
  const [field, direction] = sortValue.split('-');

  sorted.sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return direction === 'asc' ? comparison : -comparison;
    }

    const numericComparison = Number(aValue) - Number(bValue);
    return direction === 'asc' ? numericComparison : -numericComparison;
  });

  return sorted;
};

export const getProducts = async ({ limit = 10, skip = 0, search = '', category = '', sort = '' } = {}) => {
  let response;

  if (search) {
    response = await api.get('/products/search', {
      params: { q: search, limit, skip },
    });
  } else if (category) {
    response = await api.get(`/products/category/${encodeURIComponent(category)}`, {
      params: { limit, skip },
    });
  } else {
    response = await api.get('/products', {
      params: { limit, skip },
    });
  }

  const products = sortProducts(response.data.products || [], sort);

  return {
    products,
    total: response.data.total || products.length,
  };
};

export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

export const getProductById = async (id) => {
  const localProduct = getLocalProductById(id);
  if (localProduct) {
    return localProduct;
  }

  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const addProduct = async (productData) => {
  const response = await api.post('/products/add', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const localProduct = getLocalProductById(id);
  if (localProduct) {
    return { ...localProduct, ...productData, id: Number(id) };
  }

  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  if (getLocalProductById(id)) {
    removeLocalProduct(id);
    return { id: Number(id) };
  }

  const response = await api.delete(`/products/${id}`);
  return response.data;
};
