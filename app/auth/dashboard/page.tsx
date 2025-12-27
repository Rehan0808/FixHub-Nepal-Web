export default function DashboardPage() {
  return (
    <>
      <div className="min-h-screen p-10 bg-gray-100 text-black">
        <h1 className="text-3xl font-semibold mb-6">User Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Total Requests</p>
            <h2 className="text-2xl font-bold">12</h2>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Completed</p>
            <h2 className="text-2xl font-bold">8</h2>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Pending</p>
            <h2 className="text-2xl font-bold">4</h2>
          </div>
        </div>
      </div>
    </>
  );
}
