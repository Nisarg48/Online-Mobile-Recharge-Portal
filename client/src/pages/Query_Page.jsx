import { useState, useEffect } from 'react';
import { FaReply, FaCheckCircle, FaClock } from 'react-icons/fa';
import API from '../Utils/API';
import PageLayout from './PageLayout';

function Query_Page() {
    const [queries, setQueries] = useState([]);
    const [replies, setReplies] = useState({});
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchQueries = async () => {
        setLoading(true);
        try {
            const res = await API.get("/query/getAllQueries");
            const sortedQueries = res.data.sort((a, b) => {
                if (a.status === b.status) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return a.status === "Pending" ? -1 : 1;
            });
            setQueries(sortedQueries);
        } catch (error) {
            console.error("Error fetching queries:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyChange = (id, value) => {
        setReplies(prev => ({ ...prev, [id]: value }));
    };

    const sendReply = async (id) => {
        const replyMessage = replies[id]?.trim();
        if (!replyMessage) {
            alert('Please enter a reply message.');
            return;
        }

        try {
            const queryRes = await API.get(`/query/getQueryById/${id}`);
            const query = queryRes.data;

            const response = await API.put(`/query/updateQuery/${id}`, {
                admin_response: replyMessage,
                status: "Resolved",
                user_id: query.user_id
            });

            if (response.data) {
                setSuccessMessage('Reply sent successfully!');
                setReplies(prev => ({ ...prev, [id]: '' }));
                fetchQueries();
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Error sending reply. Please try again.');
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    return (
        <PageLayout title="Query Management">
            <div className="w-full px-4 py-2">
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-500/20 text-green-500 rounded-lg text-center">
                        {successMessage}
                    </div>
                )}
                
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-white">Customer Support Queries</h1>
                    <p className="text-sm text-gray-400">
                        {loading ? 'Loading queries...' : `Showing ${queries.length} queries`}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : queries.length > 0 ? (
                    <div className="space-y-3">
                        {queries.map(query => (
                            <div
                                key={query._id}
                                className={`bg-gray-800 rounded-md shadow border-l-4 ${
                                    query.status === "Pending" 
                                        ? 'border-yellow-500' 
                                        : 'border-green-500'
                                }`}
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-base font-medium text-white">
                                            {query.subject}
                                        </h3>
                                        <span className={`flex items-center text-xs px-2 py-1 rounded-full ${
                                            query.status === "Pending"
                                                ? "bg-yellow-500/20 text-yellow-500"
                                                : "bg-green-500/20 text-green-500"
                                        }`}>
                                            {query.status === "Pending" ? (
                                                <FaClock className="mr-1" size={12} />
                                            ) : (
                                                <FaCheckCircle className="mr-1" size={12} />
                                            )}
                                            {query.status}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-sm text-gray-300">
                                            {query.message}
                                        </p>
                                    </div>

                                    <div className="text-xs text-gray-400 mb-3">
                                        <p>
                                            From: <span className="font-medium text-gray-200">
                                                {query.username} ({query.email})
                                            </span>
                                        </p>
                                        <p>
                                            Submitted: {new Date(query.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    {query.admin_response && (
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                            <div className="flex items-center mb-1">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                                <h4 className="text-xs font-semibold text-green-500">
                                                    ADMIN RESPONSE
                                                </h4>
                                            </div>
                                            <p className="text-xs text-gray-300 pl-3">
                                                {query.admin_response}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 italic">
                                                Last updated: {new Date(query.updated_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}

                                    {query.status === "Pending" && (
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                            <h4 className="text-xs font-semibold text-yellow-500 mb-1">
                                                REPLY TO THIS QUERY
                                            </h4>
                                            <div className="flex gap-2">
                                                <textarea
                                                    value={replies[query._id] || ''}
                                                    onChange={(e) => handleReplyChange(query._id, e.target.value)}
                                                    className="flex-1 bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
                                                    placeholder="Type your response here..."
                                                    rows="3"
                                                />
                                                <button
                                                    onClick={() => sendReply(query._id)}
                                                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition flex items-center justify-center h-10 w-10"
                                                    title="Send response"
                                                >
                                                    <FaReply size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-gray-800 rounded border border-gray-700">
                        <div className="text-3xl mb-2">📭</div>
                        <p className="text-base text-white mb-1">No queries found</p>
                        <p className="text-xs text-gray-400">
                            When users submit queries, they&apos;ll appear here
                        </p>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

export default Query_Page;