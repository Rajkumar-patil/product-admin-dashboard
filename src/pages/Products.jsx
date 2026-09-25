import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteProduct, getCategories, getProducts } from "../api/productApi";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import ProductTable from "../components/ProductTable";
import SearchBar from "../components/SearchBar";
import {
  mergeLocalProducts,
  removeLocalProduct,
} from "../utils/productStorage";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const VALID_SORTS = new Set([
  "",
  "price-asc",
  "price-desc",
  "rating-asc",
  "rating-desc",
  "title-asc",
  "title-desc",
]);

const parsePage = (value, fallback = 1) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestIdRef = useRef(0);
  const isInitialSearchEffectRef = useRef(true);

  const page = parsePage(searchParams.get("page"), 1);
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialSort = VALID_SORTS.has(searchParams.get("sort"))
    ? searchParams.get("sort") || ""
    : "";

  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const syncUrl = useCallback(
    (nextPage, nextSearch, nextCategory, nextSort) => {
      const params = new URLSearchParams();

      params.set("page", String(nextPage));
      if (nextSearch) params.set("search", nextSearch);
      if (nextCategory) params.set("category", nextCategory);
      if (nextSort) params.set("sort", nextSort);

      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (isInitialSearchEffectRef.current) {
      isInitialSearchEffectRef.current = false;
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      const nextSearch = searchInput.trim();
      if (nextSearch === search) {
        return;
      }

      setSearch(nextSearch);
      syncUrl(1, nextSearch, category, sort);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput, search, category, sort, syncUrl]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const normalizedCategories = Array.isArray(data)
          ? data.map((category) => ({
              value: category?.slug || "",
              label: category?.name || category?.slug || "",
            }))
          : [];

        setCategories(
          normalizedCategories.filter((category) => category.value),
        );
      } catch (categoryError) {
        console.error("Unable to load categories", categoryError);
      }
    };

    fetchCategories();
  }, []);

  const effectivePage = Math.min(page, totalPages || 1);

  useEffect(() => {
    let isActive = true;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const timer = setTimeout(() => {
      setLoading(true);
      setError("");

      const fetchProducts = async () => {
        try {
          const response = await getProducts({
            limit: pageSize,
            skip: (page - 1) * pageSize,
            search,
            category,
            sort,
          });

          if (!isActive || requestId !== requestIdRef.current) {
            return;
          }

          const mergedProducts = mergeLocalProducts(response.products || []);
          setProducts(mergedProducts);
          setTotal(response.total || mergedProducts.length || 0);

          const nextTotalPages = Math.max(
            1,
            Math.ceil(
              (response.total || mergedProducts.length || 0) / pageSize,
            ),
          );
          if (page > nextTotalPages) {
            syncUrl(nextTotalPages, search, category, sort);
          }
        } catch (loadError) {
          if (!isActive || requestId !== requestIdRef.current) {
            return;
          }

          setProducts([]);
          setError(
            loadError?.response?.data?.message || "Failed to load products.",
          );
        } finally {
          if (isActive && requestId === requestIdRef.current) {
            setLoading(false);
          }
        }
      };

      fetchProducts();
    }, 0);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [page, pageSize, search, category, sort, syncUrl, retryCount]);

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(1, Number(nextPage) || 1), totalPages);
    syncUrl(safePage, search, category, sort);
  };

  const handlePageSizeChange = (nextSize) => {
    const safeSize = PAGE_SIZE_OPTIONS.includes(nextSize) ? nextSize : 10;
    setPageSize(safeSize);
    syncUrl(1, search, category, sort);
  };

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    syncUrl(1, search, nextCategory, sort);
  };

  const handleSortChange = (nextSort) => {
    setSort(nextSort);
    syncUrl(1, search, category, nextSort);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );
    if (!confirmed || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteProduct(id);
      removeLocalProduct(id);
      const remainingProducts = products.filter(
        (product) => Number(product.id) !== Number(id),
      );
      setProducts(remainingProducts);
      setTotal((count) => Math.max(0, count - 1));

      if (remainingProducts.length === 0 && page > 1) {
        const nextPage = Math.max(1, page - 1);
        syncUrl(nextPage, search, category, sort);
      }
    } catch (deleteError) {
      setError(
        deleteError?.response?.data?.message || "Unable to delete product.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/products/add")}
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Add Product
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-5 rounded bg-white p-4 shadow-sm">
          <div className="mb-4">
            <SearchBar value={searchInput} onChange={setSearchInput} />
          </div>
          <ProductFilters
            categories={categories}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            sortValue={sort}
            onSortChange={handleSortChange}
          />
        </div>

        {loading && <Loader />}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={() => setRetryCount((current) => current + 1)}
          />
        )}

        {!loading && !error && (
          <>
            <div className="hidden md:block">
              <ProductTable
                products={products}
                onDelete={handleDelete}
                onEdit={(id) => navigate(`/products/edit/${id}`)}
                onView={(id) => navigate(`/products/${id}`)}
              />
            </div>

            <div className="grid gap-4 md:hidden">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={handleDelete}
                    onEdit={(id) => navigate(`/products/edit/${id}`)}
                    onView={(id) => navigate(`/products/${id}`)}
                  />
                ))
              ) : (
                <p className="rounded border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
                  No products found.
                </p>
              )}
            </div>

            <div className="mt-4">
              <Pagination
                currentPage={effectivePage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                totalItems={total}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Products;
