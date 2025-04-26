/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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
            <button 
                className="w-full py-4 px-6 text-left flex justify-between items-center hover:bg-[#333333] transition-colors duration-200" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-[#e0e0e0] text-base">{question}</span>
                <span className="text-[#50c878] text-lg">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
                <div className="px-6 py-4 bg-[#2a2a2a] text-[#cfcfcf] text-sm leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}

function CategoryCard({ category }) {
    return (
        <div className={`${category.bgColor} rounded-lg p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#50c878]/10`}>
            <div className="flex items-center space-x-4">
                <span className={`text-3xl ${category.color}`}>{category.icon}</span>
                <span className="font-semibold text-[#e0e0e0] text-lg">{category.title}</span>
            </div>
            <p className="mt-3 text-sm text-[#aaaaaa] leading-snug">{category.description}</p>
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

function UserQueryItem({ query }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className={`border-b border-[#444444] transition-colors duration-200 ${isOpen ? 'bg-[#252525]' : 'bg-[#1e1e1e]'}`}>
            <button 
                className="w-full py-5 px-6 text-left flex justify-between items-center hover:bg-[#2a2a2a] transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col items-start">
                    <span className="font-medium text-[#e0e0e0] text-base">{query.subject}</span>
                    <div className="flex items-center mt-2 space-x-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            query.status === "Resolved" 
                                ? "bg-[#50c878]/20 text-[#50c878]" 
                                : "bg-[#ffa500]/20 text-[#ffa500]"
                        }`}>
                            {query.status}
                        </span>
                        <span className="text-xs text-[#888888]">
                            {new Date(query.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <span className={`text-lg ${isOpen ? 'text-[#50c878]' : 'text-[#888888]'}`}>
                    {isOpen ? "▲" : "▼"}
                </span>
            </button>
            {isOpen && (
                <div className="px-6 py-5 bg-[#2a2a2a] text-[#cfcfcf]">
                    <div className="mb-5">
                        <div className="flex items-center mb-2">
                            <div className="w-2 h-2 rounded-full bg-[#50c878] mr-2"></div>
                            <h4 className="text-sm font-semibold text-[#aaaaaa]">YOUR QUERY</h4>
                        </div>
                        <p className="mt-2 text-[#e0e0e0] text-sm leading-relaxed pl-4">
                            {query.message}
                        </p>
                    </div>
                    
                    {query.admin_response && (
                        <div className="mt-5 pt-5 border-t border-[#444444]">
                            <div className="flex items-center mb-2">
                                <div className="w-2 h-2 rounded-full bg-[#50c878] mr-2"></div>
                                <h4 className="text-sm font-semibold text-[#50c878]">ADMIN RESPONSE</h4>
                            </div>
                            <p className="mt-2 text-[#e0e0e0] text-sm leading-relaxed pl-4">
                                {query.admin_response}
                            </p>
                        </div>
                    )}
                    
                    <div className="mt-5 text-xs text-[#888888] italic">
                        Last updated: {new Date(query.updated_at).toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
}

function Help() {
    const [userQueries, setUserQueries] = useState([]);
    const [loadingQueries, setLoadingQueries] = useState(true);

    useEffect(() => {
        const fetchUserQueries = async () => {
            try {
                const response = await API.get("/query/fetchUserQueries");
                setUserQueries(response.data);
            } catch (error) {
                console.error("Error fetching user queries:", error);
            } finally {
                setLoadingQueries(false);
            }
        };

        fetchUserQueries();
    }, []);

    return (
        <PageLayout title="Help Center">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-lg text-[#ffffff] mb-10 text-center">
                    Below is the list of frequently asked questions and support categories:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {faqCategories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
                
                <div className="bg-[#1e1e1e] rounded-xl shadow-sm overflow-hidden mb-12 border border-[#444444]">
                    <div className="px-6 py-4 bg-[#252525] border-b border-[#444444]">
                        <h3 className="text-lg font-semibold text-[#e0e0e0]">Popular Questions</h3>
                    </div>
                    {popularQueries.map((query) => (
                        <FAQItem key={query.id} question={query.question} answer={query.answer} />
                    ))}
                </div>
                
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-[#ffffff] mb-6 pb-2 border-b border-[#444444]">
                        Your Support Queries
                    </h2>
                    {loadingQueries ? (
                        <div className="text-center py-10 text-[#888888]">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#50c878] mb-3"></div>
                            <p>Loading your queries...</p>
                        </div>
                    ) : userQueries.length > 0 ? (
                        <div className="bg-[#1e1e1e] rounded-xl shadow-sm overflow-hidden border border-[#444444]">
                            {userQueries.map((query) => (
                                <UserQueryItem key={query._id} query={query} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[#888888] bg-[#1e1e1e] rounded-xl border border-[#444444]">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-lg">You haven&apos;t submitted any queries yet.</p>
                            <p className="text-sm mt-2">Submit your first query using the form below</p>
                        </div>
                    )}
                </div>
                
                <ContactForm />
            </div>
        </PageLayout>
    );
}

export default Help;