// First, create the InvoiceHandler component as a separate file
// components/InvoiceHandler.jsx

import React, { useState } from 'react';
import { FileText, Mail, Download, X, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { validatePhoneNumber } from '../../../utils/validatePhoneNumber';

const InvoiceHandler = ({ invoiceData, onClose, onSuccess }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [error, setError] = useState(null);

  const customerPhoneValidation = validatePhoneNumber(invoiceData.customer.phone);

  // Plain-text version of the invoice for WhatsApp (no HTML support there)
  const buildWhatsAppMessage = () => {
    const allServices = [
      ...invoiceData.services,
      ...invoiceData.additionalServices.filter((s) => s.total > 0 || s.price > 0),
    ];

    const itemLines = allServices
      .map((s) => {
        const amount = s.total || s.price || 0;
        return `• ${s.name} x${s.quantity || 1} — ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
      })
      .join('\n');

    const bank = invoiceData.company.bankDetails || {};
    const bankLines = bank.accountNumber
      ? `\n*Bank Details:*\n${bank.bankName || ''} - ${bank.accountName || ''}\nAcct No: ${bank.accountNumber}\n`
      : '';

    return `*Invoice ${invoiceData.invoiceNumber}*
From: ${invoiceData.company.name}

Hi ${invoiceData.customer.name}, here's your invoice:

${itemLines}

Subtotal: ₦${invoiceData.subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
Tax (${(invoiceData.taxRate * 100).toFixed(1)}%): ₦${invoiceData.tax.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
*Total: ₦${invoiceData.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}*
${invoiceData.requiresDeposit ? `Deposit required (50%): ₦${invoiceData.depositAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}\n` : ''}
Due date: ${new Date(invoiceData.dueDate).toLocaleDateString()}
${bankLines}
Thank you for choosing ${invoiceData.company.name}!`;
  };

  // Shared invoice markup: styles + body content, reused by the full HTML doc
  // (for email) and the bare fragment (for html2pdf, which can't parse a full
  // <html>/<head>/<body> document reliably when injected into a container div).
  const buildInvoiceStyles = () => `
          @page {
            margin: 0.5in;
            size: A4;
          }
          body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #333;
            line-height: 1.4;
            font-size: 12px;
          }
          .invoice-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 30px;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
          }
          .invoice-title { 
            font-size: 36px; 
            font-weight: bold; 
            color: #4F46E5;
            margin: 0;
            letter-spacing: 2px;
          }
          .company-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .info-section { 
            display: inline-block; 
            width: 48%; 
            vertical-align: top;
            margin-bottom: 20px;
          }
          .section-title { 
            font-size: 14px; 
            font-weight: bold; 
            margin-bottom: 10px;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .company-details {
            font-weight: bold;
            font-size: 16px;
            color: #1F2937;
            margin-bottom: 5px;
          }
          .event-details { 
            background: linear-gradient(135deg, #F3F4F6, #E5E7EB); 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #4F46E5;
          }
          .services-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .services-table th, .services-table td { 
            border: 1px solid #D1D5DB; 
            padding: 12px 8px; 
            text-align: left;
          }
          .services-table th { 
            background: linear-gradient(135deg, #F9FAFB, #F3F4F6); 
            font-weight: bold;
            color: #374151;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .services-table tbody tr:nth-child(even) {
            background: #F9FAFB;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals-section { 
            margin-top: 30px;
            border-top: 2px solid #E5E7EB;
            padding-top: 20px;
          }
          .totals-table { 
            width: 350px; 
            margin-left: auto;
            font-size: 13px;
          }
          .totals-table td { 
            padding: 8px 15px;
            border: none;
          }
          .total-row { 
            font-weight: bold; 
            font-size: 18px;
            border-top: 2px solid #374151;
            background: linear-gradient(135deg, #F9FAFB, #F3F4F6);
          }
          .required-badge {
            background: linear-gradient(135deg, #FEF3C7, #FDE68A);
            color: #92400E;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .service-description {
            font-size: 10px;
            color: #6B7280;
            margin-top: 3px;
            font-style: italic;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #6B7280;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
  `;

  const buildInvoiceBody = (invoiceData) => {
    const allServices = [...invoiceData.services, ...invoiceData.additionalServices.filter(s => s.total > 0)];

    return `
        <div class="invoice-header">
          <div>
            <h1 class="invoice-title">INVOICE</h1>
            <div style="margin-top: 15px; font-size: 12px;">
              <div><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</div>
              <div><strong>Issue Date:</strong> ${new Date(invoiceData.issueDate).toLocaleDateString()}</div>
              <div><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="invoice-details">
            <div class="company-logo">LOGO</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div class="info-section">
            <div class="section-title">From:</div>
            <div class="company-details">${invoiceData.company.name}</div>
            <div>${invoiceData.company.address}</div>
            <div>${invoiceData.company.city}, ${invoiceData.company.state}</div>
            <div>${invoiceData.company.country}</div>
            <div style="margin-top: 8px;">
              <div><strong>Phone:</strong> ${invoiceData.company.phone}</div>
              <div><strong>Email:</strong> ${invoiceData.company.email}</div>
            </div>
          </div>
          
          <div class="info-section">
            <div class="section-title">Bill To:</div>
            <div class="company-details">${invoiceData.customer.name}</div>
            <div>${invoiceData.customer.email}</div>
            <div>${invoiceData.customer.phone}</div>
            <div style="margin-top: 8px;">${invoiceData.customer.address}</div>
          </div>
        </div>

        <div class="event-details">
          <div class="section-title">Event Details</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 11px;">
            <div><strong>Type:</strong> ${invoiceData.event.type}</div>
            <div><strong>Date:</strong> ${new Date(invoiceData.event.date).toLocaleDateString()}</div>
            <div><strong>Time:</strong> ${invoiceData.event.time}</div>
            <div><strong>Guests:</strong> ${invoiceData.event.guests}</div>
            <div style="grid-column: 1 / -1;"><strong>Location:</strong> ${invoiceData.event.location}</div>
          </div>
        </div>

        <table class="services-table">
          <thead>
            <tr>
              <th style="width: 50%;">Service Description</th>
              <th class="text-center" style="width: 10%;">Qty</th>
              <th class="text-right" style="width: 20%;">Unit Price</th>
              <th class="text-right" style="width: 20%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${allServices.map(service => `
              <tr>
                <td>
                  <div style="font-weight: bold; font-size: 11px;">${service.name}</div>
                  ${service.description ? `<div class="service-description">${service.description}</div>` : ''}
                  ${service.required ? '<span class="required-badge">Required</span>' : ''}
                </td>
                <td class="text-center">${service.quantity}</td>
                <td class="text-right">₦${service.unitPrice.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
                <td class="text-right"><strong>₦${service.total.toLocaleString('en-NG', {minimumFractionDigits: 2})}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">₦${invoiceData.subtotal.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
              <td>Tax (${(invoiceData.taxRate * 100).toFixed(1)}%):</td>
              <td class="text-right">₦${invoiceData.tax.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total Amount:</strong></td>
              <td class="text-right"><strong>₦${invoiceData.total.toLocaleString('en-NG', {minimumFractionDigits: 2})}</strong></td>
            </tr>
            ${invoiceData.requiresDeposit ? `
            <tr style="color: #EA580C; font-weight: bold;">
              <td>Deposit Required (50%):</td>
              <td class="text-right">₦${invoiceData.depositAmount.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${invoiceData.notes || invoiceData.terms ? `
        <div style="margin-top: 40px;">
          ${invoiceData.notes ? `
          <div style="margin-bottom: 25px;">
            <div class="section-title">Notes</div>
            <div style="background: #F9FAFB; padding: 15px; border-radius: 6px; border-left: 4px solid #4F46E5;">${invoiceData.notes}</div>
          </div>
          ` : ''}
          
          ${invoiceData.terms ? `
          <div>
            <div class="section-title">Terms & Conditions</div>
            <div style="font-size: 11px; line-height: 1.5; color: #4B5563;">${invoiceData.terms}</div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="footer">
          <div><strong>Thank you for your business!</strong></div>
          <div style="margin-top: 8px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
          <div style="margin-top: 5px;">This invoice was automatically generated and is valid without signature.</div>
        </div>
    `;
  };

  // Full standalone HTML document — used as the email payload's htmlContent
  const generatePDF = (invoiceData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>${buildInvoiceStyles()}</style>
      </head>
      <body>${buildInvoiceBody(invoiceData)}</body>
      </html>
    `;

  const pdfFilename = `Invoice-${invoiceData.invoiceNumber}.pdf`;

  // Renders the invoice fragment to a real PDF Blob via html2pdf (html2canvas + jsPDF).
  // The source element has to be in the DOM (off-screen) for html2canvas to lay it
  // out and measure it correctly — a detached node renders blank/garbled.
  const generateInvoicePdfBlob = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const container = document.createElement('div');
    container.innerHTML = `<style>${buildInvoiceStyles()}</style>${buildInvoiceBody(invoiceData)}`;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '-9999px';
    container.style.width = '794px'; // ~A4 at 96dpi, keeps layout consistent off-screen
    document.body.appendChild(container);

    try {
      return await html2pdf()
        .set({
          margin: 0.4,
          filename: pdfFilename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        })
        .from(container)
        .outputPdf('blob');
    } finally {
      document.body.removeChild(container);
    }
  };

  // Handle PDF download — generates a real PDF file and saves it directly
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await generateInvoicePdfBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onSuccess?.('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Shares the actual invoice PDF via the device's native share sheet (WhatsApp
  // shows up there if installed, with the PDF pre-attached — the admin still picks
  // the chat/contact themselves, since wa.me links can't carry attachments).
  // Falls back to downloading the PDF + opening a prefilled WhatsApp text chat on
  // browsers/devices without file-sharing support (e.g. desktop Firefox).
  const handleSendWhatsAppPdf = async () => {
    setError(null);

    if (!customerPhoneValidation.isValid) {
      setError('No valid WhatsApp number on file for this customer.');
      return;
    }

    setIsSharingWhatsApp(true);
    try {
      const blob = await generateInvoicePdfBlob();
      const file = new File([blob], pdfFilename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${invoiceData.invoiceNumber}`,
          text: `Invoice ${invoiceData.invoiceNumber} for ${invoiceData.customer.name}`,
        });
        onSuccess?.('Share sheet opened — pick WhatsApp to send the invoice PDF.');
        return;
      }

      // Fallback: no file-sharing support here, so download the PDF and open a
      // prefilled WhatsApp chat with a reminder to attach it manually.
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const phone = customerPhoneValidation.international.replace('+', '');
      const message = `${buildWhatsAppMessage()}\n\n📎 PDF downloaded as "${pdfFilename}" — please attach it to this chat.`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      onSuccess?.('PDF downloaded and WhatsApp opened — attach the file to send it.');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share invoice PDF:', err);
        setError(err.message || 'Failed to share invoice PDF');
      }
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  // Handle email sending
  const handleSendEmail = async () => {
    setIsSending(true);
    setError(null);

    try {
      // Prepare the invoice data for the API
      const emailData = {
        invoiceData: {
          ...invoiceData,
          // Ensure all required fields are present
          htmlContent: generatePDF(invoiceData)
        },
        customerEmail: invoiceData.customer.email,
        customerName: invoiceData.customer.name
      };

      // Make API call to send invoice
      const response = await fetch(`${import.meta.env.VITE_SERVER_BASEURL}api/bookings/send-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send invoice');
      }

      const result = await response.json();
      
      onSuccess?.(`Invoice sent successfully to ${invoiceData.customer.email}!`);
      
    } catch (error) {
      console.error('Failed to send invoice:', error);
      setError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-red-800 text-sm font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bloom-green-600 text-white rounded-lg hover:bg-bloom-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <Download size={16} />
              Download PDF
            </>
          )}
        </button>

        <button
          onClick={handleSendEmail}
          disabled={isSending || !invoiceData.customer.email}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bloom-rose-600 text-white rounded-lg hover:bg-bloom-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Sending...
            </>
          ) : (
            <>
              <Mail size={16} />
              Send Email
            </>
          )}
        </button>

        <button
          onClick={handleSendWhatsAppPdf}
          disabled={!customerPhoneValidation.isValid || isSharingWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#1ebc59] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSharingWhatsApp ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Preparing PDF...
            </>
          ) : (
            <>
              <MessageCircle size={16} />
              Send to WhatsApp
            </>
          )}
        </button>
      </div>

      <div className="text-sm text-gray-600 text-center space-y-1">
        <div>
          {invoiceData.customer.email ? (
            <>Email: <span className="font-medium">{invoiceData.customer.email}</span></>
          ) : (
            <span className="text-red-600">No email address available</span>
          )}
        </div>
        <div>
          {customerPhoneValidation.isValid ? (
            <>WhatsApp: <span className="font-medium">{customerPhoneValidation.international}</span></>
          ) : (
            <span className="text-red-600">No valid WhatsApp number on file</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceHandler;