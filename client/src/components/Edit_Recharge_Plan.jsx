import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../Utils/api';
import { FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Edit_Recharge_Plan() {
    const { provider, planId } = useParams();
    const [plan, setPlan] = useState(null);
    const [originalPlan, setOriginalPlan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await API.get(`/getRecharge_PlanById/${planId}`);
                setPlan(response.data);
                setOriginalPlan(response.data);
            } catch (error) {
                console.error('Error fetching plan:', error);
                toast.error('Failed to fetch plan details.');
            }
        };
        fetchPlan();
    }, [planId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/updateRecharge_Plan/${planId}`, plan);
            toast.success('Plan updated successfully!');
            setTimeout(() => {
                navigate(`/NetworkProvider/${provider}`);
            }, 2000);
        } catch (error) {
            console.error('Error updating plan:', error);
            toast.error('Failed to update plan.');
        }
    };

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

    const handleReset = () => {
        setPlan(originalPlan);
        toast.info('Form reset to original values.');
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (!plan) return <div className="text-center py-10 text-white">Loading...</div>;

    // Compute totalData dynamically
    const totalData = plan?.data?.dailyLimit && plan?.validity ? plan.data.dailyLimit * plan.validity : '';

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
                <h1 className="text-3xl font-bold text-green-400 mb-8">Edit Recharge Plan</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {[
                        { label: 'Platform', name: 'platform', readOnly: true },
                        { label: 'Category', name: 'category', readOnly: true },
                        { label: 'Price', name: 'price' },
                        { label: 'Validity (Days)', name: 'validity' },
                        { label: 'Daily Data Limit (GB)', name: 'data.dailyLimit' },
                        { label: 'Total Data (GB)', value: totalData, readOnly: true },
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
                                    value={name.includes('.') ? name.split('.').reduce((o, i) => (o ? o[i] : ''), plan) : plan[name] || ''}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400"
                                    rows="3"
                                />
                            ) : (
                                <input
                                    type="text"
                                    name={name}
                                    value={value !== undefined ? value : (name.includes('.') ? name.split('.').reduce((o, i) => (o ? o[i] : ''), plan) : plan[name] || '')}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400"
                                    readOnly={readOnly}
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end space-x-6">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 py-3 bg-gray-700 text-green-300 rounded-lg hover:bg-gray-600 hover:text-green-200"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-400"
                        >
                            Update Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Edit_Recharge_Plan;