import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "./PageLayout";
import API from "../Utils/API";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function NetworkProvider() {
    const [topFeedback, setTopFeedback] = useState([]);

    useEffect(() => {
        const fetchTopFeedback = async () => {
            try {
                const response = await API.get("/feedback/getAllFeedback");
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

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 2000,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: "ease-in-out",
        pauseOnHover: true,
        arrows: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2 },
            },
            {
                breakpoint: 640,
                settings: { slidesToShow: 1 },
            },
        ],
    };

    return (
        <PageLayout title="Network Provider">
            {/* Network Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {["Jio", "Airtel", "Vi"].map((provider) => (
                    <Link
                        to={`/NetworkProvider/${provider}`}
                        key={provider}
                        className="bg-[#1e1e1e] rounded-xl shadow-md p-5 hover:shadow-lg hover:scale-105 transition-transform duration-300 border border-blue-400"
                    >
                        <h2 className="text-xl font-semibold text-[#50c878] mb-4 text-center">
                            {provider}
                        </h2>
                        <div className="flex justify-center">
                            <img
                                src={`./Network_Provider/${provider}.png`}
                                alt={provider}
                                className="w-full h-auto max-w-[180px] rounded-lg object-contain"
                            />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Feedback Carousel */}
            <div className="py-12 bg-[#111827]">
                <h3 className="text-center text-3xl font-bold text-[#50c878] mb-8">
                    Top Feedback
                </h3>
                {topFeedback.length > 0 ? (
                    <Slider {...sliderSettings}>
                        {topFeedback.map((feedback, idx) => (
                            <div key={idx} className="px-4">
                                <div className="bg-[#1f2937] rounded-lg p-6 shadow-lg text-white min-h-[220px] max-h-[260px] flex flex-col justify-between transition-transform hover:scale-105 duration-300 ease-in-out">
                                    
                                    {/* Rating */}
                                    <div className="flex justify-center mb-2">
                                        {Array.from({ length: feedback.rating }).map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-base">★</span>
                                        ))}
                                        {Array.from({ length: 5 - feedback.rating }).map((_, i) => (
                                            <span key={i} className="text-gray-600 text-base">★</span>
                                        ))}
                                    </div>

                                    {/* Message */}
                                    <p className="text-center text-gray-300 italic text-sm line-clamp-3 px-2 mb-4">
                                        &quot;{feedback.message.length > 120 ? feedback.message.slice(0, 120) + "..." : feedback.message}&quot;
                                    </p>

                                    {/* User and Date */}
                                    <div className="flex justify-between items-center text-gray-400 text-xs mt-2 px-1">
                                        <span className="truncate max-w-[120px]">
                                            {feedback.user?.name || "Anonymous"}
                                        </span>
                                        <span>
                                            {new Date(feedback.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <p className="text-center text-gray-400 text-sm">
                        No top feedback available.
                    </p>
                )}
            </div>
        </PageLayout>
    );
}

export default NetworkProvider;
