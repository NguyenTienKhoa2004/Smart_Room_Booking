import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { adminService, type DashboardStats } from '../services/admin.service';
import {
    Users,
    Calendar,
    Home,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Shield
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err);
                setError('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="p-8">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <p className="ml-3 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center text-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">Overview of the booking system.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Bookings Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.bookings.totalBookings}</p>
                            </div>
                            <div>
                                <Calendar color="black"
                                    strokeWidth={3}
                                    size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 flex items-center font-medium">
                                <TrendingUp color="black"
                                    strokeWidth={3}
                                    size={24} />
                                {stats?.bookings.activeBookings}
                            </span>
                            <span className="text-gray-400 ml-2">active now</span>
                        </div>
                    </div>

                    {/* Users Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.users.totalUsers}</p>
                            </div>
                            <div>
                                <Users color="black"
                                    strokeWidth={3}
                                    size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                                {stats?.users.activeUsers} active
                            </span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-red-500 font-medium flex items-center">
                                {stats?.users.bannedUsers} banned
                            </span>
                        </div>
                    </div>

                    {/* Rooms Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.rooms.totalRooms}</p>
                            </div>
                            <div>
                                <Home color="black"
                                    strokeWidth={3}
                                    size={24} />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            Avg. capacity: <span className="font-medium text-gray-900">{stats?.rooms.averageCapacity}</span> people
                        </div>
                    </div>

                    {/* System Status / Admins */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Administrators</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.users.adminUsers}</p>
                            </div>
                            <div>
                                <Shield color="black"
                                    strokeWidth={3}
                                    size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <CheckCircle
                                color="black"
                                strokeWidth={3}
                                size={18}
                            />
                            <span>System Operational</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Access / Route Management */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">Admin Management</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/admin/users" className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-100 transition-colors">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">User Management</p>
                                    <p className="text-xs text-gray-500">Manage users, ban/unban</p>
                                </div>
                            </Link>

                            <Link to="/admin/roles" className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-md group-hover:bg-orange-100 transition-colors">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">Roles & Permissions</p>
                                    <p className="text-xs text-gray-500">Access control settings</p>
                                </div>
                            </Link>

                            <Link to="/admin/rooms" className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-md group-hover:bg-purple-100 transition-colors">
                                    <Home className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">Room Management</p>
                                    <p className="text-xs text-gray-500">Add, edit, remove rooms</p>
                                </div>
                            </Link>

                            <Link to="/admin/bookings" className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-100 transition-colors">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">Booking Management</p>
                                    <p className="text-xs text-gray-500">View all system bookings</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Most Booked Rooms */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">Popular Rooms</h3>
                        </div>
                        <ul className="divide-y divide-gray-50">
                            {stats?.rooms.mostBookedRooms.length === 0 ? (
                                <li className="p-6 text-center text-gray-500 text-sm">No bookings yet.</li>
                            ) : (
                                stats?.rooms.mostBookedRooms.map((room) => (
                                    <li key={room.roomId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {room.roomName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{room.roomName}</p>
                                                <p className="text-xs text-gray-500">ID: {room.roomId}</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {room.bookingCount} bookings
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
