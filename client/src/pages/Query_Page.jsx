import { useState, useEffect } from 'react';
import { FaReply } from 'react-icons/fa';
import API from '../Utils/API';
import PageLayout from './PageLayout';

function Query_Page() {
    const [queries, setQueries] = useState([]);
    const [replies, setReplies] = useState({});

    // Fetch all queries
    const fetchQueries = async () => {
        try {
            const res = await API.get("/query/getAllQueries");
            setQueries(res.data);
        } catch (error) {
            console.error("Error fetching queries:", error);
        }
    };

    // Handle reply input change
    const handleReplyChange = (id, value) => {
        setReplies(prevReplies => ({
            ...prevReplies,
            [id]: value
        }));
    };

    // Send admin response
    const sendReply = async (id) => {
        const replyMessage = replies[id];
        if (!replyMessage) return;

        try {
            const response = await API.put(`/query/updateQuery/${id}`, {
                body: JSON.stringify({ admin_response: replyMessage, status: "Resolved" })
            });

            if (response.ok) {
                alert('Reply sent successfully!');
                setReplies(prevReplies => ({ ...prevReplies, [id]: '' }));
                fetchQueries();
            } else {
                alert('Failed to send reply.');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    return (
        <PageLayout title="Query Management">
            <p className="text-lg text-[#ffffff] mb-8 text-center">
                Below is the list of user queries:
            </p>
            <div className="space-y-4">
                {queries.length > 0 ? (
                    queries.map(query => (
                        <div
                            key={query._id}
                            className={`bg-[#1e1e1e] p-6 rounded-lg shadow-lg border-l-4 ${
                                query.status === "Pending" ? 'border-yellow-500' : 'border-green-500'
                            }`}
                        >
                            <p className="text-[#cfcfcf] text-sm">{query.message}</p>
                            <p className="text-xs text-[#888888] mt-2">
                                From: <span className="font-semibold">{query.username}</span> ({query.email}) • {new Date(query.created_at).toLocaleString()}
                            </p>
                            {query.admin_response && (
                                <div className="mt-2 ml-4 p-2 bg-[#2a2a2a] rounded-lg">
                                    <p className="text-sm text-[#cfcfcf]">Admin: {query.admin_response}</p>
                                </div>
                            )}
                            <div className="mt-4 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={replies[query._id] || ''}
                                    onChange={(e) => handleReplyChange(query._id, e.target.value)}
                                    className="flex-1 bg-[#2a2a2a] text-[#cfcfcf] p-2 rounded-lg focus:outline-none"
                                    placeholder="Type your reply..."
                                />
                                <button
                                    onClick={() => sendReply(query._id)}
                                    className="bg-[#50c878] text-black p-2 rounded-lg hover:bg-[#40a868] transition"
                                >
                                    <FaReply size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-[#ffffff] text-center">No queries available.</p>
                )}
            </div>
        </PageLayout>
    );
}

export default Query_Page;