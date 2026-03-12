import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Save, Image as ImageIcon, MapPin, LogIn, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const fileToBase64 = async (file: File): Promise<string | null> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    return null;
  }
};

export default function AdminPanel({ onClose, initialTab = 'roteiros' }: { onClose: () => void, initialTab?: 'roteiros' | 'gallery' }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'roteiros' | 'gallery'>(initialTab);
  const [roteiros, setRoteiros] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [editingRoteiro, setEditingRoteiro] = useState<any>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [rotRes, galRes] = await Promise.all([
        fetch('/api/roteiros'),
        fetch('/api/gallery')
      ]);
      const rotData = await rotRes.json();
      const galData = await galRes.json();
      setRoteiros(rotData);
      setGallery(galData);
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
      } else {
        setLoginError(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setLoginError('Erro de conexão');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  const handleSaveRoteiro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingRoteiro.id ? 'PUT' : 'POST';
      const url = editingRoteiro.id ? `/api/roteiros/${editingRoteiro.id}` : '/api/roteiros';
      
      await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingRoteiro)
      });
      
      setEditingRoteiro(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar roteiro", error);
    }
    setLoading(false);
  };

  const handleDeleteRoteiro = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este roteiro?')) return;
    try {
      await fetch(`/api/roteiros/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir roteiro", error);
    }
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    
    const base64 = await fileToBase64(file);
    if (base64) {
      try {
        await fetch('/api/gallery', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: base64 })
        });
        fetchData();
      } catch (error) {
        console.error("Erro ao adicionar foto", error);
      }
    }
    setLoading(false);
    e.target.value = ''; // reset input
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;
    try {
      await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir foto", error);
    }
  };

  const handleAddRoteiroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    setLoading(true);
    
    const newImages = [...(editingRoteiro.images || [])];
    for (const file of files) {
      const base64 = await fileToBase64(file);
      if (base64) newImages.push(base64);
    }
    
    setEditingRoteiro({ ...editingRoteiro, images: newImages });
    setLoading(false);
    e.target.value = '';
  };

  const handleRemoveRoteiroImage = (index: number) => {
    const newImages = [...editingRoteiro.images];
    newImages.splice(index, 1);
    setEditingRoteiro({ ...editingRoteiro, images: newImages });
  };

  if (!token) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-3xl p-8 w-full max-w-md relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X /></button>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-900">Acesso Restrito</h2>
            <p className="text-stone-500 text-sm mt-2">Faça login para gerenciar o conteúdo.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">E-mail</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Senha</label>
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" /> Entrar
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-stone-100 flex flex-col"
    >
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-stone-900">Painel Administrativo</h1>
          <div className="flex bg-stone-100 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('roteiros')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'roteiros' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Roteiros
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'gallery' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Fotos
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-stone-900">Sair</button>
          <button onClick={onClose} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-600"><X className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          
          {activeTab === 'roteiros' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-900">Gerenciar Roteiros</h2>
                <button 
                  onClick={() => setEditingRoteiro({ title: '', subtitle: '', price: '', timeDeparture: '', timeReturn: '', images: [], places: [], courtesy: [], history: '', gastronomy: '', curiosities: '' })}
                  className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-stone-800"
                >
                  <Plus className="w-4 h-4" /> Novo Roteiro
                </button>
              </div>

              {editingRoteiro ? (
                <form onSubmit={handleSaveRoteiro} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Título</label>
                      <input type="text" value={editingRoteiro.title} onChange={e => setEditingRoteiro({...editingRoteiro, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Subtítulo</label>
                      <input type="text" value={editingRoteiro.subtitle} onChange={e => setEditingRoteiro({...editingRoteiro, subtitle: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Preço</label>
                      <input type="text" value={editingRoteiro.price} onChange={e => setEditingRoteiro({...editingRoteiro, price: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Saída</label>
                        <input type="text" value={editingRoteiro.timeDeparture} onChange={e => setEditingRoteiro({...editingRoteiro, timeDeparture: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Retorno</label>
                        <input type="text" value={editingRoteiro.timeReturn} onChange={e => setEditingRoteiro({...editingRoteiro, timeReturn: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Imagens do Roteiro</label>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {editingRoteiro.images?.map((img: string, i: number) => (
                        <div key={i} className="relative aspect-video bg-stone-100 rounded-lg overflow-hidden group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => handleRemoveRoteiroImage(i)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 cursor-pointer transition-colors">
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium">Adicionar</span>
                        <input type="file" accept="image/*" multiple onChange={handleAddRoteiroImage} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Locais (separados por vírgula)</label>
                    <input type="text" value={editingRoteiro.places.join(', ')} onChange={e => setEditingRoteiro({...editingRoteiro, places: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full border rounded-lg px-3 py-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">História</label>
                      <textarea value={editingRoteiro.history} onChange={e => setEditingRoteiro({...editingRoteiro, history: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={3} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Gastronomia</label>
                      <textarea value={editingRoteiro.gastronomy} onChange={e => setEditingRoteiro({...editingRoteiro, gastronomy: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={3} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Curiosidades</label>
                      <textarea value={editingRoteiro.curiosities} onChange={e => setEditingRoteiro({...editingRoteiro, curiosities: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={3} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button type="button" onClick={() => setEditingRoteiro(null)} className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2">
                      <Save className="w-4 h-4" /> Salvar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roteiros.map(roteiro => (
                    <div key={roteiro.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
                      <div className="h-32 bg-stone-100 rounded-xl mb-4 overflow-hidden">
                        {roteiro.images?.[0] ? (
                          <img src={roteiro.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon /></div>
                        )}
                      </div>
                      <h3 className="font-bold text-stone-900">{roteiro.title}</h3>
                      <p className="text-sm text-stone-500 mb-4">{roteiro.subtitle}</p>
                      <div className="mt-auto flex gap-2">
                        <button onClick={() => setEditingRoteiro(roteiro)} className="flex-1 bg-stone-100 text-stone-700 py-2 rounded-lg text-sm font-medium hover:bg-stone-200">Editar</button>
                        <button onClick={() => handleDeleteRoteiro(roteiro.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-900">Galeria de Fotos</h2>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-900 mb-2">Adicionar Nova Foto</h3>
                <p className="text-stone-500 text-sm mb-6">Faça o upload de uma imagem do seu computador para a galeria.</p>
                <label className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 cursor-pointer transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Selecionar Imagem
                  <input type="file" accept="image/*" onChange={handleAddPhoto} className="hidden" />
                </label>
                {loading && <p className="text-sm text-stone-400 mt-4 animate-pulse">Processando imagem...</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map(item => (
                  <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square bg-stone-100">
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleDeletePhoto(item.id)} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-transform hover:scale-110">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </motion.div>
  );
}
