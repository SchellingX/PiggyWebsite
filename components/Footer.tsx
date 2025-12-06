import React, { useState } from 'react';
import { X, HelpCircle, Book, Heart } from 'lucide-react';

const Footer: React.FC = () => {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    return (
        <>
            <footer className="py-10 text-center text-slate-400 text-sm mt-auto relative z-10 font-serif">
                <div className="max-w-7xl mx-auto px-4 border-t border-slate-200/50 pt-8">

                    <p className="text-xs text-slate-600 font-bold mb-6">本猪窝在Google Gemini帮助下搭建</p>
                    <button onClick={() => setIsHelpOpen(true)} className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 cursor-pointer transition-colors bg-white/50 px-4 py-2 rounded-full border border-slate-200 hover:border-amber-200">
                        <HelpCircle size={16} /> <span className="font-bold">猪管指南</span>
                    </button>
                </div>
            </footer>

            {isHelpOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto ring-4 ring-amber-100">
                        <div className="bg-amber-50 p-6 flex items-center justify-between border-b border-amber-100">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <img src="/assets/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">猪管指南</h2>
                                    <p className="text-sm text-amber-600 font-bold">必读！否则没收零食！</p>
                                </div>
                            </div>
                            <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full hover:bg-amber-100 transition-colors shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <section>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Book size={20} className="text-amber-500" /> 1. 欢迎来到猪窝！
                                </h3>
                                <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl text-base border border-slate-100">
                                    这里是我们神圣的线上基地！不管是圆圆的黑历史照片、妈咪的（黑暗）料理食谱，还是爸比的陈年冷笑话，统统都能在这里找到。
                                    <br /><br />
                                    <strong>安全第一：</strong> 我们的数据都乖乖待在家里（本地服务器），非常安全，除非猪管我不小心踢到了电源线... 🐷
                                </p>
                            </section>
                            <section>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Heart size={20} className="text-amber-500" /> 2. 相册食用指南
                                </h3>
                                <ul className="space-y-3 text-base text-slate-600 list-disc pl-5 marker:text-amber-400">
                                    <li><strong>上传照片：</strong> 点击那个显眼的“添加回忆”按钮就好啦。</li>
                                    <li><strong>批量导入：</strong> 如果你已经在服务器的“那个神奇文件夹”里放了照片，直接选择“挂载导入”就行，猪管会自动把它们变出来的！✨</li>
                                    <li><strong>看视频：</strong> 现在支持视频啦！iPhone 的 Live Photo 也能动起来哦（点击播放按钮）。</li>
                                    <li><strong>规矩：</strong> 只有尊贵的管理员（我）和发布照片的人才能删除照片，其他人只能看不能删哦！</li>
                                </ul>
                            </section>
                        </div>

                        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                            <button onClick={() => setIsHelpOpen(false)} className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">朕已阅，退下吧</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;