export default function CategoryButtons({ categories, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelect(cat)}
          className="bg-blue-600 text-white py-4 px-4 rounded-lg hover:bg-blue-700 transition font-semibold shadow"
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
