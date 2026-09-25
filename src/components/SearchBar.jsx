function SearchBar({ value, onChange, placeholder = "Search products" }) {
  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-black"
      />
    </div>
  );
}

export default SearchBar;
