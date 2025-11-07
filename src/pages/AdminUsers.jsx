import { useState } from "react";

export default function AdminUsers() {
  const [rows] = useState([
    { id: "u1", name: "Amandamcoy", email: "amanda@example.com", credits: 0, last: "2025-11-05 12:33" },
    { id: "u2", name: "Demo User", email: "demo@example.com", credits: 14, last: "2025-11-03 08:02" },
  ]);

  return (
    <div className="px-4 pb-24">
      <h1 className="text-lg font-semibold py-3">Admin • Users</h1>
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Credits</th>
                <th className="px-3 py-2">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{r.credits}</td>
                  <td className="px-3 py-2">{r.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
