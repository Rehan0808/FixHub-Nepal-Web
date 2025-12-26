import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold">
          Welcome to FixHub Nepal (Sprint 1)
        </h1>
      </main>
    </>
  );
}
