import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Top profile header */}
        <div className="rounded-t-2xl bg-red-500 text-white px-6 py-5">
          <h1 className="text-xl font-semibold">My Profile</h1>
          <p className="text-sm opacity-90">Manage your account</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-b-2xl shadow mb-6 px-6 py-6">
          <div className="flex items-start gap-4">
            {/* Avatar circle */}
            <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-lg">
              R
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-black">Rehan Pradhan</h2>
              <p className="text-sm text-gray-500">Member since 2024</p>

              <div className="mt-4 border-t border-gray-200 pt-4 space-y-3 text-sm">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <span className="text-red-500">📞</span>
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <p className="text-gray-600">+977 98-XXXX-5678</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <span className="text-red-500">✉️</span>
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <p className="text-gray-600">rehan@example.com</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <span className="text-red-500">📍</span>
                  <div>
                    <p className="font-medium text-gray-700">Address</p>
                    <p className="text-gray-600">Kathmandu, Nepal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="bg-white rounded-2xl shadow px-6 py-5">
          <h3 className="text-base font-semibold mb-4">Your Stats</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Total Services */}
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
              <p className="text-2xl font-semibold text-gray-800">12</p>
              <p className="text-xs text-gray-500 mt-1">Total Services</p>
            </div>

            {/* Completed */}
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
              <p className="text-2xl font-semibold text-gray-800">11</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>

            {/* Avg Rating */}
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
              <p className="text-2xl font-semibold text-gray-800">
                4.8<span className="ml-1 text-yellow-400">★</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
