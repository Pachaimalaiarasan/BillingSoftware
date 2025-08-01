import React, { useEffect, useState } from "react";
import axios from "axios";

// Load from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SUPPLY_UPDATES_ENDPOINT = import.meta.env.VITE_API_SUPPLY_UPDATES;

const SupplyProductsList = () => {
  const [supplyData, setSupplyData] = useState([]);

  useEffect(() => {
    fetchSupplyUpdates();
  }, []);

  const fetchSupplyUpdates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${SUPPLY_UPDATES_ENDPOINT}`);
      setSupplyData(res.data.reverse());
    } catch (err) {
      console.error("Failed to fetch supply updates:", err);
    }
  };

  return (
    <section className="w-full min-h-screen bg-yellow-100 p-4">
      <section className="max-w-6xl mx-auto">
        <section className="text-3xl font-bold text-black mb-6 border-b-4 border-black pb-2">
          Supply Updates
        </section>

        <section className="overflow-x-auto bg-white rounded-xl shadow border border-black">
          <table className="min-w-full table-auto text-black text-sm sm:text-base">
            <thead className="bg-yellow-300 text-black uppercase text-left">
              <tr>
                {[
                  "ID",
                  "Product ID",
                  "Product Name",
                  "Supplier ID",
                  "Supplied Quantity",
                  "Supply Date",
                  "Product Price",
                  "Total Price",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 border border-black">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {supplyData.length > 0 ? (
                supplyData.map((item) => (
                  <tr
                    key={item.id}
                    className="odd:bg-yellow-50 even:bg-white hover:bg-yellow-200 transition"
                  >
                    <td className="px-4 py-2 border border-black">{item.id}</td>
                    <td className="px-4 py-2 border border-black">{item.Pro_id}</td>
                    <td className="px-4 py-2 border border-black">{item.Pro_name}</td>
                    <td className="px-4 py-2 border border-black">{item.Sp_id}</td>
                    <td className="px-4 py-2 border border-black">{item.Supplied_quantity}</td>
                    <td className="px-4 py-2 border border-black">
                      {new Date(item.sp_date).toISOString().split("T")[0]}
                    </td>
                    <td className="px-4 py-2 border border-black">{item.Pro_price}</td>
                    <td className="px-4 py-2 border border-black">{item.Pro_totalprice}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center px-4 py-4 border border-black">
                    No supply updates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </section>
    </section>
  );
};

export default SupplyProductsList;
