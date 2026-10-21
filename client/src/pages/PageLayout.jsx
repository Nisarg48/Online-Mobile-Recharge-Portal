/* eslint-disable react/prop-types */
function PageLayout({ children, title, isModalOpen }) {
    return (
        <div className={`relative flex w-full flex-col overflow-x-hidden bg-[#121212] ${isModalOpen ? 'backdrop-blur-sm' : ''}`}>
            {/* Main Content */}
            <div className="z-0 mx-3 mb-4 min-h-[70vh] flex-grow rounded-lg border border-[#50c878] bg-[#1e1e1e] p-4 shadow-lg sm:mx-4 sm:mb-6 sm:p-6">
                <h3 className="mb-4 text-center text-2xl font-semibold leading-[1.35] text-[#ffffff] sm:mb-5 sm:text-3xl md:text-4xl">{title}</h3>
                {children}
            </div>
        </div>
    );
}

export default PageLayout;