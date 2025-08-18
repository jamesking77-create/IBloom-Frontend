import { get } from "../utils/api"; // Adjust path based on your utils location

// Public API endpoints - no authentication required

/**
 * Fetch public company information
 * @returns {Promise} Company information data
 */
export const getCompanyInfo = async () => {
  try {
    console.log("🌐 Fetching company info from public API...");
    const response = await get("/api/company/info");
    
    console.log("📦 Raw API Response:", response);
    console.log("📊 Company Data:", response?.data?.data?.company);
    
    // Log specific fields for mapping
    const companyData = response?.data?.data?.company;
    if (companyData) {
      console.log("🏢 Company Name:", companyData.name);
      console.log("📧 Email:", companyData.email);
      console.log("📱 Phone:", companyData.phone);
      console.log("📍 Location:", companyData.location);
      console.log("📝 Bio:", companyData.bio);
      console.log("🎯 Specializations:", companyData.specialize);
      console.log("📂 Categories:", companyData.categories);
      console.log("🗓️ Join Date:", companyData.joinDate);
      console.log("🖼️ Avatar:", companyData.avatar);
    }
    
    return response?.data?.data?.company;
  } catch (error) {
    console.error("❌ Error fetching company info:", error);
    console.error("📋 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Fetch public categories (if you have a separate public categories endpoint)
 * @returns {Promise} Categories data
 */
export const getPublicCategories = async () => {
  try {
    console.log("📂 Fetching public categories...");
    const response = await get("/api/public/categories");
    
    console.log("📦 Categories Response:", response);
    console.log("📂 Categories Data:", response?.data?.data);
    
    return response?.data?.data;
  } catch (error) {
    console.error("❌ Error fetching public categories:", error);
    throw error;
  }
};

/**
 * Fetch public gallery images (if you have this endpoint)
 * @returns {Promise} Gallery images data
 */
export const getPublicGallery = async () => {
  try {
    console.log("🖼️ Fetching public gallery...");
    const response = await get("/api/public/gallery");
    
    console.log("📦 Gallery Response:", response);
    console.log("🖼️ Gallery Data:", response?.data?.data);
    
    return response?.data?.data;
  } catch (error) {
    console.error("❌ Error fetching public gallery:", error);
    throw error;
  }
};

// Export all public API functions
export default {
  getCompanyInfo,
  getPublicCategories,
  getPublicGallery,
};