import { Link } from "react-router-dom";
import PageLayout from "./PageLayout";

function NetworkProvider() {
    return (
        <PageLayout title="Network Provider">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {["JIO", "Airtel", "VI"].map((provider) => (
                    <Link 
                        to={`/NetworkProvider/${provider}`}
                        key={provider}
                        className=" rounded-lg shadow-md p-4 hover:shadow-lg hover:scale-105 transition duration-300  border-2 border-gray-600"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">{provider}</h2>
                        <div className="flex justify-center">
                            <img
                                src={`./Network_Provider/${provider}.png`} 
                                alt={provider}
                                className="w-full h-auto max-w-[200px] rounded-md object-contain"
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </PageLayout>
    );
}

export default NetworkProvider;
