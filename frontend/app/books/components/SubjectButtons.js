export default function SubjectButtons({ subjects, onSelectSubject }) {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {subjects.map((subject) => (
        <button
          key={subject}
          onClick={() => onSelectSubject(subject)}
          className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
        >
          {subject}
        </button>
      ))}
    </div>
  );
}
