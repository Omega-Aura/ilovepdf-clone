import React from 'react';
import { FileText, Menu } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <FileText className="h-8 w-8 text-brand-red" />
                        <span className="text-2xl font-bold text-gray-800 tracking-tight">
                            iLove<span className="text-brand-red">PDF</span> Clone
                        </span>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <a href="#" className="text-gray-600 hover:text-brand-red font-medium transition-colors">Merge PDF</a>
                        <a href="#" className="text-gray-600 hover:text-brand-red font-medium transition-colors">Split PDF</a>
                        <a href="#" className="text-gray-600 hover:text-brand-red font-medium transition-colors">Compress PDF</a>
                    </div>
                    <div className="flex items-center">
                        <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 md:hidden">
                            <Menu className="h-6 w-6" />
                        </button>
                        <button className="hidden md:block bg-brand-red text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
