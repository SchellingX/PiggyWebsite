import React, { useState } from 'react';
import { X, HelpCircle, Book, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <footer className="py-10 text-center text-slate-400 text-sm mt-auto relative z-10 font-serif">
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-200/50 pt-8">
          <p className="mb-2 font-medium">&copy; {new Date().getFullYear()} 猪一家. 用爱与泥巴构建。</p>
          <p className="text-xs text-amber-600/70 font-bold mb-6">本猪窝在Google Gemini帮助下搭建</p>
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
                              <Book size={20} className="text-amber-500"/> 1. 关于“猪一家”
                          </h3>
                          <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl text-base border border-slate-100">
                              这里是我们神圣的猪窝线上基地！也就是用来存圆圆的黑历史照片、妈咪的食谱（虽然不一定按着做）、还有爸比的那些无聊冷笑话的地方。
                              <br/><br/>
                              <strong>所有数据都保存在本地</strong>，非常安全，除非猪管我不小心把服务器电源踢掉了。
                          </p>
                      </section>
                      <section>
                          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Heart size={20} className="text-amber-500"/> 2. 如何使用相册
                          </h3>
                          <ul className="space-y-3 text-base text-slate-600 list-disc pl-5 marker:text-amber-400">
                              <li><strong>上传照片：</strong> 点击右上角的按钮。如果你在外面，就用普通的上传；如果你在家里的服务器旁边，可以把照片扔进 <code className="bg-slate-100 px-1 rounded text-slate-800 font-bold">/media</code> 文件夹，然后选择“挂载导入”。</li>
                              <li><strong>视频支持：</strong> 是的！现在支持 iPhone 的 Live Photo (视频格式) 和普通视频了。点击那个带播放按钮的方块就行。</li>
                              <li><strong>别乱删：</strong> 只有管理员（也就是尊贵的猪管我）和发布者自己可以删除照片。</li>
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