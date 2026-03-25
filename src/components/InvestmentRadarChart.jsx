import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

// Custom Tooltip for premium look
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="radar-tooltip">
        <p className="tooltip-label">{payload[0].payload.subject}</p>
        <p className="tooltip-value">
          <span className="tooltip-score glow">{payload[0].value.toFixed(1)}</span> / 100
        </p>
      </div>
    );
  }
  return null;
};

const InvestmentRadarChart = ({ summary }) => {
  if (!summary) return null;

  // Convert raw values (0 to 1 range, except knowledge which is arbitrary) to 0-100 scale for visual balance
  const sentimentScore = Math.min(Math.max(summary.avgSentiment * 100, 0), 100);
  
  // Knowledge level is usually increasing, let's normalize it arbitrarily for the radar (e.g., max 10)
  const knowledgeScore = Math.min(Math.max((summary.avgKnowledge / 10) * 100, 10), 100);
  
  // Volatility is usually small (e.g., 0.05 to 0.3), scale it to 100
  const riskScore = Math.min(Math.max(summary.volatility * 300, 0), 100);
  
  // Momentum is usually between -0.5 and 0.5. Map it to 0-100 where 0 is 50.
  const momentumScore = Math.min(Math.max((summary.momentum + 0.5) * 100, 0), 100);

  // Demand (calculated generically from sentiment and momentum)
  const demandScore = Math.min(Math.max((sentimentScore * 0.7) + (summary.momentum * 100 * 0.3) + 20, 0), 100);

  const data = [
    { subject: '시장 심리(Sentiment)', A: sentimentScore, fullMark: 100 },
    { subject: '모멘텀(Momentum)', A: momentumScore, fullMark: 100 },
    { subject: '기술지식(Knowledge)', A: knowledgeScore, fullMark: 100 },
    { subject: '수요예상(Demand)', A: demandScore, fullMark: 100 },
    { subject: '리스크(Volatility)', A: riskScore, fullMark: 100 },
  ];

  // Radar color depends on the investment signal
  const signalType = summary.investmentSignal.type; // 'success', 'danger', or 'neutral'
  let strokeColor = '#00f2ff'; // default accent-secondary
  let fillColor = 'rgba(0, 242, 255, 0.3)';

  if (signalType === 'danger') {
    strokeColor = '#ff4d4d'; // neg-color
    fillColor = 'rgba(255, 77, 77, 0.3)';
  } else if (signalType === 'success') {
    strokeColor = '#4dff88'; // pos-color
    fillColor = 'rgba(77, 255, 136, 0.3)';
  }

  return (
    <div className="radar-chart-wrapper" style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#a0a0a0', fontSize: 10, fontFamily: 'Inter' }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Radar
            name="Market Status"
            dataKey="A"
            stroke={strokeColor}
            fill={fillColor}
            fillOpacity={0.6}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestmentRadarChart;
