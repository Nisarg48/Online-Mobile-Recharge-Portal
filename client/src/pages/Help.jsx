/* eslint-disable react/prop-types */
import { useState } from "react";
import API from "../Utils/API";
import PageLayout from "./PageLayout";

const faqCategories = [
    { id: 1, title: "Recharge Issues", icon: "📱", color: "text-[#50c878]", bgColor: "bg-[#2a2a2a]", description: "Help with failed recharges, pending transactions, and top-ups." },
    { id: 2, title: "Payment Failures", icon: "💳", color: "text-[#50c878]", bgColor: "bg-[#2a2a2a]", description: "Resolve failed payments, refunds, and transaction errors." },
    { id: 3, title: "Offers & Cashback", icon: "🎁", color: "text-[#50c878]", bgColor: "bg-[#2a2a2a]", description: "Learn about offers, cashback terms, and reward redemption." },
    { id: 4, title: "Account Management", icon: "⚙️", color: "text-[#50c878]", bgColor: "bg-[#2a2a2a]", description: "Manage your profile and account settings." },
    { id: 5, title: "Privacy & Security", icon: "🛡️", color: "text-[#50c878]", bgColor: "bg-[#2a2a2a]", description: "Support for security, privacy settings, and data protection." },
];

const popularQueries = [
    { id: 1, question: "Why did my recharge fail?", answer: "Recharge failures can occur due to network issues, insufficient balance, or bank server problems. Try again later." },
    { id: 2, question: "How to check my transaction history?", answer: "Go to your account dashboard and click on 'Transaction History' to view past transactions." },
    { id: 3, question: "How to claim a cashback offer?", answer: "Cashback is automatically credited within 24 hours of a successful recharge. Check offer terms." },
];

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-[#444444]">
            <button className="w-full py-4 px-6 text-left flex justify-between items-center hover:bg-[#333333]" onClick={() => setIsOpen(!isOpen)}>
                <span className="font-medium text-[#cfcfcf]">{question}</span>
                <span className="text-[#cfcfcf]">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && <div className="px-6 py-4 bg-[#2a2a2a] text-[#cfcfcf]">{answer}</div>}
        </div>
    );
}

function CategoryCard({ category }) {
    return (
        <div className={`${category.bgColor} rounded-lg p-6 cursor-pointer transition-transform transform hover:scale-105`}>
            <div className="flex items-center space-x-4">
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium text-[#cfcfcf]">{category.title}</span>
            </div>
            <p className="mt-2 text-sm text-[#888888]">{category.description}</p>
        </div>
    );
}

function ContactForm() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (subject.trim().length < 5 || message.trim().length < 10) {
            alert("Subject must be at least 5 characters and message at least 10 characters.");
            return;
        }

        setIsSubmitting(true);
        try {
            console.log(subject, message);
            await API.post("/query/submitQuery", { subject, message });
            alert("Query submitted successfully!");
            setSubject("");
            setMessage("");
        } catch (error) {
            alert("Failed to submit query. Try again later.");
            console.error("Error submitting query:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#1e1e1e] p-6 rounded-lg border border-[#444444]">
            <h2 className="text-[#50c878] text-lg font-semibold">Send Us Your Query</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 mt-2 bg-[#2a2a2a] text-[#cfcfcf] border border-[#444444] focus:border-[#50c878]"
                    placeholder="Enter subject (min 5 characters)"
                    required
                />
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 mt-2 bg-[#2a2a2a] text-[#cfcfcf] border border-[#444444] focus:border-[#50c878]"
                    placeholder="Describe your issue (min 10 characters)"
                    required
                />
                <button
                    type="submit"
                    className={`w-full mt-4 px-4 py-2 rounded-lg text-white font-semibold transition ${
                        subject.trim().length >= 5 && message.trim().length >= 10 && !isSubmitting ? "bg-[#50c878] hover:bg-[#40a868]" : "bg-[#444444] cursor-not-allowed"
                    }`}
                    disabled={subject.trim().length < 5 || message.trim().length < 10 || isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit Query"}
                </button>
            </form>
        </div>
    );
}

function Help() {
    return (
        <PageLayout title="Help Center">
            <p className="text-lg text-[#ffffff] mb-8 text-center">
                Below is the list of frequently asked questions and support categories:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {faqCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
            <div className="bg-[#1e1e1e] rounded-lg shadow-sm overflow-hidden mb-12">
                {popularQueries.map((query) => (
                    <FAQItem key={query.id} question={query.question} answer={query.answer} />
                ))}
            </div>
            <ContactForm />
        </PageLayout>
    );
}

export default Help;