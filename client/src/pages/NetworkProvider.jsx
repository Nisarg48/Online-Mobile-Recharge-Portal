import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "./PageLayout";
import API from "../Utils/api";
import { PROVIDERS } from "../Utils/providers";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function NetworkProvider() {
    const [topFeedback, setTopFeedback] = useState([]);

    useEffect(() => {
        const fetchTopFeedback = async () => {
            try {
                const response = await API.get("/feedback/public");
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
            <div className="grid grid-cols-1 gap-4 p-0 sm:gap-6 sm:p-6 md:grid-cols-2 lg:grid-cols-3">
                {PROVIDERS.map((provider) => (
                    <Link
                        to={`/NetworkProvider/${provider.name}`}
                        key={provider.name}
                        className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-4 shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg sm:p-5"
                    >
                        <h2 className="mb-4 text-center text-lg font-semibold text-[#50c878] sm:text-xl">
                            {provider.name}
                        </h2>
                        <div className="flex justify-center">
                            <img
                                src={`./Network_Provider/${provider.logo}`}
                                alt={provider.name}
                                className="h-auto w-full max-w-[140px] rounded-lg object-contain sm:max-w-[180px]"
                            />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Feedback Carousel */}
            <div className="rounded-xl bg-[#111827] py-8 sm:py-12">
                <h3 className="mb-6 text-center text-2xl font-bold text-[#50c878] sm:mb-8 sm:text-3xl">
                    Top Feedback
                </h3>
                {topFeedback.length > 0 ? (
                    <Slider {...sliderSettings}>
                        {topFeedback.map((feedback, idx) => (
                            <div key={idx} className="px-4">
                                <div className="flex min-h-[200px] max-h-[260px] flex-col justify-between rounded-lg border border-[#333333] bg-[#1f2937] p-4 text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 sm:min-h-[220px] sm:p-6">
                                    
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
