'use client';

import React, { useState } from 'react';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface Props {
    data: ProductType | null;
    isOpen: boolean;
    onClose: () => void;
}

const ModalSizeguide: React.FC<Props> = ({ data, isOpen, onClose }) => {
    const [activeSize, setActiveSize] = useState<string>('');
    const [heightRange, setHeightRange] = useState<{ min: number; max: number; }>({ min: 100, max: 200 });
    const [weightRange, setWeightRange] = useState<{ min: number; max: number; }>({ min: 30, max: 90 });

    const calculateSize = (height: number, weight: number) => {
        if (height > 180 || weight > 70) {
            setActiveSize('2XL');
        } else if (height > 170 || weight > 60) {
            setActiveSize('XL');
        } else if (height > 160 || weight > 50) {
            setActiveSize('L');
        } else if (height > 155 || weight > 45) {
            setActiveSize('M');
        } else if (height > 150 || weight > 40) {
            setActiveSize('S');
        } else {
            setActiveSize('XS');
        }
    };

    const handleHeightChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            setHeightRange({ min: values[0], max: values[1] });
        }
        calculateSize(heightRange.max, weightRange.max);
    };

    const handleWeightChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            setWeightRange({ min: values[0], max: values[1] });
        }
        calculateSize(heightRange.max, weightRange.max);
    };

    return (
        <>
            <div className={`modal-sizeguide-block`} onClick={onClose}>
                <div
                    className={`modal-sizeguide-main md:p-10 p-6 rounded-[32px] ${isOpen ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <div
                        className="close-btn absolute right-5 top-5 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                        onClick={onClose}
                    >
                        <Icon.X size={14} />
                    </div>
                    <div className="heading3">Size guide</div>

                    <table>
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Bust</th>
                                <th>Waist</th>
                                <th>Low Hip</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>XS</td>
                                <td>32</td>
                                <td>24-25</td>
                                <td>33-34</td>
                            </tr>
                            <tr>
                                <td>S</td>
                                <td>34-35</td>
                                <td>26-27</td>
                                <td>35-36</td>
                            </tr>
                            <tr>
                                <td>M</td>
                                <td>36-37</td>
                                <td>28-29</td>
                                <td>38-40</td>
                            </tr>
                            <tr>
                                <td>L</td>
                                <td>38-39</td>
                                <td>30-31</td>
                                <td>42-44</td>
                            </tr>
                            <tr>
                                <td>XL</td>
                                <td>40-41</td>
                                <td>32-33</td>
                                <td>45-47</td>
                            </tr>
                            <tr>
                                <td>2XL</td>
                                <td>42-43</td>
                                <td>34-35</td>
                                <td>48-50</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ModalSizeguide;