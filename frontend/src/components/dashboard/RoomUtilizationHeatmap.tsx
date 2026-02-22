import { useState, useEffect } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { adminService, type RoomHeatmap } from '../../services/admin.service';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const RoomUtilizationHeatmap = () => {
    const [data, setData] = useState<RoomHeatmap[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeatmap = async () => {
            try {
                const heatmap = await adminService.getRoomUtilizationHeatmap();
                setData(heatmap);
            } catch (error) {
                console.error('Failed to fetch heatmap:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeatmap();
    }, []);

    const getColor = (count: number) => {
        if (count === 0) return '#f9fafb';
        if (count < 5) return '#dbeafe';
        if (count < 10) return '#93c5fd';
        if (count < 20) return '#3b82f6';
        return '#1e40af';
    };

    // Prepare complete data grid (24x7)
    const chartData = [];
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const match = data.find(d => d.dayOfWeek === day && d.hour === hour);
            chartData.push({
                day: day,
                hour: hour,
                count: match ? match.bookingCount : 0
            });
        }
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                    <p className="font-semibold text-gray-900">{DAYS[data.day]}, {data.hour}:00</p>
                    <p className="text-blue-600 font-medium">{data.count} bookings</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Room Utilization Heatmap</h3>
                <p className="text-sm text-gray-500">Peak hours vs Off-peak days</p>
            </div>

            <div className="h-[400px] w-full">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                        >
                            <XAxis
                                type="number"
                                dataKey="day"
                                name="Day"
                                domain={[0, 6]}
                                ticks={[0, 1, 2, 3, 4, 5, 6]}
                                tickFormatter={(val) => DAYS[val]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                            />
                            <YAxis
                                type="number"
                                dataKey="hour"
                                name="Hour"
                                domain={[0, 23]}
                                reversed
                                ticks={[0, 4, 8, 12, 16, 20]}
                                tickFormatter={(val) => `${val}:00`}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                            />
                            <ZAxis type="number" dataKey="count" range={[100, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter data={chartData} shape="square">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.count)} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-500 font-medium">
                <span>Low</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-[#dbeafe]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#93c5fd]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#3b82f6]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#1e40af]"></div>
                </div>
                <span>High</span>
            </div>
        </div>
    );
};

export default RoomUtilizationHeatmap;
