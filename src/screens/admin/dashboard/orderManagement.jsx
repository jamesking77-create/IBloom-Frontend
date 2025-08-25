import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Eye,
  X,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Truck,
  Warehouse,
  Send,
  Calculator,
  DollarSign,
  FileText,
  Trash2,
  Edit3,
  Download,
} from "lucide-react";
import {
  fetchOrders,
  setSelectedOrder,
  clearSelectedOrder,
  updateOrderStatus,
  setFilters,
  selectFilteredOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectSelectedOrder,
  selectOrderFilters,
  selectOrderPagination,
} from "../../../store/slices/order-slice";
import { formatCurrency } from "../../../utils/formatCcy";
import useRealTimeOrders from "../../../utils/hooks/useRealTimeOrders";

const OrdersManagement = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFilteredOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const selectedOrder = useSelector(selectSelectedOrder);
  const filters = useSelector(selectOrderFilters);
  const pagination = useSelector(selectOrderPagination);

  const [showFilters, setShowFilters] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    dailyRate: 0,
    customerEmail: "",
    customerName: "",
    orderId: "",
  });
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [orderDailyRate, setOrderDailyRate] = useState(0);

  // Use the WebSocket hook for real-time order updates
  const {
    isConnected: wsConnected,
    connectionState: wsConnectionState,
    reconnect: wsReconnect,
  } = useRealTimeOrders({
    enabled: true,
    onNewOrder: (message) => {
      console.log('New order received:', message.data);
      toast.success(`New order received: ${message.data?.orderNumber || 'Unknown'}`, {
        duration: 5000,
        position: 'top-right'
      });
      // Refresh the orders list to get the new order
      dispatch(fetchOrders());
    },
    onOrderStatusUpdate: (message) => {
      console.log('Order status updated:', message.data);
      toast.success(`Order ${message.data?.orderNumber || 'Unknown'} status updated`, {
        duration: 4000,
        position: 'top-right'
      });
      // Refresh the orders list to get the updated status
      dispatch(fetchOrders());
    },
    onOrderDeleted: (message) => {
      console.log('Order deleted:', message.data);
      toast.error(`Order ${message.data?.orderNumber || 'Unknown'} was deleted`, {
        duration: 4000,
        position: 'top-right'
      });
      // Close modal if the deleted order is currently selected
      if (selectedOrder && selectedOrder._id === (message.data.orderId || message.data._id)) {
        dispatch(clearSelectedOrder());
      }
      // Refresh the orders list
      dispatch(fetchOrders());
    },
    onConnected: () => {
      console.log('Orders WebSocket connected');
      toast.success('Real-time order updates enabled', {
        duration: 2000,
        position: 'bottom-right'
      });
    },
    // onDisconnected: () => {
    //   console.log("Disconnected from Orders WebSocket");
    //   toast.warn("Real-time updates disconnected", {
    //     duration: 2000,
    //     position: "bottom-right",
    //   });
    // },
    // onError: (error) => {
    //   console.error("Orders WebSocket error:", error);
    //   toast.error("WebSocket connection error", {
    //     duration: 3000,
    //     position: "bottom-right",
    //   });
    // },
  });

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleViewOrder = (order) => {
    dispatch(setSelectedOrder(order));
    setOrderDailyRate(0);
  };

  const handleCloseModal = () => {
    dispatch(clearSelectedOrder());
    setOrderDailyRate(0);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus }));
      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_BASEURL}api/orders/${orderId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          toast.success("Order deleted successfully");
          dispatch(fetchOrders());
          dispatch(clearSelectedOrder());
        } else {
          throw new Error("Failed to delete order");
        }
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  // Download invoice function
  const handleDownloadInvoice = async (order, dailyRate = 0) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASEURL}api/orders/download-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order._id,
            customerEmail: order.customerInfo.email,
            customerName: order.customerInfo.name,
            dailyRate: parseFloat(dailyRate) || 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '-')}-${dailyRate > 0 ? 'with-daily-rate' : 'standard'}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const openInvoiceModal = (order) => {
    setInvoiceData({
      orderId: order._id,
      customerEmail: order.customerInfo.email,
      customerName: order.customerInfo.name,
      dailyRate: 0,
    });
    setShowInvoiceModal(true);
  };

  // Fixed calculateInvoicePreview function
  const calculateInvoicePreview = () => {
    const orderToUse = invoiceData.orderId ? 
      orders.find(order => order._id === invoiceData.orderId) : 
      selectedOrder;
      
    if (!orderToUse) return null;

    const { items, dateInfo } = orderToUse;
    const { startDate, endDate } = dateInfo;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const itemsSubtotal = items.reduce((total, item) => {
      const pricePerUnit = item.pricePerUnit || item.pricePerDay || item.unitPrice || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (pricePerUnit * quantity);
    }, 0);

    const dailyCharges = parseFloat(invoiceData.dailyRate) * durationInDays;
    const subtotal = itemsSubtotal + dailyCharges;
    const tax = subtotal * 0.075;
    const total = subtotal + tax;

    return {
      itemsSubtotal,
      dailyCharges,
      durationInDays,
      subtotal,
      tax,
      total,
    };
  };

  const handleSendInvoice = async () => {
    setSendingInvoice(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASEURL}api/orders/send-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (response.ok) {
        toast.success("Invoice sent successfully!");
        setShowInvoiceModal(false);
        setInvoiceData({ dailyRate: 0, customerEmail: "", customerName: "", orderId: "" });
      } else {
        throw new Error("Failed to send invoice");
      }
    } catch (error) {
      toast.error("Failed to send invoice");
    } finally {
      setSendingInvoice(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error loading orders: {error}</div>
      </div>
    );
  }

  const invoicePreview = calculateInvoicePreview();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* WebSocket Connection Status - Optional indicator */}
      {wsConnectionState !== 'connected' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-yellow-800">
              Real-time updates: {wsConnectionState}
            </span>
          </div>
          {wsConnectionState === 'error' && (
            <button
              onClick={wsReconnect}
              className="text-sm bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded transition-colors"
            >
              Reconnect
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Order Management
          </h1>
          {wsConnected && (
            <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Real-time updates enabled
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by order #, name, or email"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    handleFilterChange("searchTerm", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders List - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {order.customerInfo.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerInfo.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(order.dateInfo.startDate)}
                      </div>
                      {order.dateInfo.isMultiDay && (
                        <div className="text-sm text-gray-500">
                          to {formatDate(order.dateInfo.endDate)}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {order.dateInfo.duration}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {order.deliveryInfo.type === "delivery" ? (
                        <Truck className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Warehouse className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-900 capitalize">
                        {order.deliveryInfo.type.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(order.pricing.total)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openInvoiceModal(order)}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                        title="Send Invoice"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order._id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.customerInfo.name}
                  </p>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Items:</span>
                  <span className="ml-1 font-medium">{order.items.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="ml-1 font-medium">
                    {formatCurrency(order.pricing.total)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Start:</span>
                  <span className="ml-1">
                    {new Date(order.dateInfo.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  {order.deliveryInfo.type === "delivery" ? (
                    <Truck className="w-3 h-3 text-blue-600 mr-1" />
                  ) : (
                    <Warehouse className="w-3 h-3 text-green-600 mr-1" />
                  )}
                  <span className="capitalize text-xs">
                    {order.deliveryInfo.type.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => openInvoiceModal(order)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  Invoice
                </button>
                <button
                  onClick={() => handleDownloadInvoice(order)}
                  className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Order Details - {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Order Status & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status.replace("_", " ").toUpperCase()}
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder._id, e.target.value)
                    }
                    className="flex-1 sm:flex-none px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => openInvoiceModal(selectedOrder)}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Invoice</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm sm:text-base">
                        {selectedOrder.customerInfo.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm sm:text-base">
                        {selectedOrder.customerInfo.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm sm:text-base">
                        {selectedOrder.customerInfo.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {selectedOrder.deliveryInfo.type === "delivery" ? (
                        <Truck className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Warehouse className="w-4 h-4 text-green-600" />
                      )}
                      <span className="capitalize text-sm sm:text-base">
                        {selectedOrder.deliveryInfo.type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm sm:text-base">
                        {selectedOrder.deliveryInfo.address}
                      </span>
                    </div>
                    {selectedOrder.deliveryInfo.instructions && (
                      <div className="text-sm text-gray-600 pl-6">
                        Instructions: {selectedOrder.deliveryInfo.instructions}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Rental Period
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Start</div>
                      <div className="font-medium text-sm sm:text-base">
                        {formatDate(selectedOrder.dateInfo.startDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">End</div>
                      <div className="font-medium text-sm sm:text-base">
                        {formatDate(selectedOrder.dateInfo.endDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-medium text-sm sm:text-base">
                        {selectedOrder.dateInfo.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Rental Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.image || "/api/placeholder/64/64"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.category}
                        </div>
                        <div className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatCurrency(item.pricePerUnit || item.pricePerDay || item.unitPrice || item.price || 0)}/unit
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal:</span>
                    <span>
                      {formatCurrency(selectedOrder.pricing.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedOrder.pricing.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Delivery Fee:</span>
                    <span>
                      {formatCurrency(selectedOrder.pricing.deliveryFee || 0)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base sm:text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.pricing.total)}</span>
                  </div>
                </div>
              </div>

              {/* Daily Rate Section - NEW */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Additional Daily Rate
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Rate (Additional charges per day)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={orderDailyRate}
                          onChange={(e) => setOrderDailyRate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        This rate will be applied per day for the rental period
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setInvoiceData(prev => ({
                            ...prev,
                            orderId: selectedOrder._id,
                            customerEmail: selectedOrder.customerInfo.email,
                            customerName: selectedOrder.customerInfo.name,
                            dailyRate: orderDailyRate,
                          }));
                          setShowInvoiceModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        Generate Invoice
                      </button>
                      
                      <button
                        onClick={() => {
                          handleDownloadInvoice(selectedOrder, orderDailyRate);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview calculation */}
                  {orderDailyRate > 0 && selectedOrder && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Rate Preview</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex justify-between">
                          <span>Daily Rate:</span>
                          <span>{formatCurrency(parseFloat(orderDailyRate) || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{selectedOrder.dateInfo.duration}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Additional Charges:</span>
                          <span>{formatCurrency((parseFloat(orderDailyRate) || 0) * (selectedOrder.dateInfo.orderPeriod || 1))}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Send Order Invoice
              </h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={invoiceData.customerName}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={invoiceData.customerEmail}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        customerEmail: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Daily Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Rate (Additional charges per day)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceData.dailyRate}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        dailyRate: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This rate will be multiplied by the number of rental days
                </p>
              </div>

              {/* Invoice Preview */}
              {invoicePreview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Invoice Preview
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span>
                        {formatCurrency(invoicePreview.itemsSubtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Daily Charges ({invoicePreview.durationInDays} days ×{" "}
                        {formatCurrency(parseFloat(invoiceData.dailyRate) || 0)}
                        ):
                      </span>
                      <span>{formatCurrency(invoicePreview.dailyCharges)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoicePreview.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (7.5%):</span>
                      <span>{formatCurrency(invoicePreview.tax)}</span>
                    </div>
                    <div className="border-t border-blue-300 pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(invoicePreview.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                {/* Download Invoice Button */}
                <button
                  onClick={() => {
                    const orderForInvoice = orders.find(order => order._id === invoiceData.orderId);
                    if (orderForInvoice) {
                      handleDownloadInvoice(orderForInvoice, invoiceData.dailyRate);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                
                <button
                  onClick={handleSendInvoice}
                  disabled={sendingInvoice || !invoiceData.customerEmail}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {sendingInvoice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;