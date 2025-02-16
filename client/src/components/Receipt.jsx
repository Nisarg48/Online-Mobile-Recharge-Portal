import { useLocation, useNavigate } from 'react-router-dom';

function Receipt() {
    const location = useLocation();
    const navigate = useNavigate();
    const transactionData = location.state?.transactionData;

    if (!transactionData) {
        return (
            <div className="h-screen flex items-center justify-center text-xl text-white">
                No transaction details available.
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-white p-6">
            <div className="bg-[#292929] p-8 rounded-lg shadow-lg w-full max-w-lg text-center">
                <h2 className="text-2xl font-bold mb-6">Transaction Receipt</h2>
                <div className="space-y-4 text-left">
                    <p><b>Transaction ID:</b> {transactionData.transactionId}</p>
                    <p><b>Mobile Number:</b> {transactionData.mobileNumber}</p>
                    <p><b>Plan:</b> {transactionData.plan.platform} - {transactionData.plan.category}</p>
                    <p><b>Price:</b> ₹{transactionData.plan.price}</p>
                    <p><b>Data:</b> {transactionData.plan.data.dailyLimit ? `${transactionData.plan.data.dailyLimit} GB/day` : `${transactionData.plan.data.totalData} GB`}</p>
                    <p><b>Calls:</b> {transactionData.plan.calls}</p>
                    <p><b>SMS:</b> {transactionData.plan.sms}</p>
                    <p><b>Validity:</b> {transactionData.plan.validity} days</p>
                    <p><b>Transaction Date:</b> {new Date(transactionData.timestamp).toLocaleString()}</p>
                </div>
                <button
                    className="mt-6 bg-[#50c878] px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
                    onClick={() => navigate('/')}
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
}

export default Receipt;
