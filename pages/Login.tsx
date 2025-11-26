
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Lock, User, HelpCircle, Check, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login, resetUserPassword } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Forgot Password State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'question' | 'reset'>('question');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (!success) {
      setError('用户名或密码错误。');
    }
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');
      
      const normalizedAnswer = securityAnswer.trim();
      if (normalizedAnswer === '是' || normalizedAnswer === '是！' || normalizedAnswer.toLowerCase() === 'yes' || normalizedAnswer.toLowerCase() === 'yes!') {
          setStep('reset');
      } else {
          setResetError('回答错误！你需要诚实一点哦。');
      }
  };

  const handleResetPassword = (e: React.FormEvent) => {
      e.preventDefault();
      setResetError('');
      const success = resetUserPassword(resetUsername, newPassword);
      if (success) {
          setResetSuccess(true);
          setTimeout(() => {
              setIsForgotOpen(false);
              setStep('question');
              setResetSuccess(false);
              setResetUsername('');
              setSecurityAnswer('');
              setNewPassword('');
          }, 2000);
      } else {
          setResetError('找不到该用户。');
      }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] flex items-center justify-center px-4 font-sans relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-300 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300 rounded-full blur-[100px]" />
        </div>

        <div className="bg-white/80 backdrop-blur-xl w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/50 relative z-10 animate-fade-in">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-rose-400 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg mx-auto mb-4">
                    猪
                </div>
                <h1 className="text-2xl font-bold text-slate-800">欢迎回家</h1>
                <p className="text-slate-500 text-sm mt-1">请输入账号密码进入猪窝</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">用户名</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                            placeholder="你的名字"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">密码</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                            placeholder="••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium animate-pulse">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    登录
                </button>
            </form>

            <div className="mt-8 text-center">
                <button 
                    onClick={() => setIsForgotOpen(true)}
                    className="text-sm text-slate-400 hover:text-rose-500 font-medium transition-colors"
                >
                    忘记密码了？
                </button>
            </div>
        </div>

        {/* Forgot Password Modal */}
        {isForgotOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden">
                     {step === 'question' ? (
                        <form onSubmit={handleCheckAnswer}>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-3">
                                    <HelpCircle size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">安全提问</h3>
                                <p className="text-xs text-slate-500 mt-1">验证身份以重置密码</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">账号</label>
                                    <input 
                                        type="text"
                                        value={resetUsername}
                                        onChange={(e) => setResetUsername(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400 focus:outline-none"
                                        placeholder="输入要找回的用户名"
                                        required
                                    />
                                </div>
                                
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                                    <p className="font-bold text-amber-800 text-lg">你是猪吗？</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">答案</label>
                                    <input 
                                        type="text"
                                        value={securityAnswer}
                                        onChange={(e) => setSecurityAnswer(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400 focus:outline-none"
                                        placeholder="请诚实回答..."
                                        required
                                    />
                                </div>
                            </div>

                            {resetError && <p className="text-red-500 text-xs mt-3 text-center font-bold">{resetError}</p>}

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsForgotOpen(false)} className="flex-1 py-2.5 rounded-xl text-slate-500 font-medium hover:bg-slate-50">取消</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-600">验证</button>
                            </div>
                        </form>
                     ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-3">
                                    <Check size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">验证成功！</h3>
                                <p className="text-xs text-slate-500 mt-1">现在为 <b>{resetUsername}</b> 设置新密码</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">新密码</label>
                                    <input 
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-green-400 focus:outline-none"
                                        placeholder="输入新密码"
                                        required
                                    />
                                </div>
                            </div>

                             {resetSuccess ? (
                                <div className="mt-6 bg-green-50 text-green-600 p-3 rounded-xl text-center font-bold text-sm">
                                    密码修改成功！正在跳转...
                                </div>
                             ) : (
                                <>
                                    {resetError && <p className="text-red-500 text-xs mt-3 text-center font-bold">{resetError}</p>}
                                    <button type="submit" className="w-full mt-6 py-3 rounded-xl bg-slate-900 text-white font-bold shadow-lg flex items-center justify-center gap-2">
                                        重置密码 <ArrowRight size={16} />
                                    </button>
                                </>
                             )}
                        </form>
                     )}
                </div>
            </div>
        )}
    </div>
  );
};

export default Login;
