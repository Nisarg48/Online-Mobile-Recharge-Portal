/* eslint-disable react/prop-types */
import Sidebar from '../components/Sidebar';
import { useState } from 'react';

function PageLayout({ children, title }) {
    const [isOpen, setIsOpen] = useState(true); // Sidebar initially open

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div
                className={`flex-grow bg-gray-50 transition-all duration-300 ${
                    isOpen ? 'ml-64' : 'ml-16'
                }`}
            >
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default PageLayout;
