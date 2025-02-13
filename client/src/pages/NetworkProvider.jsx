import { Link } from "react-router-dom";
import PageLayout from "./PageLayout";

function NetworkProvider() {
    return (
        <PageLayout title="Network Provider">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 ">
                {["JIO", "Airtel", "VI"].map((provider) => (
                    <Link
                        to={`/NetworkProvider/${provider}`}
                        key={provider}
                        className="bg-[#1e1e1e] rounded-lg shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition duration-300 border border-blue-500"
                    >
                        <h2 className="text-2xl font-bold text-[#50c878] mb-2 text-center">{provider}</h2>
                        <div className="flex justify-center m-2">
                            <img
                                src={`./Network_Provider/${provider}.png`}
                                alt={provider}
                                className="w-full h-auto max-w-[250px] rounded-lg object-contain"
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </PageLayout>
    );
}

export default NetworkProvider;