import PageLayout from "./PageLayout";

function NetworkProvider() {
    return (
        <PageLayout title="Network Provider">
            <p className="text-lg text-gray-600 mb-8">
                Welcome to the Network Provider page. Here, you can view and manage all the available network providers.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {["Jio", "Airtel", "VI", "BSNL"].map((provider) => (
                    <div
                        key={provider}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">{provider}</h2>
                        <p className="text-gray-600">
                            {provider} offers great plans for mobile and internet users. Check out the latest offers today!
                        </p>
                    </div>
                ))}
            </div>
        </PageLayout>
    );
}

export default NetworkProvider;