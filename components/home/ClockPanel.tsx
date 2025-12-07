import React, { useState, useEffect } from 'react';

const ClockPanel: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const date = time.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const day = time.toLocaleDateString('zh-CN', { weekday: 'long' });
    const timeString = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
        <div className="text-center flex flex-col justify-center items-center mb-10 drop-shadow-lg animate-fade-in-up">
            <p className="text-7xl md:text-9xl font-bold text-white tracking-tighter" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>{timeString}</p>
            <p className="text-xl md:text-2xl text-white/90 font-medium mt-2 tracking-widest uppercase">{date} {day}</p>
        </div>
    );
};

export default ClockPanel;
