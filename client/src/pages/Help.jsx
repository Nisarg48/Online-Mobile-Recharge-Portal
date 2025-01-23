import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Phone,
  CreditCard,
  Gift,
  UserCog,
  Shield,
  MessageSquareMore,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// FAQ data structure
const faqCategories = [
  {
    id: 1,
    title: 'Recharge Issues',
    icon: Phone,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    title: 'Payment Failures',
    icon: CreditCard,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    id: 3,
    title: 'Offers & Cashback',
    icon: Gift,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    id: 4,
    title: 'Account Management',
    icon: UserCog,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    id: 5,
    title: 'Privacy & Security',
    icon: Shield,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
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
    <div className="border-b border-gray-200">
      <button
        className="w-full py-4 px-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}

function Help() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Help Center</h1>
            </div>
            <div className="relative flex-1 max-w-lg mx-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search for help"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-2">How can we assist you?</h2>
          <p className="text-blue-100">Find solutions to your issues or contact support</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* FAQ Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {faqCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                className={`${category.bgColor} p-6 rounded-xl flex items-center space-x-4 hover:shadow-md transition-shadow`}
              >
                <div className={`${category.color} p-3 rounded-lg`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <span className="font-medium text-gray-900">{category.title}</span>
              </button>
            );
          })}
        </div>

        {/* Popular Queries */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Popular Queries</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {popularQueries.map((query) => (
              <FAQItem key={query.id} question={query.question} answer={query.answer} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Report a Problem</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Terms & Policies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Live Chat Bubble */}
      <button className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
        <MessageSquareMore className="h-6 w-6" />
      </button>
    </div>
  );
}

export default Help;