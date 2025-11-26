import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 text-center text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 pt-8">
        <p>&copy; {new Date().getFullYear()} Pig Family Hub. Built with love and mud.</p>
        <div className="flex justify-center gap-4 mt-2">
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">Help</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
