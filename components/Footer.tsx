import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 text-center text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 pt-8">
        <p>&copy; {new Date().getFullYear()} 佩奇家庭中心. 用爱与泥巴构建。</p>
        <div className="flex justify-center gap-4 mt-2">
            <span className="hover:text-rose-500 cursor-pointer transition-colors">隐私</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">条款</span>
            <span className="hover:text-rose-500 cursor-pointer transition-colors">帮助</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;