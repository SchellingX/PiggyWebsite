import React from 'react';
import { useData } from '../context/DataContext';
import ClockPanel from '../components/home/ClockPanel';
import SearchPanel from '../components/home/SearchPanel';
import AppsPanel from '../components/home/AppsPanel';

const Home: React.FC = () => {
    const { siteTheme } = useData();

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed transition-all duration-500 overflow-hidden flex flex-col items-center"
            style={{ backgroundImage: `url('${siteTheme.homeBanner}')` }}
        >
            {/* Background overlay removed */}
            {/* <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" /> */}

            {/* Main Content Area - Centered Vertical Layout */}
            <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center items-center py-20 px-4">
                <ClockPanel />
                <SearchPanel />
                <AppsPanel />
            </div>

            {/* Simple Footer */}
            <div className="relative z-10 w-full p-6 text-center text-white/40 text-xs font-medium tracking-wide">
                PIGGY FAMILY HUB · {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default Home;