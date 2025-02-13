import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex flex-col">
      {/* Header */}
      <header className="bg-[#2a2a2a] shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-4">
          <button
            className="p-2 hover:bg-[#333333] rounded-full transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6 text-[#cfcfcf]" />
          </button>
          <h1 className="text-xl font-semibold text-[#50c878]">Terms and Conditions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#2a2a2a] rounded-xl shadow-sm p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#50c878] mb-4">1. Introduction</h2>
            <p className="text-[#cfcfcf] mb-4">
              Welcome to our mobile recharge portal. By accessing or using our services, you agree to be bound by these terms and conditions. Please read them carefully before proceeding with any transaction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#50c878] mb-4">2. Service Usage</h2>
            <p className="text-[#cfcfcf] mb-4">
              Our platform provides mobile recharge and bill payment services. Users must ensure:
            </p>
            <ul className="list-disc pl-6 text-[#cfcfcf] space-y-2">
              <li>Accurate information is provided for all transactions</li>
              <li>Their account credentials are kept secure</li>
              <li>They maintain sufficient funds for transactions</li>
              <li>They verify all details before confirming payments</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#50c878] mb-4">3. Privacy Policy</h2>
            <p className="text-[#cfcfcf] mb-4">
              We prioritize the security of your personal information. Our privacy measures include:
            </p>
            <ul className="list-disc pl-6 text-[#cfcfcf] space-y-2">
              <li>Encryption of sensitive data</li>
              <li>Secure payment processing</li>
              <li>No storage of complete card details</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#50c878] mb-4">4. Transaction Policies</h2>
            <p className="text-[#cfcfcf] mb-4">
              Understanding our transaction policies is crucial for a smooth experience:
            </p>
            <ul className="list-disc pl-6 text-[#cfcfcf] space-y-2">
              <li>All transactions are processed in real-time</li>
              <li>Failed transactions are reversed within 24-48 hours</li>
              <li>Transaction history is maintained for 12 months</li>
              <li>Refunds are processed to the original payment method</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#50c878] mb-4">5. User Responsibilities</h2>
            <p className="text-[#cfcfcf] mb-4">
              Users of our platform are responsible for:
            </p>
            <ul className="list-disc pl-6 text-[#cfcfcf] space-y-2">
              <li>Maintaining account security</li>
              <li>Reporting unauthorized transactions</li>
              <li>Providing accurate contact information</li>
              <li>Complying with platform guidelines</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#50c878] mb-4">6. Customer Support</h2>
            <p className="text-[#cfcfcf] mb-4">
              Our customer support team is available to assist you:
            </p>
            <ul className="list-disc pl-6 text-[#cfcfcf] space-y-2">
              <li>24/7 chat support for urgent issues</li>
              <li>Email support with 24-hour response time</li>
              <li>Dedicated helpline for payment-related queries</li>
              <li>Online ticket system for tracking issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#50c878] mb-4">7. Updates to Terms</h2>
            <p className="text-[#cfcfcf] mb-4">
              We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or through the platform. Continued use of our services after changes constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}