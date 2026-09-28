import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200">
            Reach Out To Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-title text-emerald-950 mt-3 mb-4">
            Contact & Campus Location
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            We welcome parents, guardians, and prospective students to visit our campus or contact our administration directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 shadow-sm p-8 space-y-6">
            <h3 className="text-xl font-bold text-emerald-950 font-serif-title border-b border-slate-100 pb-3">
              Official Madrasa Information
            </h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Campus Address:</h4>
                  <p className="text-slate-600 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    Umer Medical Store, Karmanwala Bazar, Kot Lakhpat Station, Lahore, Punjab, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Administrative Helplines:</h4>
                  <div className="flex flex-col gap-1 mt-1">
                    <a href="tel:03224616821" className="text-emerald-700 hover:text-emerald-900 font-semibold text-sm">
                      03224616821 (Primary / WhatsApp)
                    </a>
                    <a href="tel:03314925285" className="text-emerald-700 hover:text-emerald-900 font-semibold text-sm">
                      03314925285 (Secondary)
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Email Address:</h4>
                  <a href="mailto:h26195467@gmail.com" className="text-emerald-700 hover:text-emerald-900 font-medium text-sm mt-0.5 block">
                    h26195467@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Office & Class Hours:</h4>
                  <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                    Monday to Saturday: 4:00 PM – 8:00 PM (Pakistan Standard Time)
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="pt-4 border-t border-slate-100">
              <a
                href="https://wa.me/923224616821?text=As-salamu%20alaykum,%20I%20would%20like%20to%20inquire%20about%20admissions%20at%20Madrassa%20Arabiyyah%20Misbah%20Ul%20Quran%20For%20Huffaz."
                target="_blank"
                rel="noreferrer"
                id="contact-whatsapp-btn"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Directly on WhatsApp (03224616821)</span>
              </a>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="bg-white rounded-2xl border border-emerald-900/15 shadow-sm p-8">
            <h3 className="text-xl font-bold text-emerald-950 font-serif-title border-b border-slate-100 pb-3 mb-6">
              Send an Inquiry
            </h3>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-emerald-950">Thank you for contacting us!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  We have received your message. Our administration will contact you shortly on {phone}.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="inquiry-name"
                    placeholder="e.g. Muhammad Farooq"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    id="inquiry-phone"
                    placeholder="e.g. 03224616821"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inquiry Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    id="inquiry-message"
                    rows={4}
                    placeholder="Please specify course interest, student age, or any queries..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  id="inquiry-submit-btn"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Administration</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
