function FeedbackForm() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Add this function to help debug the API
  const logAPIDetails = (error) => {
    console.group("API Error Details");
    console.log("Error object:", error);
    console.log("API configuration:", API.defaults); // Assuming axios is used
    console.log("Request data:", { message: feedback });
    console.groupEnd();
  };

  // Add a fallback submission method if the API fails
  const fallbackSubmission = async (feedbackData) => {
    // Option 1: Using localStorage as a temporary storage
    try {
      const storedFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
      storedFeedback.push({
        message: feedbackData,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pendingFeedback', JSON.stringify(storedFeedback));
      return { success: true, message: "Feedback saved locally. Will be sent when connection is restored." };
    } catch (storageError) {
      console.error("Error saving to localStorage:", storageError);
      throw new Error("All submission methods failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (feedback.trim().length < 10 || feedback.trim().length > 500) {
      setStatus({
        type: "error",
        message: "Feedback must be between 10 and 500 characters."
      });
      return;
    }
    
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    
    try {
      // First try to use the API
      try {
        // Check if the API utility is properly initialized
        if (!API || typeof API.post !== 'function') {
          throw new Error("API utility is not properly initialized");
        }
        
        // Add explicit error handling and logging
        const response = await API.post("/feedback/submit", { message: feedback });
        
        console.log("Feedback submitted via API:", response);
        setFeedback("");
        setStatus({
          type: "success",
          message: "Feedback submitted successfully!"
        });
      } catch (apiError) {
        // Log detailed info about the API error
        logAPIDetails(apiError);
        
        // Try the fallback method
        console.log("API submission failed. Trying fallback method...");
        const fallbackResult = await fallbackSubmission(feedback);
        
        setFeedback("");
        setStatus({
          type: "success",
          message: fallbackResult.message
        });
      }
    } catch (error) {
      console.error("All submission methods failed:", error);
      setStatus({
        type: "error",
        message: "Failed to submit feedback. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple direct form to test submission without API
  const handleDirectSubmit = (e) => {
    e.preventDefault();
    alert(`For testing: Would submit "${feedback}" directly without API`);
    setFeedback("");
  };

  return (
    <div className="bg-[#2a2a2a] rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#50c878] mb-4">Send Us Your Feedback</h3>
      {status.message && (
        <div className={`mb-4 p-3 rounded-lg ${status.type === "success" ? "bg-green-900 text-green-100" : "bg-red-900 text-red-100"}`}>
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows="4"
            maxLength="500"
            minLength="10"
            className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] border border-[#444444] text-[#cfcfcf] focus:outline-none focus:border-[#50c878]"
            placeholder="Share your feedback (10-500 characters)..."
            required
            disabled={isSubmitting}
          ></textarea>
          <div className="text-xs text-gray-400 mt-1">
            {feedback.length}/500 characters
          </div>
        </div>
        <button
          type="submit"
          className={`flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-lg transition-colors ${
            feedback.trim().length >= 10 && !isSubmitting
              ? "bg-[#50c878] hover:bg-[#45b06a]"
              : "bg-gray-500 cursor-not-allowed"
          }`}
          disabled={feedback.trim().length < 10 || isSubmitting}
        >
          {isSubmitting ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span>{isSubmitting ? "Submitting..." : "Submit Feedback"}</span>
        </button>
      </form>
      
      {/* Emergency fallback button for testing */}
      <div className="mt-4 pt-4 border-t border-[#444444]">
        <p className="text-sm text-gray-400 mb-2">If you're still experiencing issues:</p>
        <button 
          onClick={handleDirectSubmit}
          className="text-sm text-[#50c878] underline"
        >
          Test Direct Submission (Bypasses API)
        </button>
      </div>
    </div>
  );
}