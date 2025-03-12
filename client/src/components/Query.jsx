import { useState, useEffect } from 'react';
import { FaReply, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function QueryPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [replies, setReplies] = useState({});
    const navigate = useNavigate();

    // Navigate back to Transaction page
    const handleBack = () => {
        navigate('/Transaction');
    };

    // Fetch feedback messages
    const fetchFeedbacks = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/feedback");
            const data = await res.json();
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    // Mark feedback as read
    const markAsRead = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/feedback/markAsRead/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.ok) {
                // Update the local state to reflect the read status
                setFeedbacks(prevFeedbacks =>
                    prevFeedbacks.map(feedback =>
                        feedback._id === id ? { ...feedback, read: true } : feedback
                    )
                );
            } else {
                console.error('Failed to mark feedback as read');
            }
        } catch (error) {
            console.error('Error marking feedback as read:', error);
        }
    };

    // Handle reply input change
    const handleReplyChange = (id, value) => {
        setReplies(prevReplies => ({
            ...prevReplies,
            [id]: value
        }));
    };

    // Send reply
    const sendReply = async (id) => {
        const replyMessage = replies[id];
        if (!replyMessage) return;

        try {
            const response = await fetch(`http://localhost:5000/api/feedback/reply/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ reply: replyMessage })
            });

            if (response.ok) {
                alert('Reply sent successfully!');
                // Clear the reply field after sending
                setReplies(prevReplies => ({
                    ...prevReplies,
                    [id]: ''
                }));
                fetchFeedbacks(); // Refresh feedbacks to show the reply
            } else {
                alert('Failed to send reply.');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
        }
    };

    // Fetch feedbacks on component mount
    useEffect(() => {
        fetchFeedbacks();
    }, []);

    return (
        <div className="bg-[#1e1e1e] min-h-screen p-8">
            <div className="container mx-auto">
                {/* Back button */}
                <button 
                    onClick={handleBack}
                    className="bg-[#333333] text-[#50c878] px-4 py-2 rounded-lg mb-4 flex items-center hover:bg-[#444444] transition"
                >
                    <FaArrowLeft className="mr-2" /> Back to Transactions
                </button>
                
                <h1 className="text-2xl font-bold text-[#50c878] mb-6">Feedback Inbox</h1>
                <div className="space-y-4">
                    {feedbacks.length > 0 ? (
                        feedbacks.map(feedback => (
                            <div
                                key={feedback._id}
                                className={`bg-[#333333] p-4 rounded-lg shadow-lg ${
                                    !feedback.read ? 'border-l-4 border-[#50c878]' : ''
                                }`}
                            >
                                <p className="text-white text-sm">{feedback.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Submitted by: <span className="font-semibold">{feedback.user || "Anonymous"}</span> • {new Date(feedback.timestamp).toLocaleString()}
                                </p>
                                {feedback.replies && feedback.replies.map((reply, index) => (
                                    <div key={index} className="mt-2 ml-4 p-2 bg-[#444444] rounded-lg">
                                        <p className="text-white text-sm">{reply}</p>
                                    </div>
                                ))}
                                <div className="mt-4 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={replies[feedback._id] || ''}
                                        onChange={(e) => handleReplyChange(feedback._id, e.target.value)}
                                        className="flex-1 bg-[#444444] text-white p-2 rounded-lg focus:outline-none"
                                        placeholder="Type your reply..."
                                    />
                                    <button
                                        onClick={() => sendReply(feedback._id)}
                                        className="bg-[#50c878] text-black p-2 rounded-lg hover:bg-[#40a060] transition"
                                    >
                                        <FaReply size={16} />
                                    </button>
                                    {!feedback.read && (
                                        <button
                                            onClick={() => markAsRead(feedback._id)}
                                            className="bg-[#50c878] text-black p-2 rounded-lg hover:bg-[#40a060] transition"
                                        >
                                            <FaCheck size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">No feedback available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QueryPage;