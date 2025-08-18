import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchCompanyInfo, 
  selectCompanyInfo, 
  selectPublicLoading, 
  selectPublicError,
  selectLastFetched 
} from "../store/slices/publicSlice";

const TestPublicData = () => {
  const dispatch = useDispatch();
  
  // Select data from the public slice
  const companyInfo = useSelector(selectCompanyInfo);
  const loading = useSelector(selectPublicLoading);
  const error = useSelector(selectPublicError);
  const lastFetched = useSelector(selectLastFetched);
  
  // Alternative way to select data
  // const { companyInfo, loading, error } = useSelector((state) => state.public);

  useEffect(() => {
    console.log("🚀 Testing public data fetch...");
    dispatch(fetchCompanyInfo());
  }, [dispatch]);

  // Log data whenever it changes
  useEffect(() => {
    if (companyInfo) {
      console.log("=== COMPANY INFO MAPPING ===");
      console.log("🏢 Company Name:", companyInfo.name);
      console.log("📧 Email:", companyInfo.email);
      console.log("📱 Phone:", companyInfo.phone);
      console.log("📍 Location:", companyInfo.location);
      console.log("📝 Bio:", companyInfo.bio);
      console.log("🎯 Specializations:", companyInfo.specialize);
      console.log("📂 Categories:", companyInfo.categories);
      console.log("🗓️ Join Date:", companyInfo.joinDate);
      console.log("🖼️ Avatar:", companyInfo.avatar);
      console.log("⏰ Last Fetched:", lastFetched);
      console.log("========================");
    }
  }, [companyInfo, lastFetched]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error("❌ Public Data Error:", error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700">🔄 Loading company information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">❌ Error: {error}</p>
        <button 
          onClick={() => dispatch(fetchCompanyInfo())}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Public Company Data Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">📋 Basic Information</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {companyInfo.name || 'Not set'}</p>
            <p><span className="font-medium">Email:</span> {companyInfo.email || 'Not set'}</p>
            <p><span className="font-medium">Phone:</span> {companyInfo.phone || 'Not set'}</p>
            <p><span className="font-medium">Location:</span> {companyInfo.location || 'Not set'}</p>
            <p><span className="font-medium">Join Date:</span> {companyInfo.joinDate || 'Not set'}</p>
          </div>
        </div>

        {/* Bio Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">📝 Bio</h2>
          <p className="text-sm text-gray-600">
            {companyInfo.bio || 'No bio available'}
          </p>
        </div>

        {/* Specializations Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">🎯 Specializations</h2>
          {companyInfo.specialize && companyInfo.specialize.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {companyInfo.specialize.map((spec, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No specializations set</p>
          )}
        </div>

        {/* Categories Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">📂 Categories</h2>
          {companyInfo.categories && companyInfo.categories.length > 0 ? (
            <div className="space-y-1">
              {companyInfo.categories.map((category) => (
                <div 
                  key={category.id}
                  className="p-2 bg-gray-50 rounded text-sm"
                >
                  <span className="font-medium">ID:</span> {category.id} - 
                  <span className="ml-1">{category.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No categories available</p>
          )}
        </div>
      </div>

      {/* Avatar */}
      {companyInfo.avatar && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">🖼️ Avatar</h2>
          <img 
            src={companyInfo.avatar} 
            alt="Company Avatar" 
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <p className="text-xs text-gray-500 mt-2">{companyInfo.avatar}</p>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">🔍 Debug Info</h2>
        <p className="text-xs text-gray-600">Last Fetched: {lastFetched}</p>
        <p className="text-xs text-gray-600">Loading: {loading ? 'Yes' : 'No'}</p>
        <p className="text-xs text-gray-600">Error: {error || 'None'}</p>
        
        <button 
          onClick={() => dispatch(fetchCompanyInfo())}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default TestPublicData;