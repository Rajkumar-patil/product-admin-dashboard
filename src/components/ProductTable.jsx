function ProductTable({ products, onDelete, onEdit, onView }) {
  if (!products.length) {
    return <p className="py-6 text-center text-gray-500">No products found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3">Stock</th>
            <th className="min-w-[170px] whitespace-nowrap px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-gray-200">
              <td className="px-4 py-3">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-12 w-12 rounded object-cover"
                />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {product.title}
              </td>
              <td className="px-4 py-3">{product.category}</td>
              <td className="px-4 py-3">${product.price}</td>
              <td className="px-4 py-3">{product.rating}</td>
              <td className="px-4 py-3">{product.stock}</td>
              <td className="min-w-[170px] whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onView(product.id)}
                    className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(product.id)}
                    className="rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product.id)}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;
