
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Lock, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { login, siteTheme } = useData();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // --- Login Logic ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        try {
            const success = await login(username, password);
            if (!success) {
                setError('用户名或密码错误。');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('登录时发生错误。');
        } finally {
            setIsLoggingIn(false);
        }
    };

    // --- Guest Login ---
    const handleGuestLogin = async () => {
        setIsLoggingIn(true);
        try {
            await login(); // No args trigger guest: true logic in DataContext
            navigate('/');
        } catch (err) {
            setError('访客登录时发生错误。');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 font-serif relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('${siteTheme.loginBg}')` }}>
            {/* Background overlay removed */}
            {/* <div className="absolute inset-0 bg-amber-900/10 backdrop-blur-sm z-0"></div> */}

            <div className="bg-white/95 backdrop-blur-xl w-full max-w-md p-10 rounded-3xl shadow-2xl border border-white/60 relative z-10 animate-fade-in ring-1 ring-amber-100">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-lg mx-auto mb-5 border-4 border-white">
                        <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">欢迎回家</h1>
                    <p className="text-amber-700/80 text-sm mt-2 font-medium">猪一家·温馨的线上基地</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">用户名</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all font-bold text-slate-800 placeholder:text-slate-400"
                                placeholder="你的名字"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">密码</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all font-bold text-slate-800 placeholder:text-slate-400"
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-bold animate-pulse border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-300 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-75 disabled:cursor-wait"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? '正在进入猪窝...' : '立即登录'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
                    <button
                        onClick={handleGuestLogin}
                        className="w-full bg-amber-50 text-amber-600 font-bold py-3 rounded-2xl border border-amber-100 hover:bg-amber-100 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? '请稍后...' : (
                            <>
                                <Heart size={18} className="fill-current" />
                                我是猪迷 (访客入口)
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
