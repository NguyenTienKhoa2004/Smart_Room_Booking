
import Navbar from '../../components/Navbar';
import BookingTrendsChart from '../../components/dashboard/BookingTrendsChart';
import RoomUtilizationHeatmap from '../../components/dashboard/RoomUtilizationHeatmap';
import UserActivityMetrics from '../../components/dashboard/UserActivityMetrics';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link
                        to="/admin"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Detailed insights into system usage and booking patterns
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Full Width Booking Trends */}
                    <BookingTrendsChart />

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Heatmap Section */}
                        <RoomUtilizationHeatmap />

                        {/* User Metrics Section */}
                        <UserActivityMetrics />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
