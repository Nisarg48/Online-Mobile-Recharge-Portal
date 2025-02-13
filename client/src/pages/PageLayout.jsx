/* eslint-disable react/prop-types */
import Navbar from '../components/NavBar';

function PageLayout({ children, title, isModalOpen }) {
    return (
        <div className={`relative flex flex-col min-h-screen bg-[#121212] w-full overflow-hidden ${isModalOpen ? 'backdrop-blur-sm' : ''}`}>
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="flex-grow p-6 mt-20 bg-[#1e1e1e] border border-[#50c878] rounded-lg shadow-lg mx-4 my-6 overflow-y-auto z-0">
                <h3 className="text-4xl font-semibold text-[#ffffff] mb-5 text-center">{title}</h3>
                {children}
            </div>
        </div>
    );
}

export default PageLayout;