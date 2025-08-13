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
  addFileAttachment,
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
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-2 sm:mb-3">
              Mail Center
            </h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-medium">
              Send personalized emails to your booking customers
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-600 truncate">
                  Total Recipients
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">
                  {stats.totalRecipients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg">
                <Send className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-600 truncate">
                  Sent Today
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">
                  {stats.emailsSentToday}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-600 truncate">
                  This Month
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 truncate">
                  {stats.emailsSentThisMonth}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl shadow-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-600 truncate">
                  Last Sent
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {stats.lastEmailSent
                    ? new Date(stats.lastEmailSent).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Mail List */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 h-[500px] sm:h-[600px] lg:h-[700px] flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200/60 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    Customer Emails
                  </h2>

                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => handleStartComposing("broadcast")}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Users className="w-4 h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Broadcast</span>
                      <span className="sm:hidden">Cast</span>
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
                <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm placeholder-slate-400"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                    className="px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm min-w-[120px]"
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
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label className="ml-2 text-sm text-slate-600 font-medium">
                      Select All ({selectedMails.length} selected)
                    </label>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-slate-600 font-medium">
                      Loading emails...
                    </p>
                  </div>
                ) : filteredMails.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                      <Mail className="w-12 h-12 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">
                      No emails found
                    </p>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto divide-y divide-slate-100">
                    {filteredMails.map((mail) => (
                      <div
                        key={mail.id}
                        className="p-3 sm:p-4 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedMails.includes(mail.id)}
                            onChange={() => handleSelectMail(mail.id)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex-shrink-0">
                                  <User className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">
                                    {mail.customerName}
                                  </p>
                                  <p className="text-sm text-slate-600 truncate">
                                    {mail.email}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                                <button
                                  className="inline-flex items-center px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                  onClick={() =>
                                    handleStartComposing("individual", {
                                      email: mail.email,
                                      customerName: mail.customerName,
                                    })
                                  }
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  <span className="hidden sm:inline">Send</span>
                                  <span className="sm:hidden">Send</span>
                                </button>

                                <span
                                  className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                    mail.status
                                  )}`}
                                >
                                  {getStatusIcon(mail.status)}
                                  <span className="ml-1 capitalize hidden sm:inline">
                                    {mail.status}
                                  </span>
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center text-xs text-slate-500 font-medium">
                              <span className="truncate">{mail.eventType}</span>
                              <span className="mx-2 flex-shrink-0">•</span>
                              <span className="flex-shrink-0">
                                {new Date(
                                  mail.bookingDate
                                ).toLocaleDateString()}
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
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">
                      {mailComposition.type === "individual"
                        ? "Send Email"
                        : "Broadcast Email"}
                    </h3>
                    <button
                      onClick={() => dispatch(clearComposition())}
                      className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6 max-h-[600px] lg:max-h-[640px] overflow-y-auto">
                  {/* To Section - Enhanced for Individual Emails */}
                  {mailComposition.type === "individual" && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        To
                      </label>
                      {mailComposition.recipient ? (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-blue-900 truncate">
                                {mailComposition.recipient.customerName}
                              </p>
                              <p className="text-sm text-blue-700 truncate">
                                {mailComposition.recipient.email}
                              </p>
                            </div>
                            <div className="flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-semibold">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Selected
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/60">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <p className="text-sm text-amber-800 font-medium">
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
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Recipients
                      </label>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/60">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-purple-900">
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
                          <div className="flex items-center text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-semibold">
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={mailComposition.subject}
                      onChange={(e) =>
                        dispatch(updateMailSubject(e.target.value))
                      }
                      placeholder="Enter email subject..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={mailComposition.message}
                      onChange={(e) =>
                        dispatch(updateMailMessage(e.target.value))
                      }
                      placeholder="Enter your message..."
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Attachments Section */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Attachments
                    </label>

                    {/* Drag and Drop Area */}
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                        dragActive
                          ? "border-blue-500 bg-blue-50/50 scale-[1.02]"
                          : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/30"
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
                        <div className="p-3 bg-slate-100 rounded-full mb-3">
                          <Upload className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-600 mb-1 font-medium">
                          Drag files here or click to browse
                        </p>
                        <p className="text-xs text-slate-500">
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
                              className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 hover:bg-slate-100/80 transition-all duration-200"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                                  {getFileIcon(attachment.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-slate-500 font-medium">
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
                                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() =>
                                    handleRemoveAttachment(attachment.id)
                                  }
                                  className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-all duration-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {uploadingAttachment && (
                      <div className="mt-2 flex items-center text-sm text-blue-600 font-medium">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Adding attachment...
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={
                        mailComposition.type === "individual"
                          ? handleSendIndividual
                          : handleBroadcast
                      }
                      disabled={sendingMail}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
                              <span className="ml-2 bg-blue-500/80 text-xs px-2 py-1 rounded-full font-bold">
                                {mailComposition.attachments.length}
                              </span>
                            )}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => dispatch(clearComposition())}
                      className="px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-bold rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl w-fit mx-auto mb-6">
                    <Mail className="w-12 h-12 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Compose Email
                  </h3>
                  <p className="text-slate-600 mb-8 font-medium">
                    Select an option to start composing your email
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={() => handleStartComposing("individual")}
                      className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      <User className="w-5 h-5 mr-3" />
                      Individual Email
                    </button>

                    <button
                      onClick={() => handleStartComposing("broadcast")}
                      className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      <Users className="w-5 h-5 mr-3" />
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
    </div>
  );
};

export default MailerScreen;
