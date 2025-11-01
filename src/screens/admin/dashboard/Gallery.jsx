import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Trash2, X, ImageIcon } from "lucide-react";
import {
  fetchGallery,
  uploadMedia,
  deleteMedia,
} from "../../../store/slices/gallery-slice";
import { notifyError, notifySuccess } from "../../../utils/toastify";

// Optimized media card with lazy loading
const MediaCard = React.memo(({ item, onDelete }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(item._id || item.id);
  };

  return (
    <div
      ref={imgRef}
      className={`relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
        isDeleting ? "opacity-50 scale-95" : ""
      }`}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-300" />
        </div>
      )}

      {/* Media content */}
      {item.type?.startsWith("video") ? (
        <video
          src={item.url}
          controls
          className={`w-full h-64 object-cover ${isLoaded ? "block" : "hidden"}`}
          onLoadedData={() => setIsLoaded(true)}
        />
      ) : (
        <img
          src={item.url}
          alt="Gallery media"
          loading="lazy"
          className={`w-full h-64 object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* Delete button with smooth hover effect */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg disabled:cursor-not-allowed"
        aria-label="Delete media"
      >
        <Trash2 size={18} />
      </button>

      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
});

// Preview card component
const PreviewCard = React.memo(({ src, index, onRemove }) => (
  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl overflow-hidden group">
    <img
      src={src}
      alt={`Preview ${index + 1}`}
      className="w-full h-40 object-cover opacity-80"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/60 to-transparent flex flex-col items-center justify-center">
      <span className="text-white text-sm font-semibold mb-1">Ready to upload</span>
      <button
        onClick={onRemove}
        className="bg-white text-blue-600 p-1 rounded-full hover:bg-blue-100 transition-colors"
        aria-label="Remove preview"
      >
        <X size={16} />
      </button>
    </div>
  </div>
));

export default function Gallery() {
  const dispatch = useDispatch();
  const { items, loading, uploading } = useSelector(
    (state) => state.gallery || {}
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles(files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(newPreviews);
  }, [previews]);

  const removePreview = useCallback((index) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFiles.length) return notifyError("Select files to upload.");

    try {
      await dispatch(uploadMedia(selectedFiles)).unwrap();
      notifySuccess("Upload complete!");
      setSelectedFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      notifyError(err || "Upload failed");
    }
  }, [dispatch, selectedFiles, previews]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await dispatch(deleteMedia(id)).unwrap();
        notifySuccess("Deleted successfully!");
      } catch (err) {
        notifyError(err || "Delete failed");
      }
    },
    [dispatch]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Gallery</h2>
          <p className="text-gray-600">Upload and manage your media collection</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                <Upload className="text-gray-400" size={20} />
                <span className="text-gray-600 font-medium">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "Choose images or videos"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFiles.length}
              className={`px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md ${
                uploading || !selectedFiles.length
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-105"
              }`}
            >
              <Upload size={18} />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Preview ({previews.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {previews.map((src, i) => (
                  <PreviewCard
                    key={i}
                    src={src}
                    index={i}
                    onRemove={() => removePreview(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gallery Display */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        ) : items?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <MediaCard
                key={item._id || item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ImageIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No media uploaded yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Upload your first image or video to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}