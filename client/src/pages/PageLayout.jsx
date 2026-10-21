/* eslint-disable react/prop-types */
function PageLayout({ children, title, isModalOpen }) {
    return (
        <div className={`relative flex flex-col min-h-screen bg-[#121212] w-full overflow-x-hidden ${isModalOpen ? 'backdrop-blur-sm' : ''}`}>
            {/* Main Content */}
            <div className="z-0 my-4 mx-3 flex-grow rounded-lg border border-[#50c878] bg-[#1e1e1e] p-4 shadow-lg sm:my-6 sm:mx-4 sm:p-6">
                <h3 className="mb-4 text-center text-2xl font-semibold leading-[1.35] text-[#ffffff] sm:mb-5 sm:text-3xl md:text-4xl">{title}</h3>
                {children}
            </div>
        </div>
    );
}

export default PageLayout;