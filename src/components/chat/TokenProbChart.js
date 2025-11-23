import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TokenProbChart = ({ lastMessage, currentStep }) => {
    if (!lastMessage || !lastMessage.tokens[currentStep]) {
        return null;
    }

    const currentToken = lastMessage.tokens[currentStep];
    const data = [
        { token: currentToken.token, probability: currentToken.probability, fill: '#8884d8' },
        ...currentToken.alternatives.map(alt => ({
            token: alt.token,
            probability: alt.probability,
            fill: '#82ca9d'
        }))
    ].sort((a, b) => b.probability - a.probability);

    return (
        <div className="probability-chart">
            <h3>Token Probabilities (Step {currentStep + 1})</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical">
                    <XAxis type="number" domain={[0, 1]} tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} />
                    <YAxis type="category" dataKey="token" width={80} />
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
                    <Legend />
                    <Bar dataKey="probability" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TokenProbChart;
