import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../Utils/API';
import { FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

function Add_Recharge_Plan() {
    const { provider } = useParams();
    const navigate = useNavigate();

    const [plan, setPlan] = useState({
        platform: provider,
        category: '',
        price: '',
        validity: '',
        data: { dailyLimit: '', totalData: '', postLimitSpeed: '' },
        calls: '',
        sms: '',
        additionalDetails: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setPlan({
                ...plan,
                [parent]: {
                    ...plan[parent],
                    [child]: value,
                },
            });
        } else {
            setPlan({ ...plan, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/addRecharge_Plan', plan)
            .then((res) => {
                toast.success(res);
                setTimeout(() => {
                    navigate(`/NetworkProvider/${provider}`);
                }, 2000);
            })
            .catch((err) => {
                toast.error(err);
            });
        } catch (error) {
            console.error('Error adding plan:', error);
            toast.error('Failed to add recharge plan.');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-black py-12 px-6 sm:px-8 lg:px-16">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="max-w-4xl mx-auto bg-gray-900 bg-opacity-80 rounded-xl shadow-xl p-8 text-white">
                <button
                    onClick={handleBack}
                    className="flex items-center text-green-400 hover:text-green-300 mb-6 text-lg"
                >
                    <FaArrowLeft className="mr-2" /> Back
                </button>
                <h1 className="text-3xl font-bold text-green-400 mb-8">Add Recharge Plan</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {[
                        { label: 'Platform', name: 'platform', readOnly: true },
                        { label: 'Category', name: 'category' },
                        { label: 'Price', name: 'price' },
                        { label: 'Validity (Days)', name: 'validity' },
                        { label: 'Daily Data Limit (GB)', name: 'data.dailyLimit' },
                        { label: 'Total Data (GB)', value: plan.data.dailyLimit * plan.validity, readOnly: true },
                        { label: 'Post Limit Speed', name: 'data.postLimitSpeed' },
                        { label: 'Calls', name: 'calls' },
                        { label: 'SMS', name: 'sms' },
                        { label: 'Additional Details', name: 'additionalDetails', textarea: true }
                    ].map(({ label, name, readOnly, textarea, value }, index) => (
                        <div key={index}>
                            <label className="block text-lg font-medium text-green-300 mb-2">{label}</label>
                            {textarea ? (
                                <textarea
                                    name={name}
                                    value={plan[name] || ''}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400"
                                    rows="3"
                                />
                            ) : (
                                <input
                                    type="text"
                                    name={name}
                                    value={value !== undefined ? value : name.includes('.') ? name.split('.').reduce((o, i) => (o ? o[i] : ''), plan) : plan[name] || ''}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400"
                                    readOnly={readOnly}
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end space-x-6">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-400"
                        >
                            Add Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Add_Recharge_Plan;
