import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Save, Image as ImageIcon, MapPin, LogIn, Upload, LayoutDashboard, Image as ImageLucide, LogOut, Settings } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    return file;
  }
};

export default function AdminPanel({ onClose, initialTab = 'roteiros' }: { onClose: () => void, initialTab?: 'roteiros' | 'gallery' | 'frota' }) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'roteiros' | 'gallery' | 'frota'>(initialTab);
  const [roteiros, setRoteiros] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [frota, setFrota] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [editingRoteiro, setEditingRoteiro] = useState<any>(null);
  const [editingFrota, setEditingFrota] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'roteiro' | 'gallery' | 'frota', id: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubRoteiros = onSnapshot(collection(db, 'roteiros'), (snapshot) => {
        setRoteiros(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error("Erro ao carregar roteiros no admin", error);
      });
      const unsubGallery = onSnapshot(collection(db, 'gallery'), (snapshot) => {
        setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error("Erro ao carregar galeria no admin", error);
      });
      const unsubFrota = onSnapshot(collection(db, 'frota'), (snapshot) => {
        setFrota(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error("Erro ao carregar frota no admin", error);
      });
      return () => {
        unsubRoteiros();
        unsubGallery();
        unsubFrota();
      };
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        if (email === 'fabio.fernandes@city.com' && password === '745896321') {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
          } catch (createError: any) {
            setLoginError('Erro ao criar usuário admin: ' + createError.message);
          }
        } else {
          setLoginError('Credenciais inválidas.');
        }
      } else {
        setLoginError('Erro ao fazer login: ' + error.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveRoteiro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRoteiro.id) {
        const docRef = doc(db, 'roteiros', editingRoteiro.id);
        const { id, ...data } = editingRoteiro;
        await updateDoc(docRef, data);
      } else {
        await addDoc(collection(db, 'roteiros'), editingRoteiro);
      }
      setEditingRoteiro(null);
    } catch (error) {
      console.error("Erro ao salvar roteiro", error);
    }
    setLoading(false);
  };

  const handleSaveFrota = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingFrota.id) {
        const docRef = doc(db, 'frota', editingFrota.id);
        const { id, ...data } = editingFrota;
        await updateDoc(docRef, data);
      } else {
        await addDoc(collection(db, 'frota'), editingFrota);
      }
      setEditingFrota(null);
    } catch (error) {
      console.error("Erro ao salvar frota", error);
    }
    setLoading(false);
  };

  const confirmDeleteRoteiro = (id: string) => {
    setItemToDelete({ type: 'roteiro', id });
  };

  const confirmDeleteFrota = (id: string) => {
    setItemToDelete({ type: 'frota', id });
  };

  const confirmDeletePhoto = (id: string) => {
    setItemToDelete({ type: 'gallery', id });
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      if (itemToDelete.type === 'roteiro') {
        await deleteDoc(doc(db, 'roteiros', itemToDelete.id));
      } else if (itemToDelete.type === 'frota') {
        await deleteDoc(doc(db, 'frota', itemToDelete.id));
      } else {
        await deleteDoc(doc(db, 'gallery', itemToDelete.id));
      }
    } catch (error) {
      console.error("Erro ao excluir", error);
    }
    setLoading(false);
    setItemToDelete(null);
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    
    try {
      const compressedFile = await compressImage(file);
      const storageRef = ref(storage, `gallery/${Date.now()}_${compressedFile.name}`);
      await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);
      
      await addDoc(collection(db, 'gallery'), { 
        url, 
        createdAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error("Erro ao adicionar foto", error);
    }
    
    setLoading(false);
    e.target.value = ''; // reset input
  };

  const handleAddRoteiroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    setLoading(true);
    
    const newImages = [...(editingRoteiro.images || [])];
    for (const file of files) {
      try {
        const compressedFile = await compressImage(file);
        const storageRef = ref(storage, `roteiros/${Date.now()}_${compressedFile.name}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        newImages.push(url);
      } catch (error) {
        console.error("Erro ao fazer upload da imagem do roteiro", error);
      }
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

  const handleAddFrotaImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    
    try {
      const compressedFile = await compressImage(file);
      const storageRef = ref(storage, `frota/${Date.now()}_${compressedFile.name}`);
      await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);
      setEditingFrota({ ...editingFrota, image: url });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem da frota", error);
    }
    
    setLoading(false);
    e.target.value = '';
  };

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-3xl p-8 w-full max-w-md relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X /></button>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Settings className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold text-stone-900">Acesso Restrito</h2>
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
      className="fixed inset-0 z-[100] bg-stone-100 flex"
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h1 className="text-xl font-display font-black text-stone-900 tracking-tight">Admin</h1>
          <button onClick={onClose} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-600 transition-colors" title="Fechar Painel">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('roteiros')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-bold transition-all ${
              activeTab === 'roteiros' 
                ? 'bg-orange-50 text-orange-600' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Roteiros
          </button>
          <button 
            onClick={() => setActiveTab('frota')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-bold transition-all ${
              activeTab === 'frota' 
                ? 'bg-orange-50 text-orange-600' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <MapPin className="w-5 h-5" />
            Frota
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-bold transition-all ${
              activeTab === 'gallery' 
                ? 'bg-orange-50 text-orange-600' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <ImageLucide className="w-5 h-5" />
            Galeria de Fotos
          </button>
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-display font-bold text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-stone-50/50 p-8">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'roteiros' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-stone-900">Gerenciar Roteiros</h2>
                <button 
                  onClick={() => setEditingRoteiro({ title: '', subtitle: '', price: '', priceCash: '', priceInstallment: '', timeDeparture: '', timeReturn: '', images: [], places: [], courtesy: [], history: '', gastronomy: '', curiosities: '' })}
                  className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-stone-800"
                >
                  <Plus className="w-4 h-4" /> Novo Roteiro
                </button>
              </div>

              {editingRoteiro ? (
                <form onSubmit={handleSaveRoteiro} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-display font-bold text-stone-900">
                      {editingRoteiro.id ? 'Editar Roteiro' : 'Novo Roteiro'}
                    </h3>
                  </div>
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
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Preço Base (por pessoa)</label>
                      <input type="text" value={editingRoteiro.price} onChange={e => setEditingRoteiro({...editingRoteiro, price: e.target.value})} className="w-full border rounded-lg px-3 py-2" required placeholder="Ex: 150,00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Preço à Vista (por pessoa)</label>
                      <input type="text" value={editingRoteiro.priceCash || ''} onChange={e => setEditingRoteiro({...editingRoteiro, priceCash: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Ex: 135,00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Preço Parcelado (por pessoa)</label>
                      <input type="text" value={editingRoteiro.priceInstallment || ''} onChange={e => setEditingRoteiro({...editingRoteiro, priceInstallment: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Ex: 3x de 55,00" />
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
                <div className="flex flex-col gap-4">
                  {roteiros.map(roteiro => (
                    <div key={roteiro.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
                      <div className="w-32 h-24 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                        {roteiro.images?.[0] ? (
                          <img src={roteiro.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon className="w-8 h-8" /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-stone-900 text-lg">{roteiro.title}</h3>
                        <p className="text-sm text-stone-500 line-clamp-1">{roteiro.subtitle}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">R$ {roteiro.price}</span>
                          {roteiro.timeDeparture && <span className="text-xs text-stone-500">Saída: {roteiro.timeDeparture}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setEditingRoteiro(roteiro)} className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors">Editar</button>
                        <button onClick={() => confirmDeleteRoteiro(roteiro.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'frota' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-stone-900">Gerenciar Frota</h2>
                <button 
                  onClick={() => setEditingFrota({ title: '', description: '', image: '', features: [] })}
                  className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-stone-800"
                >
                  <Plus className="w-4 h-4" /> Novo Veículo
                </button>
              </div>

              {editingFrota ? (
                <form onSubmit={handleSaveFrota} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-display font-bold text-stone-900">
                      {editingFrota.id ? 'Editar Veículo' : 'Novo Veículo'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Título</label>
                      <input type="text" value={editingFrota.title} onChange={e => setEditingFrota({...editingFrota, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" required placeholder="Ex: Vans Executivas" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Descrição</label>
                      <textarea value={editingFrota.description} onChange={e => setEditingFrota({...editingFrota, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={3} required placeholder="Ex: Ideais para grupos e famílias..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Características (separadas por vírgula)</label>
                      <input type="text" value={editingFrota.features?.join(', ')} onChange={e => setEditingFrota({...editingFrota, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Ar-condicionado, Wi-Fi a bordo" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Imagem do Veículo</label>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {editingFrota.image && (
                        <div className="relative aspect-video bg-stone-100 rounded-lg overflow-hidden group">
                          <img src={editingFrota.image} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setEditingFrota({...editingFrota, image: ''})}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {!editingFrota.image && (
                        <label className="aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 cursor-pointer transition-colors">
                          <Upload className="w-6 h-6 mb-2" />
                          <span className="text-xs font-medium">Adicionar Imagem</span>
                          <input type="file" accept="image/*" onChange={handleAddFrotaImage} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button type="button" onClick={() => setEditingFrota(null)} className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2">
                      <Save className="w-4 h-4" /> Salvar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  {frota.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
                      <div className="w-32 h-24 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon className="w-8 h-8" /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-stone-900 text-lg">{item.title}</h3>
                        <p className="text-sm text-stone-500 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setEditingFrota(item)} className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors">Editar</button>
                        <button onClick={() => confirmDeleteFrota(item.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                  {frota.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 border-dashed">
                      <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500 font-medium">Nenhum veículo cadastrado na frota.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-stone-900">Galeria de Fotos</h2>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-stone-900 mb-2">Adicionar Nova Foto</h3>
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
                      <button onClick={() => confirmDeletePhoto(item.id)} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-transform hover:scale-110">
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-xl font-display font-bold text-stone-900 mb-2">Confirmar Exclusão</h3>
              <p className="text-stone-500 mb-6">
                Tem certeza que deseja excluir {itemToDelete.type === 'roteiro' ? 'este roteiro' : 'esta foto'}? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? 'Excluindo...' : 'Sim, excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
