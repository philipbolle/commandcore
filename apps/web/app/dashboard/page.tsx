import { getServerSession } from "../../utils/getServerSession";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession();
  const userEmail = session?.user?.email || "";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col py-8 px-4">
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard" className="text-lg font-semibold text-white hover:text-blue-400">Agents</Link>
          <Link href="/dashboard/logs" className="text-lg font-semibold text-white hover:text-blue-400">Logs</Link>
          <Link href="/dashboard/settings" className="text-lg font-semibold text-white hover:text-blue-400">Settings</Link>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {userEmail}</h2>
          <p className="text-gray-400">This is your CommandCore dashboard.</p>
        </div>
        {/* Deploy Agent Button */}
        <div className="mb-6">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">Deploy Agent</button>
        </div>
        {/* Deployed Agents Table */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Deployed Agents</h3>
          <table className="min-w-full bg-black border border-gray-800 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b border-gray-700 text-left">Agent Name</th>
                <th className="px-4 py-2 border-b border-gray-700 text-left">Status</th>
                <th className="px-4 py-2 border-b border-gray-700 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state for now */}
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No agents deployed yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 