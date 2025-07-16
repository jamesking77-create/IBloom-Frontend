// components/ConfirmModal.js
import React from "react";

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-[90%] max-w-md">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
