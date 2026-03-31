import BASE_URL from "../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserOrders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/orders/user/${user._id}`);
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Download Invoice as PDF
  const downloadInvoice = async (order) => {
    const { jsPDF } = await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm");

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // ── Header ──
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, pageW, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("E-Commerce Store", 14, 12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("INVOICE", 14, 22);

    // ── Invoice info ──
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, pageW - 14, 38, { align: "right" });
    doc.text(`Order Date:   ${new Date(order.createdAt).toLocaleDateString()}`, pageW - 14, 44, { align: "right" });

    // ── Customer info ──
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(63, 81, 181);
    doc.text("Bill To:", 14, 42);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(order.customerName, 14, 50);
    doc.text(`Phone: ${order.phone}`, 14, 57);

    // wrap long address
    const addressLines = doc.splitTextToSize(`Address: ${order.address}`, 120);
    doc.text(addressLines, 14, 64);

    // ── Status badge ──
    const statusColors = {
      Accepted:  [33, 150, 243],
      Shipped:   [156, 39, 176],
      Delivered: [76, 175, 80],
    };
    const sc = statusColors[order.status] || [100, 100, 100];
    doc.setFillColor(...sc);
    doc.roundedRect(pageW - 50, 38, 36, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(order.status.toUpperCase(), pageW - 32, 44.5, { align: "center" });

    // ── Divider ──
    const tableTop = 80;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, tableTop - 4, pageW - 14, tableTop - 4);

    // ── Table header ──
    doc.setFillColor(240, 242, 255);
    doc.rect(14, tableTop - 2, pageW - 28, 10, "F");
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("#",        16, tableTop + 5);
    doc.text("Product",  28, tableTop + 5);
    doc.text("Qty",     130, tableTop + 5);
    doc.text("Price",   155, tableTop + 5);
    doc.text("Total",   180, tableTop + 5);

    // ── Table rows ──
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    let y = tableTop + 16;

    order.products.forEach((p, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 249, 255);
        doc.rect(14, y - 6, pageW - 28, 10, "F");
      }
      doc.setFontSize(9);
      doc.text(`${i + 1}`,                          16, y);
      doc.text(p.name.substring(0, 35),             28, y);
      doc.text(`${p.qty}`,                          133, y);
      doc.text(`Rs.${p.price}`,                     152, y);
      doc.text(`Rs.${p.price * p.qty}`,             178, y);
      y += 12;
    });

    // ── Divider ──
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageW - 14, y);
    y += 8;

    // ── Totals ──
    const subtotal = order.products.reduce((s, p) => s + p.price * p.qty, 0);
    const delivery = subtotal > 500 ? 0 : 50;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Subtotal:",  130, y);
    doc.text(`Rs.${subtotal}`, 178, y);
    y += 8;
    doc.text("Delivery:",  130, y);
    doc.text(delivery === 0 ? "Free" : `Rs.${delivery}`, 178, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(12);
    doc.text("Grand Total:", 130, y);
    doc.text(`Rs.${order.totalAmount}`, 178, y);

    // ── Footer ──
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for shopping with us!", pageW / 2, 285, { align: "center" });
    doc.text("E-Commerce Store | support@ecommerce.com", pageW / 2, 290, { align: "center" });

    doc.save(`Invoice_${order._id.slice(-6).toUpperCase()}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":   return "bg-yellow-100 text-yellow-700";
      case "Accepted":  return "bg-blue-100 text-blue-700";
      case "Shipped":   return "bg-purple-100 text-purple-700";
      case "Delivered": return "bg-green-100 text-green-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case "Pending":   return 1;
      case "Accepted":  return 2;
      case "Shipped":   return 3;
      case "Delivered": return 4;
      default: return 0;
    }
  };

  const steps = ["Order Placed", "Order Confirmed", "Shipped", "Delivered"];

  // ✅ Show invoice button only for these statuses
  const canDownloadInvoice = (status) =>
    ["Accepted", "Shipped", "Delivered"].includes(status);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-400 text-lg">Loading orders...</p>
    </div>
  );

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen max-w-4xl mx-auto">

      <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">📦 My Orders</h1>
      <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Track all your orders here.</p>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded shadow text-center">
          <p className="text-gray-400 text-lg mb-4">You have no orders yet.</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-xl shadow overflow-hidden">

              {/* ORDER HEADER */}
              <div className="flex flex-wrap justify-between items-start gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b bg-gray-50">
                <div>
                  <p className="text-xs text-gray-400">Order placed</p>
                  <p className="text-xs sm:text-sm font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-sm font-bold text-indigo-600">₹ {order.totalAmount}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* PRODUCTS */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b">
                {order.products.map((p, i) => (
                  <div key={i} className="flex justify-between text-xs sm:text-sm py-1">
                    <span className="text-gray-700">{p.name} <span className="text-gray-400">x{p.qty}</span></span>
                    <span className="font-medium ml-2 flex-shrink-0">₹ {p.price * p.qty}</span>
                  </div>
                ))}
              </div>

              {/* ORDER TRACKING */}
              {order.status !== "Cancelled" ? (
                <div className="px-4 sm:px-5 py-4 sm:py-5">
                  <p className="text-sm font-semibold text-gray-600 mb-4">🚚 Order Tracking</p>
                  <div className="relative flex items-center justify-between">

                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0">
                      <div
                        className="h-1 bg-indigo-500 transition-all duration-500"
                        style={{ width: `${((getStatusStep(order.status) - 1) / 3) * 100}%` }}
                      />
                    </div>

                    {steps.map((step, i) => {
                      const stepNum = i + 1;
                      const done = stepNum <= getStatusStep(order.status);
                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center w-1/4">
                          <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2
                            ${done ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                            {done ? "✓" : stepNum}
                          </div>
                          <p className={`text-xs mt-2 text-center font-medium leading-tight ${done ? "text-indigo-600" : "text-gray-400"}`}>
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* DOWNLOAD INVOICE BUTTON */}
                  {canDownloadInvoice(order.status) && (
                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => downloadInvoice(order)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow"
                      >
                        📄 Download Invoice
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 sm:px-5 py-4 bg-red-50 text-red-600 text-sm font-medium">
                  ❌ This order was cancelled.
                </div>
              )}

              {/* DELIVERY INFO */}
              <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="truncate">📍 {order.address}</span>
                <span className="flex-shrink-0">📞 {order.phone}</span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}