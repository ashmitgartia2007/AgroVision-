
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
    data: { date: string; value: number }[];
    dataKey: string;
    color: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-base-300/80 backdrop-blur-sm border border-base-100 rounded-lg shadow-lg">
                <p className="label font-semibold text-primary-content">{label}</p>
                <p className="intro text-base-content">{`${payload[0].name} : ${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }
    return null;
};

const TrendChart: React.FC<TrendChartProps> = ({ data, dataKey, color }) => {
    return (
        <div className="w-full h-96">
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" stroke="#A6ADBB" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#A6ADBB" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={false} name={dataKey.replace('_', ' ')} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
