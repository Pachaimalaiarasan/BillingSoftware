import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Access environment variables directly
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT_BILLS = import.meta.env.VITE_API_BILLS;

const BillList = () => {
  const [bills, setBills] = useState({});
  const [filteredBills, setFilteredBills] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}${API_ENDPOINT_BILLS}`)
      .then(response => {
        setBills(response.data);
        setFilteredBills(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching bills:', error);
        setLoading(false);
      });
  };

  const groupByCustomer = (products) => {
    const groups = {};
    products.forEach((p) => {
      if (!groups[p.C_id]) groups[p.C_id] = [];
      groups[p.C_id].push(p);
    });
    return groups;
  };

  const applyFilter = (selected) => {
    setFilter(selected);
    if (selected === 'All') {
      setFilteredBills(bills);
      return;
    }

    const now = dayjs();
    let startDate = null;
    let endDate = now.endOf('day');

    switch (selected) {
      case 'Today': startDate = now.startOf('day'); break;
      case 'Yesterday':
        startDate = now.subtract(1, 'day').startOf('day');
        endDate = now.subtract(1, 'day').endOf('day');
        break;
      case 'Last Week': startDate = now.subtract(7, 'day').startOf('day'); break;
      case 'Last Month': startDate = now.subtract(1, 'month').startOf('month'); break;
      case 'Last Year': startDate = now.subtract(1, 'year').startOf('year'); break;
      default: startDate = null;
    }

    const filtered = {};
    Object.entries(bills).forEach(([dateStr, items]) => {
      const billDate = dayjs(dateStr);
      if (!startDate || (billDate.isSameOrAfter(startDate) && billDate.isSameOrBefore(endDate))) {
        filtered[dateStr] = items;
      }
    });

    setFilteredBills(filtered);
  };

  const downloadBillByCustomer = (customerId, date) => {
    const billsForDate = filteredBills[date]?.filter(b => b.C_id === customerId);
    if (!billsForDate?.length) return;

    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(18);
    doc.text('CUSTOMER BILL INVOICE', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Customer ID: ${customerId}`, 14, 30);
    doc.text(`Bill Date: ${date}`, 14, 37);
    doc.text(`Downloaded On: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 14, 44);

    const tableData = billsForDate.map(b => [
      b.b_proName, b.Pro_id, b.b_proQun, `₹ ${b.b_price}`, `₹ ${b.b_total}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Product Name', 'Product ID', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
      styles: { halign: 'center' },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      theme: 'striped'
    });

    const final = billsForDate[0];
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Discount: RS ${final.discount || 0}`, 14, finalY);
    doc.setFont('helvetica', 'bold');
    doc.text(`Final Total: RS ${final.final_total || final.ov_total}`, 14, finalY + 7);

    doc.save(`Bill_${customerId}_${date}.pdf`);
  };

  const downloadBillByDate = (date) => {
    const billsForDate = filteredBills[date];
    if (!billsForDate?.length) return;

    const grouped = groupByCustomer(billsForDate);
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(18);
    doc.text(`DATE BILL SUMMARY`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Bill Date: ${date}`, 14, 30);
    doc.text(`Downloaded On: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 14, 37);

    let startY = 45;
    let grandTotal = 0;

    Object.entries(grouped).forEach(([customerId, items], index) => {
      const tableData = items.map(item => [
        item.b_proName, item.Pro_id, item.b_proQun,
        `Rs ${item.b_price}`, `Rs ${item.b_total}`
      ]);

      autoTable(doc, {
        startY,
        head: [[`Customer ID: ${customerId}`, '', '', '', '']],
        body: [],
        theme: 'plain',
        styles: { fontStyle: 'bold', halign: 'left' }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        head: [['Product Name', 'Product ID', 'Quantity', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        styles: { halign: 'center' },
        headStyles: { fillColor: [22, 22, 22], textColor: [255, 255, 255] }
      });

      const final = items[0];
      const finalY = doc.lastAutoTable.finalY + 5;
      doc.setFontSize(11);
      doc.setTextColor(50);
      doc.text(`Discount: Rs ${final.discount || 0}`, 14, finalY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      const customerTotal = final.final_total || final.ov_total;
      doc.text(`Final Total: Rs ${customerTotal}`, 14, finalY + 6);

      grandTotal += customerTotal;
      startY = finalY + 16;
    });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total for ${date}: Rs ${grandTotal}`, 14, startY + 10);

    doc.save(`DateBill_${date}.pdf`);
  };

  const sortedDates = Object.keys(filteredBills).sort((a, b) => dayjs(b).diff(dayjs(a)));

  return (
    <section className="min-h-screen bg-yellow-50 p-4 text-black">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {['All', 'Today', 'Yesterday', 'Last Week', 'Last Month', 'Last Year'].map(option => (
          <button
            key={option}
            onClick={() => applyFilter(option)}
            className={`px-4 py-1 rounded-full font-medium border border-black 
              ${filter === option ? 'bg-black text-white' : 'bg-white text-black hover:bg-yellow-100'}`}
          >
            {option}
          </button>
        ))}
        <button
          onClick={fetchBills}
          className="px-4 py-1 rounded-full font-medium border border-black bg-yellow-400 text-black hover:bg-yellow-100"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center font-semibold">Loading bills...</p>
      ) : (
        sortedDates.length === 0 ? (
          <p className="text-center font-semibold">No bills found.</p>
        ) : (
          sortedDates.map(date => {
            const products = [...filteredBills[date]].sort((a, b) => b.id - a.id);
            const grouped = groupByCustomer(products);

            return (
              <section key={date} className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">🧾 Bill Date: {date}</h2>
                  <button
                    onClick={() => downloadBillByDate(date)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Download Date Bill
                  </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-black">
                  <table className="min-w-full text-sm sm:text-base border-collapse">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-4 py-3 border">Customer ID</th>
                        <th className="px-4 py-3 border">Product Name</th>
                        <th className="px-4 py-3 border">Product ID</th>
                        <th className="px-4 py-3 border">Quantity</th>
                        <th className="px-4 py-3 border">Unit Price</th>
                        <th className="px-4 py-3 border">Total</th>
                        <th className="px-4 py-3 border">Discount</th>
                        <th className="px-4 py-3 border">Final Total</th>
                        <th className="px-4 py-3 border">Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(grouped).map(([customerId, items]) =>
                        items.map((item, index) => (
                          <tr key={item.id} className="odd:bg-yellow-50 even:bg-white hover:bg-yellow-100">
                            {index === 0 && (
                              <td rowSpan={items.length} className="px-4 py-2 border font-semibold">
                                {customerId}
                              </td>
                            )}
                            <td className="px-4 py-2 border">{item.b_proName}</td>
                            <td className="px-4 py-2 border">{item.Pro_id}</td>
                            <td className="px-4 py-2 border">{item.b_proQun}</td>
                            <td className="px-4 py-2 border">₹ {item.b_price}</td>
                            <td className="px-4 py-2 border">₹ {item.b_total}</td>
                            {index === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-2 border text-red-600 font-semibold">
                                  ₹ {item.discount || 0}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-2 border text-green-800 font-bold">
                                  ₹ {item.final_total || item.ov_total}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-2 border">
                                  <button
                                    onClick={() => downloadBillByCustomer(customerId, date)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                                  >
                                    PDF
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })
        )
      )}
    </section>
  );
};

export default BillList;
