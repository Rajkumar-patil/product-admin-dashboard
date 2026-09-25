import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../api/productApi";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { upsertLocalProduct } from "../utils/productStorage";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  thumbnail: "",
};

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        if (!isMounted) return;
        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price ?? "",
          category: data.category || "",
          stock: data.stock ?? "",
          thumbnail: data.thumbnail || "",
        });
      } catch (fetchError) {
        if (!isMounted) return;
        setErrors({
          submit:
            fetchError?.response?.status === 404
              ? "Product Not Found"
              : "Failed to load product.",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      const updated = await updateProduct(id, payload);
      upsertLocalProduct({ ...updated, id: Number(updated.id || id) });
      navigate("/products");
    } catch (submitError) {
      setErrors({
        submit:
          submitError?.response?.data?.message || "Unable to update product.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (errors.submit && errors.submit === "Product Not Found") {
    return <div className="p-6 text-2xl font-bold">Product Not Found</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Edit Product</h1>

      {errors.submit && (
        <ErrorMessage
          message={errors.submit}
          onRetry={() => navigate("/products")}
        />
      )}

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

        {errors.submit && errors.submit !== "Product Not Found" && (
          <p className="text-sm text-red-600">{errors.submit}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
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

export default EditProduct;
