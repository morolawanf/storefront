import React, { useState, useEffect } from 'react';

interface CountdownProps {
    endDate: Date | string;
}

const Countdown: React.FC<CountdownProps> = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endDate).getTime() - new Date().getTime();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div className="list-action -mt-1 mb-3">
            <div className="countdown-block flex items-center justify-between flex-wrap">
                <div className="countdown-time flex items-center gap-0.5 w-full">
                    <div className="item h-fit w-[20%] flex items-center justify-center bg-red text-white rounded-lg gap-0.5">
                        <div className="days heading7 text-center">{timeLeft.days < 10 ? `0${timeLeft.days}` : timeLeft.days}</div>
                        <div className="caption1 text-center">D</div>
                    </div>
                    <div className="heading5 font-light">:</div>
                    <div className="item h-fit w-[20%] flex items-center justify-center bg-red text-white rounded-lg gap-0.5">
                        <div className="hours heading7 text-center">{timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}</div>
                        <div className="caption1 text-center">H</div>
                    </div>
                    <div className="heading5 font-light">:</div>
                    <div className="item h-fit w-[20%] flex items-center justify-center bg-red text-white rounded-lg gap-0.5">
                        <div className="mins heading7 text-center">{timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}</div>
                        <div className="caption1 text-center">M</div>
                    </div>
                    <div className="heading5 font-light">:</div>
                    <div className="item h-fit w-[20%] flex items-center justify-center bg-red text-white rounded-lg gap-0.5">
                        <div className="secs heading7 text-center">{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}</div>
                        <div className="caption1 text-center">S</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Countdown;
