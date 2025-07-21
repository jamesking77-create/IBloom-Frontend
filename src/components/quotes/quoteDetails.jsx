import React from 'react';
import { ArrowLeft, User, Phone, Mail, Calendar, Package, DollarSign, Hash } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCcy';

export const QuoteDetails = ({ quote, onClose }) => {
  const calculateTotal = () => {
    return quote.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onClose}
          className="flex items-center text-[#468E36] hover:text-[#2C5D22] mb-4 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Quotes List
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Quote #{quote.quoteId}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  {new Date(quote.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  quote.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : quote.status === 'reviewed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {quote.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-[#468E36]">
                  {quote.items?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <User className="text-[#468E36] mr-3" size={20} />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium text-gray-900">{quote.userName}</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Mail className="text-[#468E36] mr-3" size={20} />
            <div>
              <p className="text-sm text-gray-600">Email Address</p>
              <p className="font-medium text-gray-900">{quote.userEmail}</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Phone className="text-[#468E36] mr-3" size={20} />
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-medium text-gray-900">{quote.userPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Requested Items</h2>
        
        {quote.items && quote.items.length > 0 ? (
          <>
            <div className="grid gap-4">
              {quote.items.map((item, index) => (
                <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package size={32} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <div className="mb-2 md:mb-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                          )}
                          {item.sku && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Hash size={14} className="mr-1" />
                              SKU: {item.sku}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:items-end space-y-2">
                          <div className="flex items-center text-sm">
                            <DollarSign size={16} className="text-[#468E36] mr-1" />
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.price)}
                            </span>
                            <span className="text-gray-500 ml-1">each</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Package size={16} className="text-[#468E36] mr-1" />
                            <span className="font-medium text-gray-900">
                              Qty: {item.quantity}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600">Subtotal</p>
                            <p className="text-lg font-bold text-[#468E36]">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Quote Total</h3>
                  <p className="text-sm text-gray-600">
                    {quote.items.length} items • {quote.items.reduce((sum, item) => sum + item.quantity, 0)} total quantity
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#468E36]">
                    {formatCurrency(calculateTotal())}
                  </p>
                  <p className="text-sm text-gray-600">Estimated Total</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items</h3>
            <p className="text-gray-500">This quote doesn't contain any items.</p>
          </div>
        )}
      </div>

      {/* Additional Notes */}
      {quote.notes && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Notes</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};