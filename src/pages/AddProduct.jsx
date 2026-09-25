import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../api/productApi";
import {
  getNextLocalProductId,
  upsertLocalProduct,
} from "../utils/productStorage";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  thumbnail: "",
};

function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.description.trim())
      nextErrors.description = "Description is required";
    if (!form.category.trim()) nextErrors.category = "Category is required";
    if (!form.thumbnail.trim())
      nextErrors.thumbnail = "Thumbnail URL is required";
    if (!form.price || Number(form.price) <= 0)
      nextErrors.price = "Price must be greater than 0";
    if (!form.stock || Number(form.stock) < 0)
      nextErrors.stock = "Stock cannot be negative";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;
    if (loading) return;

    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      const created = await addProduct(payload);
      const finalProduct = {
        ...created,
        id: getNextLocalProductId(created.id),
        thumbnail: created.thumbnail || form.thumbnail,
        images: created.images || [created.thumbnail || form.thumbnail],
      };

      upsertLocalProduct(finalProduct);
      navigate("/products");
    } catch (submitError) {
      setErrors({
        submit:
          submitError?.response?.data?.message || "Unable to add product.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Add Product</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            rows="4"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Stock
            </label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Thumbnail URL
          </label>
          <input
            name="thumbnail"
            value={form.thumbnail}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {errors.thumbnail && (
            <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
          )}
        </div>

        {errors.submit && (
          <p className="text-sm text-red-600">{errors.submit}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
