import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Terms Component
export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Terms and Conditions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              By using our services, you agree to these terms. Please read carefully.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Usage</h2>
            <p className="text-gray-600 mb-4">
              Our platform offers services that ensure the best user experience for our customers. Your usage of
              these services must adhere to our guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              We respect your privacy and safeguard your personal data. All information collected will be treated in
              accordance with our privacy policy.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}



    