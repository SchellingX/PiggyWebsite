import React, { useState } from 'react';
import { X, HelpCircle, Book, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <footer className="py-8 text-center text-slate-400 text-sm mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 pt-8">
          <p className="mb-2">&copy; {new Date().getFullYear()} 猪一家. 用爱与泥巴构建。</p>
          <p className="text-xs text-rose-300 font-medium mb-4">本猪窝在Google Gemini帮助下搭建</p>
          <div className="flex justify-center gap-4 mt-2">
              <button onClick={() => setIsHelpOpen(true)} className="flex items-center gap-1 hover:text-rose-500 cursor-pointer transition-colors">
                  <HelpCircle size={14} /> 猪管指南
              </button>
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      {isHelpOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                  <div className="bg-rose-50 p-6 flex items-center justify-between border-b border-rose-100">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-rose-400 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                              猪
                          </div>
                          <div>
                              <h2 className="text-xl font-bold text-slate-800">猪管的使用指南</h2>
                              <p className="text-xs text-rose-500 font-medium">必读！否则没收零食！</p>
                          </div>
                      </div>
                      <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white/50 p-2 rounded-full hover:bg-white transition-colors">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-8 space-y-8">
                      <section>
                          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Book size={20} className="text-rose-500"/> 1. 关于“猪一家”
                          </h3>
                          <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl text-sm">
                              这里是我们神圣的猪窝线上基地！也就是用来存圆圆的黑历史照片、妈咪的食谱（虽然不一定按着做）、还有爸比的那些无聊冷笑话的地方。
                              <br/><br/>
                              <strong>所有数据都保存在本地</strong>，非常安全，除非猪管我不小心把服务器电源踢掉了。
                          </p>
                      </section>

                      <section>
                          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Heart size={20} className="text-rose-500"/> 2. 如何使用相册
                          </h3>
                          <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
                              <li><strong>上传照片：</strong> 点击右上角的按钮。如果你在外面，就用普通的上传；如果你在家里的服务器旁边，可以把照片扔进 <code className="bg-slate-100 px-1 rounded">/media</code> 文件夹，然后选择“挂载导入”。</li>
                              <li><strong>视频支持：</strong> 是的！现在支持 iPhone 的 Live Photo (视频格式) 和普通视频了。点击那个带播放按钮的方块就行。</li>
                              <li><strong>别乱删：</strong> 只有管理员（也就是尊贵的猪管我）和发布者自己可以删除照片。</li>
                          </ul>
                      </section>

                      <section>
                          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Book size={20} className="text-rose-500"/> 3. 博客发文规范
                          </h3>
                          <p className="text-slate-600 text-sm mb-2">
                              写文章的时候，你可以随时停下来去吃点心，<strong>草稿会自动保存</strong>。不用谢。
                          </p>
                          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                             <p className="text-rose-700 font-bold text-sm mb-1">⚠️ 猪管的严正警告：</p>
                             <p className="text-rose-600 text-xs">
                                 禁止在博客里说猪管坏话。
                                 禁止上传猪管睡觉流口水的照片。
                                 禁止把“提醒事项”里的“洗碗”偷偷删掉。
                             </p>
                          </div>
                      </section>
                  </div>
                  
                  <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                      <button 
                          onClick={() => setIsHelpOpen(false)}
                          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                      >
                          朕已阅，退下吧
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default Footer;