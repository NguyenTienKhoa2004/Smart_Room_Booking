import Navbar from '../components/Navbar';
import { Calendar, Users, Clock } from 'lucide-react';
const Home = () => {

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="relative">
                <img
                    className="h-28 w-full object-cover sm:h-36 md:h-48 lg:w-full lg:h-[500px] transition-transform duration-700 ease-in-out group-hover:scale-110"
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"
                    alt="Modern office"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/65 via-80% to-black/30"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
                        Make room booking easy
                    </h1>
                    <p className="text-white text-lg md:text-xl mt-4 max-w-2xl opacity-90 drop-shadow-md">
                        Streamline your workspace management. Book rooms, manage schedules, and collaborate efficiently with our smart booking system.
                    </p>
                </div>
            </div>

            <div className="text-center mt-16 flex flex-col items-center px-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-thin text-gray-900 tracking-tight">
                    Explore our rooms
                </h1>
                <p className="text-base md:text-sm lg:text-base mt-4 max-w-2xl text-gray-600 leading-relaxed">
                    Find the perfect space for your team with our premium rooms. From state-of-the-art boardrooms to warm and inviting creative spaces, we provide you with the required space within your budget.
                </p>
            </div>
            {/* Room Showcase Section */}
            <section className="room-showcase">
                <div className="showcase-container">
                    <div className="showcase-content">
                        <h2 className="text-xl font-extrabold text-gray-900 sm:text-4xl">
                            Premium Spaces for Modern Teams
                        </h2>
                        <p className="mt-4 text-lg text-gray-500">
                            Our rooms are thoughtfully designed to enhance your productivity and offer the best
                            space for collaboration. From state-of-the-art boardrooms to warm and inviting creative spaces,
                            we provide you with the required space within your budget.
                        </p>
                        <div className="mt-8 space-y-6">
                            {[
                                { title: 'State-of-the-art Tech', desc: '4K displays and crystal-clear audio systems.' },
                                { title: 'Ergonomic Comfort', desc: 'Premium seating and adjustable climate control.' },
                                { title: 'Privacy Focused', desc: 'Sound-proofed walls for confidential meetings.' }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                        <p className="text-gray-500">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="showcase-gallery">
                        {[
                            { title: 'Executive Suite', label: 'Executive', img: '/benjamin-child-0sT9YhNgSEs-unsplash.jpg' },
                            { title: 'Tech Hub', label: 'Digital', img: '/benjamin-child-GWe0dlVD9e0-unsplash.jpg' },
                            { title: 'Creative Studio', label: 'Design', img: '/danielle-cerullo-bIZJRVBLfOM-unsplash.jpg' },
                            { title: 'Board Room', label: 'Meeting', img: '/s-o-c-i-a-l-c-u-t-1RT4txDDAbM-unsplash.jpg' },
                            { title: 'Open Lounge', label: 'Connect', img: '/vizito-visitor-management-L__MBAI3ucc-unsplash.jpg' }
                        ].map((item, index) => (
                            <div key={index} className="gallery-item">
                                <img src={item.img} alt={item.title} />

                                <div className="gallery-overlay">
                                    <h3 className="text-xl font-bold">{item.title}</h3>
                                    <p className="text-sm opacity-90">Book this premium space now</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Better way to manage spaces
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            <div className="relative p-6 rounded-xl transition-all duration-300 ease-in-out hover:bg-white hover:-translate-y-2 hover:shadow-2xl group cursor-pointer">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white transition-transform duration-300 group-hover:scale-110">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                                        Instant Booking
                                    </p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Book available rooms instantly directly from your dashboard.
                                </dd>
                            </div>

                            <div className="relative p-6 rounded-xl transition-all duration-300 ease-in-out hover:bg-white hover:-translate-y-2 hover:shadow-2xl group cursor-pointer">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white transition-transform duration-300 group-hover:scale-110">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                                        Team Collaboration
                                    </p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Invite team members and manage group schedules seamlessly.
                                </dd>
                            </div>

                            <div className="relative p-6 rounded-xl transition-all duration-300 ease-in-out hover:bg-white hover:-translate-y-2 hover:shadow-2xl group cursor-pointer">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white transition-transform duration-300 group-hover:scale-110">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                                        Real-time Availability
                                    </p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    See room status in real-time to avoid conflicts.
                                </dd>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
