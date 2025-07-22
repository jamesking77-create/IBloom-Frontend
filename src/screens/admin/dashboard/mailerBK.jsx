import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Mail,
  Send,
  Users,
  Search,
  Clock,
  User,
  Upload,
  Download,
  X,
} from 'lucide-react';
import {
  fetchBookingMails,
  sendIndividualMail,
  startComposing,
  updateMailSubject,
  updateMailMessage,
  removeAttachment,
  clearAttachments,
  clearComposition,
  selectFilteredMails,
  selectMailComposition,
  selectMailHistory,
  selectMailerLoading,
  selectSendingMail,
  selectUploadingAttachment,
  selectMailerError,
  selectMailerStats,
  clearError,
} from '../../../store/slices/mailer';
import { notifySuccess, notifyError } from '../../../utils/toastify';

const MailerScreen = () => {
  const dispatch = useDispatch();
  const filteredMails = useSelector(selectFilteredMails);
  const mailComposition = useSelector(selectMailComposition);
  const mailHistory = useSelector(selectMailHistory);
  const loading = useSelector(selectMailerLoading);
  const sendingMail = useSelector(selectSendingMail);
  const uploadingAttachment = useSelector(selectUploadingAttachment);
  const error = useSelector(selectMailerError);
  const stats = useSelector(selectMailerStats);

  const [selectedMails, setSelectedMails] = useState([]);
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mailer</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredMails.map((mail) => (
            <div key={mail.id} className="border rounded p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{mail.customerName}</p>
                  <p className="text-sm text-gray-500">{mail.email}</p>
                </div>
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() =>
                    handleStartComposing('individual', {
                      email: mail.email,
                      customerName: mail.customerName,
                    })
                  }
                >
                  Send Mail
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded shadow p-4">
          {mailComposition?.isComposing && mailComposition.type === 'individual' ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Compose Email</h2>

              <div className="mb-2">
                <label className="text-sm font-medium">To</label>
                <p>{mailComposition.recipient?.customerName} ({mailComposition.recipient?.email})</p>
              </div>

              <div className="mb-2">
                <label className="text-sm font-medium">Subject</label>
                <input
                  type="text"
                  value={mailComposition.subject}
                  onChange={(e) => dispatch(updateMailSubject(e.target.value))}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  rows={5}
                  value={mailComposition.message}
                  onChange={(e) => dispatch(updateMailMessage(e.target.value))}
                  className="w-full border p-2 rounded"
                ></textarea>
              </div>

              <button
                onClick={handleSendIndividual}
                disabled={sendingMail}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {sendingMail ? 'Sending...' : 'Send'}
              </button>
            </div>
          ) : (
            <p>Select a user to start composing</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailerScreen;
