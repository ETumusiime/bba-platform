export default function YearButtons({ years, onSelectYear }) {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onSelectYear(year)}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          {year}
        </button>
      ))}
    </div>
  );
}
