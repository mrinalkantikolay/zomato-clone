import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, CreditCard, Wallet, Landmark, Zap, HelpCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════
   PAYMENT PAGE
   ═══════════════════════════════════════════════ */
const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Receive real data from Checkout via route state
  const { totalAmount: passedTotal, orderItems, address } = location.state || {};
  const amount = passedTotal || 0;

  const [activeTab, setActiveTab] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      number: '',
      expiry: '',
      cvv: '',
      name: '',
      upiId: '',
    },
  });

  /* Format card number on change */
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setValue('number', value);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) value = value.slice(0, 2) + ' / ' + value.slice(2);
    setValue('expiry', value);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setValue('cvv', value);
  };

  /* Simulate payment processing */
  const processPayment = async (paymentMethod) => {
    setIsProcessing(true);

    // Simulate 2-second payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success('Payment successful! 🎉');

    // Navigate to order confirmation
    navigate(`/orders/${orderId}/confirm`, {
      replace: true,
      state: {
        orderId,
        totalAmount: amount,
        orderItems,
        address,
        paymentMethod,
      },
    });

    setIsProcessing(false);
  };

  const onSubmitCard = () => processPayment('Card');
  const onSubmitUpi = () => processPayment('UPI');

  const tabs = [
    { id: 'card', icon: CreditCard, label: 'Card' },
    { id: 'upi', icon: Wallet, label: 'UPI' },
    { id: 'netbanking', icon: Landmark, label: 'Net Banking' },
  ];

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 py-12 animate-fade-in">
      {/* Back Button */}
      <div className="w-full max-w-lg mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-text-secondary hover:text-text-primary text-sm font-medium flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Payment Card */}
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-8 text-center border-b border-border/50">
          <p className="text-text-secondary text-sm uppercase tracking-widest font-medium mb-1">
            Order #{orderId?.slice(0, 12) || 'ORD-12345'}
          </p>
          <h1 className="text-2xl font-bold mb-4">Complete Payment</h1>
          <div className="flex flex-col items-center">
            <span className="text-text-secondary text-sm">Total Amount Payable</span>
            <span className="text-5xl font-black text-primary mt-1">₹{amount}</span>
          </div>
          {address && (
            <p className="text-xs text-text-muted mt-3">
              Delivering to: {address.street}, {address.city}
            </p>
          )}
        </div>

        {/* Payment Method Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Card Form ── */}
        {activeTab === 'card' && (
          <form onSubmit={handleSubmit(onSubmitCard)} className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Card Number */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    className={`input pl-12 ${errors.number ? 'border-danger' : ''}`}
                    placeholder="0000 0000 0000 0000"
                    {...register('number', {
                      required: 'Card number is required',
                      minLength: { value: 19, message: 'Enter a valid card number' },
                    })}
                    onChange={handleCardNumberChange}
                  />
                  <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                </div>
                {errors.number && (
                  <p className="text-danger text-xs">{errors.number.message}</p>
                )}
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Expiry Date
                  </label>
                  <input
                    className={`input ${errors.expiry ? 'border-danger' : ''}`}
                    placeholder="MM / YY"
                    {...register('expiry', { required: 'Expiry is required' })}
                    onChange={handleExpiryChange}
                  />
                  {errors.expiry && (
                    <p className="text-danger text-xs">{errors.expiry.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    CVV
                  </label>
                  <div className="relative">
                    <input
                      className={`input ${errors.cvv ? 'border-danger' : ''}`}
                      placeholder="•••"
                      type="password"
                      {...register('cvv', {
                        required: 'CVV is required',
                        minLength: { value: 3, message: 'Enter 3 digits' },
                      })}
                      onChange={handleCvvChange}
                    />
                    <HelpCircle size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  </div>
                  {errors.cvv && (
                    <p className="text-danger text-xs">{errors.cvv.message}</p>
                  )}
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Cardholder Name
                </label>
                <input
                  className={`input ${errors.name ? 'border-danger' : ''}`}
                  placeholder="Enter name as on card"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="text-danger text-xs">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock size={18} className="group-hover:scale-110 transition-transform" />
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${amount}`
                )}
              </button>
            </div>

            {/* Trust & Cancel */}
            <div className="flex flex-col items-center gap-6 pt-2">
              <div className="flex items-center gap-3 grayscale opacity-60">
                <span className="text-[10px] text-text-secondary uppercase font-bold">Secured by</span>
                <div className="flex items-center gap-1">
                  <Zap size={14} className="text-info" />
                  <span className="text-sm font-bold tracking-tighter">RAZORPAY</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors underline underline-offset-4 decoration-border"
              >
                Cancel Payment
              </button>
            </div>
          </form>
        )}

        {/* ── UPI Tab ── */}
        {activeTab === 'upi' && (
          <form onSubmit={handleSubmit(onSubmitUpi)} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                UPI ID
              </label>
              <input
                className={`input ${errors.upiId ? 'border-danger' : ''}`}
                placeholder="yourname@paytm"
                {...register('upiId', { required: 'UPI ID is required' })}
              />
              {errors.upiId && (
                <p className="text-danger text-xs">{errors.upiId.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Pay ₹${amount}`
              )}
            </button>
          </form>
        )}

        {/* ── Net Banking Tab ── */}
        {activeTab === 'netbanking' && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map((bank) => (
                <button
                  key={bank}
                  type="button"
                  className="bg-background border border-border rounded-lg p-4 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-all"
                >
                  {bank} Bank
                </button>
              ))}
            </div>
            <button
              onClick={() => processPayment('Net Banking')}
              disabled={isProcessing}
              type="button"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Pay ₹${amount}`
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-text-secondary text-xs">
        <p>© 2024 ZomatoClone. All transactions are encrypted and secure.</p>
      </div>
    </main>
  );
};

export default Payment;
