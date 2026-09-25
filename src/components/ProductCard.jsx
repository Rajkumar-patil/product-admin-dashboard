function ProductCard({ product, onDelete, onEdit, onView }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="h-40 w-full rounded object-cover"
      />
      <div className="mt-3 space-y-2">
        <h3 className="font-semibold text-gray-900">{product.title}</h3>
        <p className="text-sm text-gray-600">Category: {product.category}</p>
        <p className="text-sm text-gray-600">Price: ${product.price}</p>
        <p className="text-sm text-gray-600">Rating: {product.rating}</p>
        <p className="text-sm text-gray-600">Stock: {product.stock}</p>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => onView(product.id)}
            className="flex-1 rounded bg-blue-500 px-3 py-2 text-sm font-medium text-white"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onEdit(product.id)}
            className="flex-1 rounded bg-yellow-500 px-3 py-2 text-sm font-medium text-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="flex-1 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
