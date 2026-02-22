import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { adminService, type BookingTrend } from '../../services/admin.service';
import { format, subDays } from 'date-fns';

const BookingTrendsChart = () => {
    const [data, setData] = useState<BookingTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30'); // 7, 30, 90

    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(true);
            try {
                const endDate = new Date().toISOString();
                const startDate = subDays(new Date(), parseInt(range)).toISOString();
                const trends = await adminService.getBookingTrends({
                    startDate,
                    endDate,
                    granularity: 'daily'
                });
                setData(trends);
            } catch (error) {
                console.error('Failed to fetch booking trends:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [range]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
                    <p className="text-sm text-gray-500">Volume of bookings over time</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['7', '30', '90'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${range === r
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {r} Days
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Area
                                type="monotone"
                                dataKey="bookings"
                                name="Total Bookings"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorBookings)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="cancelled"
                                name="Cancelled"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCancelled)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default BookingTrendsChart;
