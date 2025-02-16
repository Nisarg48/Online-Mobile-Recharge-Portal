/* eslint-disable react/prop-types */
import { useState } from 'react';
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
} from 'lucide-react';
import Terms from './terms_condition';

// FAQ data structure with added descriptions
const faqCategories = [
  {
    id: 1,
    title: 'Recharge Issues',
    icon: Phone,
    color: 'text-[#50c878]',
    bgColor: 'bg-[#2a2a2a]',
    description: ' Get help with failed recharges, pending transactions, and mobile top-ups',
  },
  {
    id: 2,
    title: 'Payment Failures',
    icon: CreditCard,
    color: 'text-[#50c878]',
    bgColor: 'bg-[#2a2a2a]',
    description: 'Resolve issues with failed payments, refunds, and transaction errors',
  },
  {
    id: 3,
    title: 'Offers & Cashback',
    icon: Gift,
    color: 'text-[#50c878]',
    bgColor: 'bg-[#2a2a2a]',
    description: 'Learn about ongoing offers, cashback terms, and reward redemption',
  },
  {
    id: 4,
    title: 'Account Management',
    icon: UserCog,
    color: 'text-[#50c878]',
    bgColor: 'bg-[#2a2a2a]',
    description: 'Manage your profile, update details, and handle account settings',
  },
  {
    id: 5,
    title: 'Privacy & Security',
    icon: Shield,
    color: 'text-[#50c878]',
    bgColor: 'bg-[#2a2a2a]',
    description: 'Get support for security concerns, privacy settings, and data protection',
  },
];

const popularQueries = [
  {
    id: 1,
    question: 'Why did my recharge fail?',
    answer: 'Recharge failures can occur due to network issues, insufficient balance, or bank server problems. Check your balance and try again after a few minutes.',
  },
  {
    id: 2,
    question: 'How to check my transaction history?',
    answer: 'Go to your account dashboard and click on "Transaction History" to view all your past recharges and payments.',
  },
  {
    id: 3,
    question: 'How to claim a cashback offer?',
    answer: 'Cashback is automatically credited to your wallet within 24 hours of a successful recharge. Check the offer terms for specific conditions.',
  },
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#444444]">
      <button
        className="w-full py-4 px-6 text-left flex justify-between items-center hover:bg-[#2a2a2a] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-[#cfcfcf]">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[#cfcfcf]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#cfcfcf]" />
        )}
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
    <div
      className={`${category.bgColor} rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer`}
      style={{ height: isHovered ? '160px' : '88px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`${category.color} p-3 rounded-lg transition-transform`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <span className="font-medium text-[#cfcfcf]">{category.title}</span>
        </div>
        <div
          className={`mt-4 text-[#cfcfcf] transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-sm leading-relaxed">{category.description}</p>
        </div>
      </div>
    </div>
  );
}

function Help() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      {/* Header */}
      <header className="bg-[#2a2a2a] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="p-2 hover:bg-[#333333] rounded-full transition-colors"
                onClick={handleBack}
              >
                <ArrowLeft className="h-6 w-6 text-[#cfcfcf]" />
              </button>
              <h1 className="text-xl font-bold text-[#cfcfcf]">Help Center</h1>
            </div>
            <div className="relative flex-1 max-w-lg mx-4"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-2 text-[#50c878]">How can we assist you?</h2>
          <p className="text-[#cfcfcf]">Find solutions to your issues or contact support</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* FAQ Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {faqCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Popular Queries */}
        <div className="bg-[#2a2a2a] rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-[#444444]">
            <h3 className="text-lg font-semibold text-[#50c878]">Popular Queries</h3>
          </div>
          <div className="divide-y divide-[#444444]">
            {popularQueries.map((query) => (
              <FAQItem key={query.id} question={query.question} answer={query.answer} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#2a2a2a] border-t border-[#444444]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-[#cfcfcf] hover:text-[#50c878]"
                onMouseEnter={() => setIsHovered(true)}
              >
                Contact Us
              </a>
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/terms');
                }}
                className="text-[#cfcfcf] hover:text-[#50c878]"
              >
                Terms & Policies
              </a>
            </div>
          </div>
          {isHovered && (
            <div className="mt-4 text-[#cfcfcf]">
              <p>If you need help, feel free to reach out to our support team at support@example.com.</p>
            </div>
          )}
        </div>
      </footer>
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