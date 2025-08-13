import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  Send,
  Users,
  Search,
  Filter,
  Edit3,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Paperclip,
  Image,
  FileText,
  Download,
  X,
  Upload,
} from "lucide-react";
import {
  fetchBookingMails,
  fetchMailHistory,
  sendIndividualMail,
  broadcastMail,
  addFileAttachment, // Changed from uploadAttachment
  startComposing,
  updateMailSubject,
  updateMailMessage,
  removeAttachment,
  clearAttachments,
  clearComposition,
  setSearchQuery,
  setStatusFilter,
  clearError,
  selectFilteredMails,
  selectMailComposition,
  selectMailHistory,
  selectMailerLoading,
  selectSendingMail,
  selectUploadingAttachment,
  selectMailerError,
  selectSearchQuery,
  selectStatusFilter,
  selectMailerStats,
} from "../../../store/slices/mailer";
import {
  notifySuccess,
  notifyError,
  notifyInfo,
} from "../../../utils/toastify";

const MailerScreen = () => {
  const dispatch = useDispatch();
  const filteredMails = useSelector(selectFilteredMails);
  const mailComposition = useSelector(selectMailComposition);
  console.log("Sending email to:", mailComposition);
  console.log("Subject:", mailComposition.subject);
  console.log("Message:", mailComposition.message);
  const mailHistory = useSelector(selectMailHistory);
  const loading = useSelector(selectMailerLoading);
  const sendingMail = useSelector(selectSendingMail);
  const uploadingAttachment = useSelector(selectUploadingAttachment);
  const fetchingHistory = useSelector(
    (state) => state.mailer?.fetchingHistory || false
  );
  const error = useSelector(selectMailerError);
  const searchQuery = useSelector(selectSearchQuery);
  const statusFilter = useSelector(selectStatusFilter);
  const stats = useSelector(selectMailerStats);

  const [selectedMails, setSelectedMails] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBookingMails());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      notifyError(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleStartComposing = (type, recipient = null) => {
    dispatch(startComposing({ type, recipient }));

    // Auto-select all emails when starting broadcast composition
    if (type === "broadcast") {
      setSelectedMails(filteredMails.map((mail) => mail.id));
    }
  };

  const handleSendIndividual = async () => {
    if (
      !mailComposition.recipient?.email ||
      !mailComposition.subject.trim() ||
      !mailComposition.message.trim()
    ) {
      notifyError("Please select a recipient and fill in subject and message");
      return;
    }

    try {
      await dispatch(
        sendIndividualMail({
          email: mailComposition.recipient.email,
          subject: mailComposition.subject,
          message: mailComposition.message,
          customerName: mailComposition.recipient.customerName,
          attachments: mailComposition.attachments,
        })
      ).unwrap();

      notifySuccess(
        `Email sent successfully to ${mailComposition.recipient.customerName}`
      );
      dispatch(clearComposition());
    } catch (err) {
      notifyError("Failed to send this email");
    }
  };

  const handleBroadcast = async () => {
    if (!mailComposition.subject.trim() || !mailComposition.message.trim()) {
      notifyError("Please fill in both subject and message");
      return;
    }

    const recipients =
      selectedMails.length > 0
        ? filteredMails.filter((mail) => selectedMails.includes(mail.id))
        : filteredMails;

    if (recipients.length === 0) {
      notifyError("No recipients selected");
      return;
    }

    try {
      await dispatch(
        broadcastMail({
          subject: mailComposition.subject,
          message: mailComposition.message,
          recipients: recipients.map((mail) => ({
            email: mail.email,
            customerName: mail.customerName,
          })),
          attachments: mailComposition.attachments,
        })
      ).unwrap();

      notifySuccess(`Email broadcast sent to ${recipients.length} recipients`);
      setSelectedMails([]);
    } catch (err) {
      notifyError("Failed to broadcast email");
    }
  };

  const handleSelectMail = (mailId) => {
    setSelectedMails((prev) =>
      prev.includes(mailId)
        ? prev.filter((id) => id !== mailId)
        : [...prev, mailId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMails(
      selectedMails.length === filteredMails.length
        ? []
        : filteredMails.map((mail) => mail.id)
    );
  };

  // File handling functions
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  // FAST - Process all files in parallel and batch notifications
  const handleFiles = async (files) => {
    const validFiles = files.filter((file) => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        notifyError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/csv",
      ];

      if (!allowedTypes.includes(file.type)) {
        notifyError(`File type ${file.type} is not supported for ${file.name}`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // OPTIMIZED: Process all files in parallel
    try {
      const results = await Promise.allSettled(
        validFiles.map((file) => dispatch(addFileAttachment(file)).unwrap())
      );

      // Batch process results for better performance
      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successful.push(validFiles[index].name);
        } else {
          failed.push(validFiles[index].name);
        }
      });

      // Single batch notifications instead of one per file
      if (successful.length > 0) {
        if (successful.length === 1) {
          notifySuccess(`${successful[0]} added successfully`);
        } else {
          notifySuccess(`${successful.length} files added successfully`);
        }
      }

      if (failed.length > 0) {
        if (failed.length === 1) {
          notifyError(`Failed to add ${failed[0]}`);
        } else {
          notifyError(`Failed to add ${failed.length} files`);
        }
      }
    } catch (error) {
      console.error("Error processing files:", error);
      notifyError("Error processing some files");
    }
  };

  // const handleFiles = async (files) => {
  //   const validFiles = files.filter((file) => {
  //     // Check file size (10MB limit)
  //     if (file.size > 10 * 1024 * 1024) {
  //       notifyError(`File ${file.name} is too large. Maximum size is 10MB.`);
  //       return false;
  //     }

  //     // Check file type
  //     const allowedTypes = [
  //       "image/jpeg",
  //       "image/png",
  //       "image/gif",
  //       "image/webp",
  //       "application/pdf",
  //       "application/msword",
  //       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //       "application/vnd.ms-excel",
  //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //       "text/plain",
  //       "text/csv",
  //     ];

  //     if (!allowedTypes.includes(file.type)) {
  //       notifyError(`File type ${file.type} is not supported for ${file.name}`);
  //       return false;
  //     }

  //     return true;
  //   });

  //   if (validFiles.length === 0) return;

  //   // Add files one by one
  //   for (const file of validFiles) {
  //     try {
  //       await dispatch(addFileAttachment(file)).unwrap(); // Changed from uploadAttachment
  //       notifySuccess(`${file.name} added successfully`);
  //     } catch (err) {
  //       notifyError(`Failed to add ${file.name}`);
  //     }
  //   }
  // };

  const handleHistoryToggle = async () => {
    if (!showHistory) {
      try {
        await dispatch(fetchMailHistory()).unwrap();
        notifyInfo("Mail history loaded");
      } catch (err) {
        notifyError("Failed to load mail history");
      }
    }
    setShowHistory(!showHistory);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    dispatch(removeAttachment(attachmentId));
    notifyInfo("Attachment removed");
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <Image className="w-4 h-4" />;
    } else {
      return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mail Center</h1>
        <p className="text-gray-600">Send emails to your booking customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Recipients
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRecipients}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sent Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.emailsSentToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.emailsSentThisMonth}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Sent</p>
              <p className="text-sm font-bold text-gray-900">
                {stats.lastEmailSent
                  ? new Date(stats.lastEmailSent).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mail List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Customer Emails
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartComposing("broadcast")}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Broadcast
                  </button>

                  <button
                    // onClick={() => setShowHistory(!showHistory)}
                    onClick={handleHistoryToggle}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    History
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>

              {/* Select All */}
              {filteredMails.length > 0 && (
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMails.length === filteredMails.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    Select All ({selectedMails.length} selected)
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading emails...</p>
                </div>
              ) : filteredMails.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No emails found</p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto divide-y divide-gray-200">
                  {filteredMails.map((mail) => (
                    <div
                      key={mail.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedMails.includes(mail.id)}
                          onChange={() => handleSelectMail(mail.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="p-2 bg-gray-100 rounded-full">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {mail.customerName}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                  {mail.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 flex-shrink-0">
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                                onClick={() =>
                                  handleStartComposing("individual", {
                                    email: mail.email,
                                    customerName: mail.customerName,
                                  })
                                }
                              >
                                <Send className="w-3 h-3 mr-1.5" />
                                Send Mail
                              </button>

                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  mail.status
                                )}`}
                              >
                                {getStatusIcon(mail.status)}
                                <span className="ml-1 capitalize">
                                  {mail.status}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <span>{mail.eventType}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {new Date(mail.bookingDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mail Composition */}
        <div className="lg:col-span-1">
          {mailComposition.isComposing ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {mailComposition.type === "individual"
                      ? "Send Email"
                      : "Broadcast Email"}
                  </h3>
                  <button
                    onClick={() => dispatch(clearComposition())}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* To Section - Enhanced for Individual Emails */}
                {mailComposition.type === "individual" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      To
                    </label>
                    {mailComposition.recipient ? (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900">
                              {mailComposition.recipient.customerName}
                            </p>
                            <p className="text-sm text-blue-700">
                              {mailComposition.recipient.email}
                            </p>
                          </div>
                          <div className="flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Selected
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Please select a recipient from the customer list
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Broadcast Recipients Info */}
                {mailComposition.type === "broadcast" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Recipients
                    </label>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-purple-900">
                            Broadcasting to{" "}
                            {selectedMails.length > 0
                              ? selectedMails.length
                              : filteredMails.length}{" "}
                            recipients
                          </p>
                          <p className="text-sm text-purple-700">
                            {selectedMails.length > 0
                              ? "Selected customers only"
                              : "All filtered customers"}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                          <Users className="w-3 h-3 mr-1" />
                          {selectedMails.length > 0
                            ? selectedMails.length
                            : filteredMails.length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={mailComposition.subject}
                    onChange={(e) =>
                      dispatch(updateMailSubject(e.target.value))
                    }
                    placeholder="Enter email subject..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={mailComposition.message}
                    onChange={(e) =>
                      dispatch(updateMailMessage(e.target.value))
                    }
                    placeholder="Enter your message..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Attachments Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>

                  {/* Drag and Drop Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag files here or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        Images, PDFs, Documents (Max 10MB each)
                      </p>
                    </div>
                  </div>

                  {/* Attachment List */}
                  {mailComposition.attachments &&
                    mailComposition.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {mailComposition.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {getFileIcon(attachment.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {attachment.preview && (
                                <a
                                  href={attachment.preview}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() =>
                                  handleRemoveAttachment(attachment.id)
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {uploadingAttachment && (
                    <div className="mt-2 flex items-center text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Adding attachment...
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={
                      mailComposition.type === "individual"
                        ? handleSendIndividual
                        : handleBroadcast
                    }
                    disabled={sendingMail}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                        {mailComposition.attachments &&
                          mailComposition.attachments.length > 0 && (
                            <span className="ml-1 bg-blue-500 text-xs px-1.5 py-0.5 rounded-full">
                              {mailComposition.attachments.length}
                            </span>
                          )}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => dispatch(clearComposition())}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Compose Email
                </h3>
                <p className="text-gray-600 mb-6">
                  Select an option to start composing your email
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleStartComposing("individual")}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Individual Email
                  </button>

                  <button
                    onClick={() => handleStartComposing("broadcast")}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Broadcast Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mail History */}
          {showHistory && (
            <div className="mt-6 bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Recent Emails
                  </h3>
                  <button
                    onClick={() => dispatch(fetchMailHistory())}
                    disabled={fetchingHistory}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {fetchingHistory ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {fetchingHistory ? (
                  /* ADD loading state */
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading history...</p>
                  </div>
                ) : mailHistory.length === 0 ? (
                  <div className="p-6 text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No email history</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {mailHistory.slice(0, 10).map((mail) => (
                      <div key={mail.id || mail._id} className="p-4">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-1.5 rounded-full ${
                              mail.type === "broadcast"
                                ? "bg-purple-100"
                                : "bg-blue-100"
                            }`}
                          >
                            {mail.type === "broadcast" ? (
                              <Users
                                className={`w-3 h-3 ${
                                  mail.type === "broadcast"
                                    ? "text-purple-600"
                                    : "text-blue-600"
                                }`}
                              />
                            ) : (
                              <User className="w-3 h-3 text-blue-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {mail.subject}
                              </p>
                              {mail.attachments &&
                                mail.attachments.length > 0 && (
                                  <Paperclip className="w-3 h-3 text-gray-400" />
                                )}
                              {/* ADD status indicator */}
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  mail.status === "sent"
                                    ? "bg-green-100 text-green-800"
                                    : mail.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : mail.status === "partial"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {mail.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {mail.type === "broadcast"
                                ? `Sent to ${
                                    mail.recipientCount ||
                                    mail.recipients?.length ||
                                    0
                                  } recipients`
                                : `Sent to ${
                                    mail.recipientName || mail.customerName
                                  }`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                mail.sentAt || mail.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailerScreen;
