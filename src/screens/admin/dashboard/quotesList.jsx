import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Eye, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  RefreshCw, 
  Edit, 
  Package, 
  Clock, 
  MapPin,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Tag,
  Hash,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  Reply,
  Trash2,
  MoreVertical,
  Bell,
  Loader2,
  X,
  Send,
  Save,
  Menu,
  AlertTriangle
} from 'lucide-react';

export const QuotesList = () => {
  // Mock data for demonstration
  const [quotes, setQuotes] = useState([
    {
      _id: '1',
      quoteId: 'QT-2024-001',
      customer: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+234 803 123 4567',
        eventType: 'Wedding',
        eventDate: '2024-09-15',
        eventLocation: 'Victoria Island, Lagos',
        guestCount: 150,
        specialRequests: 'Need vegetarian options and outdoor setup'
      },
      categoryName: 'Catering',
      items: [
        { name: 'Wedding Cake', description: '3-tier vanilla cake', quantity: 1, unitPrice: 75000 },
        { name: 'Appetizers', description: 'Mixed appetizer platter', quantity: 5, unitPrice: 15000 }
      ],
      status: 'pending',
      viewedByAdmin: false,
      createdAt: '2024-08-15T10:30:00Z',
      updatedAt: '2024-08-15T10:30:00Z',
      response: null
    },
    {
      _id: '2',
      quoteId: 'QT-2024-002',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        phone: '+234 901 987 6543',
        eventType: 'Corporate Event',
        eventDate: '2024-09-20',
        eventLocation: 'Ikeja GRA, Lagos',
        guestCount: 80
      },
      categoryName: 'Audio/Visual',
      items: [
        { name: 'Sound System', description: 'Professional PA system', quantity: 1, unitPrice: 50000 },
        { name: 'Lighting', description: 'LED stage lighting', quantity: 1, unitPrice: 35000 }
      ],
      status: 'responded',
      viewedByAdmin: true,
      createdAt: '2024-08-14T14:20:00Z',
      updatedAt: '2024-08-16T09:15:00Z',
      response: {
        finalTotal: 95000,
        validUntil: '2024-09-15',
        message: 'Thank you for your inquiry. Please find our quote below.'
      }
    },
    {
      _id: '3',
      quoteId: 'QT-2024-003',
      customer: {
        name: 'Michael Brown',
        email: 'mike.brown@gmail.com',
        phone: '+234 705 555 1234',
        eventType: 'Birthday Party',
        eventDate: '2024-08-25',
        eventLocation: 'Lekki Phase 1, Lagos'
      },
      categoryName: 'Decoration',
      items: [
        { name: 'Balloon Arch', description: 'Custom balloon decoration', quantity: 2, unitPrice: 25000 }
      ],
      status: 'accepted',
      viewedByAdmin: true,
      createdAt: '2024-08-13T16:45:00Z',
      updatedAt: '2024-08-17T11:30:00Z'
    }
  ]);

  // Local state
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [responseQuote, setResponseQuote] = useState(null);
  const [editingResponse, setEditingResponse] = useState({});
  const [viewMode, setViewMode] = useState('cards');
  const [expandedQuote, setExpandedQuote] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Mock state values
  const [loading] = useState(false);
  const [error] = useState(null);
  const [updating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [responding] = useState(false);
  const [sending] = useState(false);
  const [wsConnected] = useState(true);
  const [wsError] = useState(null);

  // Summary calculations
  const summary = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    reviewed: quotes.filter(q => q.status === 'reviewed').length,
    responded: quotes.filter(q => q.status === 'responded').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    unviewed: quotes.filter(q => !q.viewedByAdmin).length
  };

  // Filter quotes based on current filters
  const filteredQuotes = quotes.filter(quote => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!quote.customer?.name?.toLowerCase().includes(search) &&
          !quote.customer?.email?.toLowerCase().includes(search) &&
          !quote.quoteId?.toLowerCase().includes(search) &&
          !quote.categoryName?.toLowerCase().includes(search)) {
        return false;
      }
    }
    
    if (filters.status !== 'all' && quote.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  // Event handlers
  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
  };

  const handleCreateResponse = (quote) => {
    setResponseQuote(quote);
    setEditingResponse({
      message: '',
      items: quote.items?.map(item => ({
        ...item,
        unitPrice: item.unitPrice || 0,
        totalPrice: (item.unitPrice || 0) * (item.quantity || 1)
      })) || [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      deliveryFee: 0,
      setupFee: 0,
      finalTotal: 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      terms: 'Payment terms: 50% deposit required, balance due on delivery.'
    });
    setShowResponseModal(true);
    setShowActionMenu(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setShowMobileFilters(false);
  };

  const handleDeleteQuote = (quote) => {
    setQuoteToDelete(quote);
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const confirmDeleteQuote = async () => {
    if (!quoteToDelete) return;
    
    setDeleting(true);
    try {
      // Mock delete operation - replace with actual API call
      console.log('Deleting quote:', quoteToDelete.quoteId || quoteToDelete._id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would dispatch your actual delete action:
      // await dispatch(deleteQuote(quoteToDelete.quoteId || quoteToDelete._id)).unwrap();
      
      // For demo purposes, remove from local state
      setQuotes(prevQuotes => prevQuotes.filter(quote => 
        (quote.quoteId || quote._id) !== (quoteToDelete.quoteId || quoteToDelete._id)
      ));
      
      // Mock success notification
      console.log('Quote deleted successfully');
      
      // You could add a notification here:
      // addNotification({
      //   type: 'success',
      //   title: 'Quote Deleted',
      //   message: 'Quote has been deleted successfully.',
      //   timestamp: new Date()
      // });
    } catch (error) {
      console.error('Failed to delete quote:', error);
      // Handle error notification
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setQuoteToDelete(null);
    }
  };

  const cancelDeleteQuote = () => {
    setShowDeleteModal(false);
    setQuoteToDelete(null);
  };

  const toggleExpanded = (quoteId) => {
    setExpandedQuote(expandedQuote === quoteId ? null : quoteId);
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'reviewed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'responded': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'expired': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={14} />;
      case 'reviewed': return <Eye size={14} />;
      case 'responded': return <Reply size={14} />;
      case 'accepted': return <CheckCircle size={14} />;
      case 'cancelled': return <X size={14} />;
      case 'expired': return <AlertCircle size={14} />;
      default: return <FileText size={14} />;
    }
  };

  // Components
  const StatusBadge = ({ status }) => (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span className="capitalize">{status}</span>
    </div>
  );

  const ActionMenu = ({ quote, isMobile = false }) => {
    const menuId = quote.quoteId || quote._id;
    const isOpen = showActionMenu === menuId;
    const hasResponse = !!quote.response;

    if (isMobile) {
      return (
        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg mt-4">
          <button
            onClick={() => handleViewQuote(quote)}
            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            <span>View</span>
          </button>
          
          <button
            onClick={() => handleCreateResponse(quote)}
            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
            disabled={quote.status === 'cancelled'}
          >
            <Edit size={16} />
            <span>{hasResponse ? 'Edit' : 'Create'}</span>
          </button>
          
          {hasResponse && (
            <button
              onClick={() => console.log('Send response')}
              className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
              disabled={sending}
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          )}
          
          <button
            onClick={() => handleDeleteQuote(quote)}
            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-700 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
            disabled={deleting}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={() => setShowActionMenu(isOpen ? null : menuId)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical size={18} />
        </button>
        
        {isOpen && (
          <>
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px] py-1">
              <button
                onClick={() => { handleViewQuote(quote); setShowActionMenu(null); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
              >
                <Eye size={16} />
                View Details
              </button>
              
              <button
                onClick={() => { handleCreateResponse(quote); setShowActionMenu(null); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                disabled={quote.status === 'cancelled'}
              >
                <Edit size={16} />
                {hasResponse ? 'Edit Response' : 'Create Response'}
              </button>
              
              {hasResponse && (
                <button
                  onClick={() => { console.log('Send response'); setShowActionMenu(null); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 flex items-center gap-3"
                  disabled={sending}
                >
                  <Send size={16} />
                  Send Response
                </button>
              )}
              
              <hr className="my-1" />
              
              <button
                onClick={() => handleDeleteQuote(quote)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3"
                disabled={deleting}
              >
                <Trash2 size={16} />
                Delete Quote
              </button>
            </div>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowActionMenu(null)}
            />
          </>
        )}
      </div>
    );
  };

  const QuoteCard = ({ quote }) => {
    const isExpanded = expandedQuote === (quote.quoteId || quote._id);
    const hasResponse = !!quote.response;
    
    return (
      <div className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
        !quote.viewedByAdmin ? 'ring-2 ring-emerald-200 shadow-emerald-50' : 'border-gray-200'
      }`}>
        {/* Card Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate text-base sm:text-lg">
                    #{quote.quoteId || 'N/A'}
                  </h3>
                  {!quote.viewedByAdmin && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate font-medium">
                  {quote.customer?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {quote.customer?.email || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={quote.status || 'pending'} />
              <div className="hidden sm:block">
                <ActionMenu quote={quote} />
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={16} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{quote.customer?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Package size={16} className="text-gray-400 flex-shrink-0" />
              <span>{quote.items?.length || 0} items</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Tag size={16} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{quote.categoryName || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} className="text-gray-400 flex-shrink-0" />
              <span>{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          {/* Event Details */}
          {quote.customer?.eventType && (
            <div className="flex items-center gap-2 text-sm">
              <FileText size={16} className="text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-700">{quote.customer.eventType}</span>
              {quote.customer.eventDate && (
                <span className="text-gray-500">
                  • {new Date(quote.customer.eventDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Response Status */}
          {hasResponse && (
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Response Ready</span>
                </div>
                <span className="text-lg font-bold text-emerald-800">
                  ₦{quote.response.finalTotal?.toLocaleString() || '0'}
                </span>
              </div>
              {quote.response.validUntil && (
                <p className="text-sm text-emerald-700">
                  Valid until: {new Date(quote.response.validUntil).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Expandable Section */}
          {(quote.customer?.eventLocation || quote.customer?.specialRequests || quote.customer?.guestCount) && (
            <div>
              <button
                onClick={() => toggleExpanded(quote.quoteId || quote._id)}
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span>{isExpanded ? 'Show Less' : 'Show More Details'}</span>
              </button>

              {isExpanded && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                  {quote.customer?.eventLocation && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{quote.customer.eventLocation}</span>
                    </div>
                  )}
                  {quote.customer?.guestCount && (
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{quote.customer.guestCount} guests</span>
                    </div>
                  )}
                  {quote.customer?.specialRequests && (
                    <div className="flex items-start gap-2 text-sm">
                      <MessageSquare size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{quote.customer.specialRequests}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>
                {quote.updatedAt 
                  ? `Updated ${new Date(quote.updatedAt).toLocaleDateString()}`
                  : `Created ${quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}`
                }
              </span>
            </div>
            
            {/* Mobile Actions */}
            <div className="sm:hidden">
              <ActionMenu quote={quote} isMobile={true} />
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {!hasResponse ? (
                <button
                  onClick={() => handleCreateResponse(quote)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  disabled={quote.status === 'cancelled'}
                >
                  <Edit size={16} />
                  Create Response
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateResponse(quote)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => console.log('Send response')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    disabled={sending}
                  >
                    <Send size={16} />
                    Send
                  </button>
                </div>
              )}
              
              <button
                onClick={() => handleViewQuote(quote)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Eye size={16} />
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Quotes</h1>
            <div className="flex items-center gap-1">
              {wsConnected ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                  <Wifi size={12} className="text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full">
                  <WifiOff size={12} className="text-red-600" />
                  <span className="text-xs text-red-700 font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        
        {/* Mobile Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{summary.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <div className="text-lg font-bold text-amber-700">{summary.pending}</div>
              <div className="text-xs text-amber-600">Pending</div>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <div className="text-lg font-bold text-emerald-700">{summary.responded}</div>
              <div className="text-xs text-emerald-600">Responded</div>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-700">{summary.unviewed}</div>
              <div className="text-xs text-purple-600">New</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search quotes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="responded">Responded</option>
              <option value="accepted">Accepted</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                placeholder="From date"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                placeholder="To date"
              />
            </div>
            
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden lg:block p-6 xl:p-8">
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-3">Quote Management</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">Manage and respond to customer quote requests</p>
              
              {/* WebSocket Status */}
              <div className="flex items-center gap-2">
                {wsConnected ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                    <Wifi size={16} className="text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Live Updates</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full border border-red-200">
                    <WifiOff size={16} className="text-red-600" />
                    <span className="text-sm text-red-700 font-medium">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => console.log('Refresh')}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={18} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              <FileText size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Desktop Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Quotes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{summary.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Reviewed</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{summary.reviewed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Responded</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{summary.responded}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Reply className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Accepted</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{summary.accepted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">New</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{summary.unviewed}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name, email, quote ID, category..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            
            {/* Filters and View Toggle */}
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm min-w-[160px]"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="responded">Responded</option>
                    <option value="accepted">Accepted</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                
                {Object.values(filters).some(v => v && v !== 'all') && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-3 text-sm text-gray-600 hover:text-gray-800 underline whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${
                    viewMode === 'cards' 
                      ? 'bg-white shadow-sm text-emerald-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid size={18} />
                  <span className="text-sm">Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${
                    viewMode === 'table' 
                      ? 'bg-white shadow-sm text-emerald-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List size={18} />
                  <span className="text-sm">Table</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 pb-6 lg:px-6 xl:px-8 lg:pb-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading quotes...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && filteredQuotes.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Unable to Load Quotes</h3>
                <p className="text-red-700 text-sm mt-1">
                  {error}. Please try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WebSocket Error */}
        {wsError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800">Real-time Updates Unavailable</h3>
                <p className="text-amber-700 text-sm mt-1">
                  {wsError}. You may need to refresh manually to see new quotes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && filteredQuotes.length > 0 && (
          <>
            {/* Mobile: Always show cards */}
            <div className="lg:hidden">
              <div className="space-y-4">
                {filteredQuotes.map((quote) => (
                  <QuoteCard key={quote._id || quote.id || quote.quoteId} quote={quote} />
                ))}
              </div>
            </div>

            {/* Desktop: Show based on viewMode */}
            <div className="hidden lg:block">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {filteredQuotes.map((quote) => (
                    <QuoteCard key={quote._id || quote.id || quote.quoteId} quote={quote} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Quote Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredQuotes.map((quote) => (
                          <tr key={quote._id || quote.id || quote.quoteId} className={`hover:bg-gray-50 transition-colors ${
                            !quote.viewedByAdmin ? 'bg-emerald-50' : ''
                          }`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                  <Hash className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-semibold text-gray-900">
                                      #{quote.quoteId || 'N/A'}
                                    </div>
                                    {!quote.viewedByAdmin && (
                                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {quote.items?.length || 0} items
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{quote.customer?.name || 'Anonymous'}</div>
                                <div className="text-sm text-gray-500">{quote.customer?.email || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{quote.customer?.phone || 'N/A'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{quote.categoryName}</div>
                              {quote.customer?.eventType && (
                                <div className="text-sm text-gray-500">{quote.customer.eventType}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={quote.status || 'pending'} />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div>{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}</div>
                              {quote.customer?.eventDate && (
                                <div className="text-xs">Event: {new Date(quote.customer.eventDate).toLocaleDateString()}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {!quote.response ? (
                                  <button
                                    onClick={() => handleCreateResponse(quote)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                    disabled={quote.status === 'cancelled'}
                                  >
                                    <Edit size={14} />
                                    Create
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleCreateResponse(quote)}
                                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                                    >
                                      <Edit size={14} />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => console.log('Send response')}
                                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                      disabled={sending}
                                    >
                                      <Send size={14} />
                                      Send
                                    </button>
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => handleViewQuote(quote)}
                                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Results Summary */}
            {filteredQuotes.length > 0 && (
              <div className="mt-6 lg:mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredQuotes.length}</span> of{' '}
                  <span className="font-semibold">{quotes.length}</span> quotes
                  {filters.search && (
                    <span> matching "<span className="font-medium">{filters.search}</span>"</span>
                  )}
                  {filters.status && filters.status !== 'all' && (
                    <span> with status "<span className="font-medium">{filters.status}</span>"</span>
                  )}
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredQuotes.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-6">
              <FileText size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No quotes found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'No quote requests have been submitted yet. New quotes will appear here when customers submit them.'
              }
            </p>
            {(filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <X size={16} />
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && quoteToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Quote</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this quote? All associated data will be permanently removed.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        #{quoteToDelete.quoteId || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {quoteToDelete.customer?.name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {quoteToDelete.customer?.email || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDeleteQuote}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteQuote}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Quote
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Response Modal */}
      {showResponseModal && responseQuote && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {responseQuote.response ? 'Edit Quote Response' : 'Create Quote Response'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Quote #{responseQuote.quoteId} - {responseQuote.customer?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Response Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Response Message
                </label>
                <textarea
                  value={editingResponse.message || ''}
                  onChange={(e) => setEditingResponse({ ...editingResponse, message: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  rows={4}
                  placeholder="Enter your response message to the customer..."
                />
              </div>

              {/* Items Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Summary</h3>
                <div className="space-y-3">
                  {responseQuote.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₦{(item.unitPrice || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">per item</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₦{(editingResponse.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax & Fees:</span>
                    <span className="font-medium">₦{((editingResponse.tax || 0) + (editingResponse.deliveryFee || 0) + (editingResponse.setupFee || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">-₦{(editingResponse.discount || 0).toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-emerald-600">₦{(editingResponse.finalTotal || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Validity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={editingResponse.validUntil || ''}
                    onChange={(e) => setEditingResponse({ ...editingResponse, validUntil: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={editingResponse.terms || ''}
                    onChange={(e) => setEditingResponse({ ...editingResponse, terms: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    rows={3}
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={responding}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Save response');
                  setShowResponseModal(false);
                }}
                disabled={responding}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {responding ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Response
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlays */}
      {(updating || sending) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center mx-4 max-w-sm w-full">
            <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">
              {updating && 'Updating status...'}
              {sending && 'Sending response...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};