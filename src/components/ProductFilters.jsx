function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  sortValue,
  onSortChange,
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <select
        value={selectedCategory}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="rounded border border-gray-300 px-3 py-2"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>

      <select
        value={sortValue}
        onChange={(event) => onSortChange(event.target.value)}
        className="rounded border border-gray-300 px-3 py-2"
      >
        <option value="">Default</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-asc">Rating: Low to High</option>
        <option value="rating-desc">Rating: High to Low</option>
        <option value="title-asc">Title: A to Z</option>
        <option value="title-desc">Title: Z to A</option>
      </select>
    </div>
  );
}

export default ProductFilters;
