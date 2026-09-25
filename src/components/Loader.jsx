function Loader({ message = "Loading..." }) {
  return (
    <div className="flex justify-center items-center py-10 text-gray-600">
      <div className="inline-flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
        <span>{message}</span>
      </div>
    </div>
  );
}

export default Loader;
