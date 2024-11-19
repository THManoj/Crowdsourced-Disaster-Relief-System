import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [recentDonations, setRecentDonations] = useState([]);
    
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    // Settings for donations slider
    const donationSliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    useEffect(() => {
        const fetchRecentDonations = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getDonationDetails');
                setRecentDonations(response.data); // Get all donations
            } catch (error) {
                console.error('Error fetching recent donations:', error);
            }
        };

        fetchRecentDonations();
    }, []);

    const handleGetInvolvedClick = () => {
        navigate('/ongoing-disasters');
    };

    return (
        <div className="home">
            <header className="hero">
                <h1>Welcome to the Disaster Relief App</h1>
                <p>Your one-stop solution for disaster reporting and volunteering!</p>
                <button className="cta-button" onClick={handleGetInvolvedClick}>
                    Get Involved
                </button>
            </header>

            {/* Recent Donations Section */}
            <section className="recent-donations">
                <h2>Recent Donations</h2>
                <div className="donations-slider">
                    <Slider {...donationSliderSettings}>
                        {recentDonations.map((donation) => (
                            <div key={donation.donation_id} className="donation-card">
                                <div className="donation-content">
                                    <h3>Amount: ₹{parseFloat(donation.amount).toFixed(2)}</h3>
                                    <p>Location: {donation.location}</p>
                                    <p>Date: {new Date(donation.donated_at).toLocaleDateString()}</p>
                                    <p>Disaster Type: {donation.disaster_type}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>

            <section className="features">
                <h2>Our Features</h2>
                <Slider {...sliderSettings} className="carousel">
                    <div className="slide">
                        <img src="/images/i1.jpg" alt="Disaster Reports" className="slide-image"/>
                        <p>Stay updated with the latest disaster reports from around the world.</p>
                    </div>
                    <div className="slide">
                        <img src="/images/i2.jpg" alt="Volunteer Tasks" className="slide-image"/>
                        <p>Join our community and find volunteer tasks that suit you.</p>
                    </div>
                    <div className="slide">
                        <img src="/images/i3.jpg" alt="Community Support" className="slide-image"/>
                        <p>Connect with other volunteers and support each other in times of need.</p>
                    </div>
                </Slider>
            </section>

            <footer className="home-footer">
                <p>&copy; 2024 Disaster Relief App. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
