/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  CreditCard,
  Gift,
  UserCog,
  Shield,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';
import Terms from './terms_condition';


// FAQ categories
const faqCategories = [
  { id: 1, title: 'Recharge Issues', icon: Phone, color: 'text-[#50c878]', bgColor: 'bg-[#2a2a2a]', description: ' Get help with failed recharges, pending transactions, and mobile top-ups' },
  { id: 2, title: 'Payment Failures', icon: CreditCard, color: 'text-[#50c878]', bgColor: 'bg-[#2a2a2a]', description: 'Resolve issues with failed payments, refunds, and transaction errors' },
  { id: 3, title: 'Offers & Cashback', icon: Gift, color: 'text-[#50c878]', bgColor: 'bg-[#2a2a2a]', description: 'Learn about ongoing offers, cashback terms, and reward redemption' },
  { id: 4, title: 'Account Management', icon: UserCog, color: 'text-[#50c878]', bgColor: 'bg-[#2a2a2a]', description: 'Manage your profile, update details, and handle account settings' },
  { id: 5, title: 'Privacy & Security', icon: Shield, color: 'text-[#50c878]', bgColor: 'bg-[#2a2a2a]', description: 'Get support for security concerns, privacy settings, and data protection' },
];

// Popular Queries
const popularQueries = [
  { id: 1, question: 'Why did my recharge fail?', answer: 'Recharge failures can occur due to network issues, insufficient balance, or bank server problems. Check your balance and try again after a few minutes.' },
  { id: 2, question: 'How to check my transaction history?', answer: 'Go to your account dashboard and click on "Transaction History" to view all your past recharges and payments.' },
  { id: 3, question: 'How to claim a cashback offer?', answer: 'Cashback is automatically credited to your wallet within 24 hours of a successful recharge. Check the offer terms for specific conditions.' },
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#444444]">
      <button className="w-full py-4 px-6 text-left flex justify-between items-center hover:bg-[#2a2a2a] transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <span className="font-medium text-[#cfcfcf]">{question}</span>
        {isOpen ? <ChevronUp className="h-5 w-5 text-[#cfcfcf]" /> : <ChevronDown className="h-5 w-5 text-[#cfcfcf]" />}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-[#2a2a2a]">
          <p className="text-[#cfcfcf]">{answer}</p>
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category }) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = category.icon;

  return (
    <div className={`${category.bgColor} rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer`} style={{ height: isHovered ? '160px' : '88px' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`${category.color} p-3 rounded-lg transition-transform`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <span className="font-medium text-[#cfcfcf]">{category.title}</span>
        </div>
        <div className={`mt-4 text-[#cfcfcf] transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm leading-relaxed">{category.description}</p>
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (feedback.trim().length < 10 || feedback.trim().length > 500) {
      alert("Feedback must be between 10 and 500 characters.");
      return;
    }

    try {
      // Save feedback to Firestore
      await addDoc(collection(db, 'feedback'), {
        message: feedback,
        timestamp: new Date().toISOString(),
      });
      console.log('Feedback submitted:', feedback);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="bg-[#2a2a2a] rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#50c878] mb-4">Send Us Your Feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows="4"
            maxLength="500"
            minLength="5"
            className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-[#444444] text-[#cfcfcf] focus:outline-none focus:border-[#50c878]"
            placeholder="Share your feedback (10-500 characters)..."
            required
          ></textarea>
        </div>
        <button type="submit" className={`flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-lg transition-colors ${feedback.trim().length >= 10 ? "bg-[#50c878] hover:bg-[#45b06a]" : "bg-gray-500 cursor-not-allowed"}`} disabled={feedback.trim().length < 10}>
          <Send className="h-5 w-5" />
          <span>Submit Feedback</span>
        </button>
      </form>
    </div>
  );
}

function QueryInbox() {
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'feedback'));
        const feedbackData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedbackList(feedbackData);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className="absolute top-12 right-0 bg-[#1e1e1e] rounded-lg shadow-lg w-96 overflow-hidden border border-[#333333]">
      <div className="p-4 border-b border-[#333333]">
        <h3 className="text-lg font-semibold text-[#ffffff]">Feedback Inbox</h3>
        <p className="text-sm text-[#666666]">{feedbackList.length} unread messages</p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {feedbackList.length > 0 ? (
          feedbackList.map((feedback) => (
            <div key={feedback.id} className="p-4 border-b border-[#333333] hover:bg-[#333333] transition duration-300">
              <p className="text-sm text-[#ffffff]">{feedback.message}</p>
              <p className="text-xs text-[#666666] mt-1">{feedback.timestamp}</p>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-[#666666]">No feedback available.</p>
        )}
      </div>
      <div className="p-4 border-t border-[#333333]">
        <button
          className="w-full bg-[#50c878] text-[#1e1e1e] py-2 px-4 rounded hover:bg-[#40a060] transition duration-300"
          onClick={() => setShowQueryInbox(false)}
        >
          Close Inbox
        </button>
      </div>
    </div>
  );
}

function Help() {
  const navigate = useNavigate();
  const [showQueryInbox, setShowQueryInbox] = useState(false);

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <header className="bg-[#2a2a2a] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-[#333333] rounded-full transition-colors" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-6 w-6 text-[#cfcfcf]" />
            </button>
            <h1 className="text-xl font-bold text-[#cfcfcf]">Help Center</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {faqCategories.map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>

        <div className="bg-[#2a2a2a] rounded-xl shadow-sm overflow-hidden mb-12">
          {popularQueries.map((query) => <FAQItem key={query.id} question={query.question} answer={query.answer} />)}
        </div>

        <ContactForm />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Help />} />
      <Route path="/terms" element={<Terms />} />
    </Routes>
  );
}

export default App;