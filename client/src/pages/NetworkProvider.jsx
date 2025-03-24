// import { Link } from "react-router-dom";
// import PageLayout from "./PageLayout";

// function NetworkProvider() {
//     return (
//         <PageLayout title="Network Provider">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 ">
//                 {["Jio", "Airtel", "Vi"].map((provider) => (
//                     <Link
//                         to={`/NetworkProvider/${provider}`}
//                         key={provider}
//                         className="bg-[#1e1e1e] rounded-lg shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition duration-300 border border-blue-500"
//                     >
//                         <h2 className="text-2xl font-bold text-[#50c878] mb-2 text-center">{provider}</h2>
//                         <div className="flex justify-center m-2">
//                             <img
//                                 src={`./Network_Provider/${provider}.png`}
//                                 alt={provider}
//                                 className="w-full h-auto max-w-[250px] rounded-lg object-contain"
//                             />
//                         </div>
//                     </Link>
//                 ))}
//             </div>
//         </PageLayout>
//     );
// }

// export default NetworkProvider;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "./PageLayout";
import API from "../Utils/API";
import Slider from "react-slick";
// Import slick-carousel CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function NetworkProvider() {
    const [topFeedback, setTopFeedback] = useState([]);

    useEffect(() => {
        const fetchTopFeedback = async () => {
            try {
                const response = await API.get("/feedback/getAllFeedback");
                // filter to get only the feedback with a 5-star or 4-star rating.
                const topRated = response.data.data.filter(
                    (feedback) => feedback.rating === 5 || feedback.rating === 4
                );
                setTopFeedback(topRated);
            } catch (err) {
                console.error("Error fetching feedback", err);
            }
        };

        fetchTopFeedback();
    }, []);

    // Slider settings for infinite, continuous auto-play
    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 8000,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        cssEase: "linear",
        pauseOnHover: true,
        arrows: false,
    };

    return (
        <PageLayout title="Network Provider">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 ">
                {["Jio", "Airtel", "Vi"].map((provider) => (
                    <Link
                        to={`/NetworkProvider/${provider}`}
                        key={provider}
                        className="bg-[#1e1e1e] rounded-lg shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition duration-300 border border-blue-500"
                    >
                        <h2 className="text-2xl font-bold text-[#50c878] mb-2 text-center">
                            {provider}
                        </h2>
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

            {/* Feedback Carousel Section */}
            <div className="py-8 bg-gray-900">
                <h3 className="text-center text-2xl text-[#50c878] mb-4">
                    Top Feedback
                </h3>
                {topFeedback.length > 0 ? (
                    <Slider {...sliderSettings}>
                        {topFeedback.map((feedback, idx) => (
                            <div key={idx} className="px-2">
                                <div className="bg-[#1e1e1e] rounded-lg p-4 shadow-lg text-white h-full">
                                    <div className="flex justify-center mb-2">
                                        {Array.from({ length: feedback.rating }).map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-xl">
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm">{feedback.message}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <p className="text-center text-gray-400">
                        No top feedback available.
                    </p>
                )}
            </div>
        </PageLayout>
    );
}

export default NetworkProvider;
