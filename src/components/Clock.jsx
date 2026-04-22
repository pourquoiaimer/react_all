import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const formattedTime = time.toLocaleTimeString([], { hour12: false });

    return (
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'black', fontSize: '1.5em' }}>
            {formattedTime}
        </span>
    );
};

export default Clock;
