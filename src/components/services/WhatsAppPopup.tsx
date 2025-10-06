
import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface WhatsAppPopupProps {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  cost: string;
  onSend: (form: { name: string, phone: string, company: string, message: string }) => void;
}

const WhatsAppPopup: React.FC<WhatsAppPopupProps> = ({
  open, onClose, serviceName, cost, onSend
}) => {
  const { t, dir } = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', company: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    onSend(form);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white max-w-[92vw] w-full sm:w-[400px] rounded-lg shadow-2xl p-6 relative animate-in zoom-in-95" dir={dir}>
        {!sent ? (
          <>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 text-lg"
              aria-label={t('Close', 'إغلاق')}
              type="button"
            >×</button>
            <h2 className="text-xl font-bold mb-3 text-odoo-purple">
              {t('Request via WhatsApp', 'طلب عن طريق واتساب')}
            </h2>
            <div className="mb-2 text-sm font-semibold text-gray-700">
              {t('Service', 'الخدمة')}: <span className="font-bold">{serviceName}</span>
            </div>
            {cost && (
              <div className="mb-2 text-sm font-semibold text-orange-500">
                {t('Estimated Cost', 'التكلفة التقديرية')}: <span>{cost}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="font-medium text-gray-700 mb-1 block">{t('Name', 'الاسم')} *</label>
                <input
                  name="name"
                  type="text"
                  required
                  autoFocus
                  className="w-full p-2 border rounded"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('Your Name', 'اسمك')}
                />
              </div>
              <div>
                <label className="font-medium text-gray-700 mb-1 block">{t('Phone', 'الهاتف')} *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full p-2 border rounded"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('Phone Number', 'رقم الهاتف')}
                />
              </div>
              <div>
                <label className="font-medium text-gray-700 mb-1 block">{t('Company', 'الشركة')}</label>
                <input
                  name="company"
                  type="text"
                  className="w-full p-2 border rounded"
                  value={form.company}
                  onChange={handleChange}
                  placeholder={t('Company (optional)', 'الشركة (اختياري)')}
                />
              </div>
              <div>
                <label className="font-medium text-gray-700 mb-1 block">{t('Message', 'رسالتك')}</label>
                <textarea
                  name="message"
                  rows={2}
                  className="w-full p-2 border rounded"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t('Type any additional details...', 'اكتب تفاصيل إضافية...')}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded focus:outline-none transition"
              >
                {t('Send & Open WhatsApp', 'إرسال وفتح واتساب')}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <span className="block text-2xl mb-2 text-green-600">✅</span>
            <div className="text-lg font-semibold mb-1">{t('Thank you!', 'شكرًا لك!')}</div>
            <div className="text-gray-600">{t('Redirecting to WhatsApp...', 'جاري التحويل إلى واتساب...')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppPopup;
