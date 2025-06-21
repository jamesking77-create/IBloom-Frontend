import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Search, Filter, User, Phone, Mail, Calendar, RefreshCw, Edit } from 'lucide-react';
import { QuoteDetails } from '../../../components/quotes/quoteDetails';
import { fetchQuotes, updateQuoteStatus, loadMockData } from '../../../store/slices/quote-slice';

export const QuotesList = () => {
  const dispatch = useDispatch();
  
  const quotesState = useSelector((state) => state.quotes || {});
  const { quotes = [], loading = false, error = null, updating = false } = quotesState;
  
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingStatus, setEditingStatus] = useState(null);

  useEffect(() => {
    try {
      dispatch(fetchQuotes());
    } catch (err) {
      console.error('Error dispatching fetchQuotes:', err);
    }
  }, [dispatch]);

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedQuote(null);
  };

  const handleRefresh = () => {
    dispatch(fetchQuotes());
  };

  const handleLoadMockData = () => {
    dispatch(loadMockData());
  };

  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      await dispatch(updateQuoteStatus({ quoteId, status: newStatus })).unwrap();
      setEditingStatus(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleEditStatus = (quoteId) => {
    setEditingStatus(quoteId);
  };

  const handleCancelEdit = () => {
    setEditingStatus(null);
  };

  // Filter quotes based on search term and status
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      (quote.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.userPhone || '').includes(searchTerm) ||
      (quote.quoteId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (showDetails && selectedQuote) {
    return (
      <QuoteDetails 
        quote={selectedQuote} 
        onClose={handleCloseDetails} 
      />
    );
  }

  const StatusDropdown = ({ quote }) => {
    const statuses = ['pending', 'reviewed', 'responded'];
    
    if (editingStatus === quote.quoteId) {
      return (
        <div className="flex items-center space-x-2">
          <select
            value={quote.status}
            onChange={(e) => handleStatusChange(quote.quoteId, e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#468E36] focus:border-transparent"
            disabled={updating}
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={handleCancelEdit}
            className="text-xs text-gray-500 hover:text-gray-700"
            disabled={updating}
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          quote.status === 'pending' 
            ? 'bg-yellow-100 text-yellow-800'
            : quote.status === 'reviewed'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {quote.status || 'pending'}
        </span>
        <button
          onClick={() => handleEditStatus(quote.quoteId)}
          className="text-gray-400 hover:text-[#468E36] transition-colors"
          disabled={updating}
        >
          <Edit size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Quotes</h1>
            <p className="text-gray-600">Manage and view all user quote requests</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-[#468E36] text-white rounded-lg hover:bg-[#2C5D22] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </button>
            {quotes.length === 0 && !loading && (
              <button
                onClick={handleLoadMockData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load Demo Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or quote ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#468E36] focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#468E36] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="responded">Responded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#468E36]"></div>
        </div>
      )}

      {/* Error State - Only show if there's an actual error and no quotes */}
      {error && !loading && quotes.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-red-800">Unable to Load Quotes</h3>
          <p className="text-red-700 text-sm mt-1">
            There was a problem loading the quotes. Please try refreshing or load demo data.
          </p>
        </div>
      )}

      {/* Quotes List */}
      {!loading && quotes.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{quote.quoteId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <User size={14} className="mr-2 text-gray-400" />
                            {quote.userName || 'N/A'}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {quote.userEmail || 'N/A'}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone size={14} className="mr-2 text-gray-400" />
                            {quote.userPhone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {quote.items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDropdown quote={quote} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewQuote(quote)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#468E36] bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                        >
                          <Eye size={16} className="mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Summary */}
          {filteredQuotes.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {filteredQuotes.length} of {quotes.length || 0} quotes
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredQuotes.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No quotes found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No quote requests have been submitted yet.'
            }
          </p>
          {quotes.length === 0 && (
            <button
              onClick={handleLoadMockData}
              className="inline-flex items-center px-4 py-2 bg-[#468E36] text-white rounded-lg hover:bg-[#2C5D22] transition-colors"
            >
              Load Demo Data
            </button>
          )}
        </div>
      )}

      {/* Status Update Loading Overlay */}
      {updating && (
        <div className="fixed inset-0 bg-black/60  flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#468E36] mx-auto mb-4"></div>
            <p className="text-gray-700">Updating status...</p>
          </div>
        </div>
      )}
    </div>
  );
};