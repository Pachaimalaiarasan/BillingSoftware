import React, { useState, useEffect } from "react";
import Swal from "sweetalert2"; // <-- import here
// import 'sweetalert2/dist/sweetalert2.min.css';  // Add in your index.js or main.js if needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_SHOW_URL = import.meta.env.VITE_API_ADMIN_SHOW;
const ADMIN_UPDATE_URL = import.meta.env.VITE_API_ADMIN_RESET_NAME;
const API_ADMIN_RESET_PASSWORD = import.meta.env.VITE_API_ADMIN_RESET_PASSWORD;

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "Unknown Error");
  }
  return data;
}

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [editAdmin, setEditAdmin] = useState(null);
  const [form, setForm] = useState({ username: "", newPassword: "" });
  const [showPwdPopup, setShowPwdPopup] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false); // <-- for "New password"
  const [showCurrentPwd, setShowCurrentPwd] = useState(false); // <-- for confirmation popup
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const results = await fetchJSON(`${API_BASE_URL}${ADMIN_SHOW_URL}`);
      setAdmins(results);
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Failed to Load Admins",
        text: e.message,
        confirmButtonColor: "#facc15",
      });
    }
    setLoading(false);
  }

  function openEditModal(admin) {
    setEditAdmin(admin);
    setForm({ username: admin.username, newPassword: "" });
    setShowPwd(false);
    setShowCurrentPwd(false);
  }

  function closeEditModal() {
    setEditAdmin(null);
    setForm({ username: "", newPassword: "" });
    setShowPwdPopup(false);
    setCurrentPwd("");
  }

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSave() {
    if (form.newPassword) {
      setShowPwdPopup(true);
    } else {
      updateUsernameOnly();
    }
  }

  async function updateUsernameOnly() {
    try {
      await fetchJSON(`${API_BASE_URL}${ADMIN_UPDATE_URL}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUsername: editAdmin.username,
          username: form.username,
        }),
      });
      await fetchAdmins();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Username updated!",
        confirmButtonColor: "#facc15",
      });
      closeEditModal();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Failed to Update Username",
        text: e.message,
        confirmButtonColor: "#facc15",
      });
    }
  }

  async function handlePwdConfirm() {
    try {
      await fetchJSON(`${API_BASE_URL}${API_ADMIN_RESET_PASSWORD}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editAdmin.username,
          currentPassword: currentPwd,
          newPassword: form.newPassword,
        }),
      });
      if (form.username !== editAdmin.username) {
        await updateUsernameOnly();
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password updated!",
          confirmButtonColor: "#facc15",
        });
        await fetchAdmins();
        closeEditModal();
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Failed to Update Password",
        text: e.message,
        confirmButtonColor: "#facc15",
      });
    }
  }

  return (
    <div className="bg-white min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-6 text-black">Admin Users</h2>
      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full text-left bg-white rounded border border-black">
          <thead>
            <tr className="bg-yellow-400 text-black whitespace-nowrap">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr
                key={admin.admin_id}
                className="hover:bg-yellow-100 transition-colors border border-black"
              >
                <td className="px-4 py-2">{admin.admin_id}</td>
                <td className="px-4 py-2">{admin.username}</td>
                <td className="px-4 py-2">{admin.email}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => openEditModal(admin)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded shadow"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-black">
                  {loading ? "Loading..." : "No admins found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editAdmin && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl border-2 border-yellow-400 relative">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-400 w-8 h-8 flex items-center justify-center rounded-full mr-2">
                <svg viewBox="0 0 24 24" width={20} height={20} className="text-black"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <span className="text-xl text-black font-bold">Edit Admin</span>
            </div>
            <label className="block mb-2 text-black font-semibold">
              Username
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleFormChange}
                className="block w-full mt-1 border rounded px-3 py-2 focus:border-yellow-400"
              />
            </label>
            <label className="block mb-4 text-black font-semibold">
              Email
              <input
                type="text"
                value={editAdmin.email}
                disabled
                className="block w-full mt-1 border rounded px-3 py-2 bg-gray-100 text-gray-600"
              />
            </label>
            <label className="block mb-4 text-black font-semibold relative">
              New Password
              <input
                type={showPwd ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleFormChange}
                className="block w-full mt-1 border rounded px-3 py-2 focus:border-yellow-400 pr-10"
                placeholder="Leave blank to keep unchanged"
              />
              <button
                type="button"
                className="absolute top-[35px] right-3"
                onClick={() => setShowPwd((v) => !v)}
                tabIndex={-1}
              >
                {showPwd ? (
                  // Eye OFF
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a11.382 11.382 0 013.654-5.447"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18"/>
                  </svg>
                ) : (
                  // Eye ON
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.364 1.215-.938 2.36-1.682 3.396"/>
                  </svg>
                )}
              </button>
            </label>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded"
                onClick={closeEditModal}
              >
                Cancel
              </button>
            </div>
          </div>
          {/* Password confirmation dialog */}
          {showPwdPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 shadow-2xl border-2 border-yellow-400 max-w-xs w-full">
                <div className="mb-2 text-black font-semibold">
                  Please enter current password:
                </div>
                <div className="relative mb-4">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    className="border w-full px-2 py-1 rounded focus:border-yellow-400 pr-10"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute top-1.5 right-2"
                    onClick={() => setShowCurrentPwd((v) => !v)}
                    tabIndex={-1}
                  >
                    {showCurrentPwd ? (
                      // Eye OFF
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a11.382 11.382 0 013.654-5.447"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18"/>
                      </svg>
                    ) : (
                      // Eye ON
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.364 1.215-.938 2.36-1.682 3.396"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handlePwdConfirm}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1 rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      setShowPwdPopup(false);
                      setCurrentPwd("");
                    }}
                    className="bg-black text-white hover:bg-gray-800 px-4 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
