import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import { getProductById } from "../api/productApi";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProductById(id);
        if (!isMounted) return;
        setProduct(data);
      } catch (fetchError) {
        if (!isMounted) return;
        setProduct(null);
        setError(
          fetchError?.response?.status === 404
            ? "Product Not Found"
            : "Failed to load product details.",
        );
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
  }, [id, retryCount]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <ErrorMessage
          message={error}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <button
        type="button"
        onClick={() => navigate("/products")}
        className="mb-6 rounded border border-gray-300 px-3 py-2 text-sm"
      >
        Back to Products
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-80 w-full rounded object-cover"
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(product.images || []).slice(0, 3).map((image, index) => (
              <img
                key={`${product.id}-${index}`}
                src={image}
                alt={`${product.title} ${index + 1}`}
                className="h-24 w-full rounded object-cover"
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {product.title}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            ${product.price}
          </p>
          <p className="mt-3 text-gray-600">{product.description}</p>
          <div className="mt-5 flex gap-6 text-sm text-gray-600">
            <span>Rating: {product.rating}</span>
            <span>Stock: {product.stock}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={`${review.reviewerName}-${review.date}`}
                className="rounded bg-gray-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <strong>{review.reviewerName}</strong>
                  <span className="text-sm text-gray-500">
                    {review.rating}/5
                  </span>
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews available.</p>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
