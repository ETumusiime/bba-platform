export const metadata = {
  title: "BBA Shop",
};

export default function ShopLayout({ children }) {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {children}
    </main>
  );
}
