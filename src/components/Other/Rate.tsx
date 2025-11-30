import React, { memo } from "react";
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface RateProps {
    currentRate: number | undefined;
    size: number;
}

const Rate: React.FC<RateProps> = ({ currentRate, size }) => {
    const arrOfStar = [];

    if (currentRate !== undefined && currentRate !== null) {
        // Round to nearest 0.5
        const roundedRate = Math.round(currentRate * 2) / 2;

        for (let i = 1; i <= 5; i++) {
            if (roundedRate >= i) {
                // Full star
                arrOfStar.push(<Icon.Star key={i} size={size} color="#ECB018" weight="fill" />);
            } else if (roundedRate >= i - 0.5) {
                // Half star
                arrOfStar.push(<Icon.StarHalf key={i} size={size} color="#ECB018" weight="fill" />);
            } else {
                // Empty star
                arrOfStar.push(<Icon.Star key={i} size={size} color="#9FA09C" weight="fill" />);
            }
        }
    } else {
        // No rating - show empty stars
        for (let i = 1; i <= 5; i++) {
            arrOfStar.push(<Icon.Star key={i} size={size} color="#9FA09C" weight="fill" />);
        }
    }

    return <div className="rate flex">{arrOfStar}</div>;
};

export default memo(Rate);