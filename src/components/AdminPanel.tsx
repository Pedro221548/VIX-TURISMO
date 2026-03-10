import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Image as ImageIcon, 
  MapPin, 
  DollarSign, 
  Clock,
  Phone,
  Instagram,
  Facebook,
  LogOut,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Roteiro {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  time?: string;
  images: string[];
  places: string[];
  history: string;
  gastronomy: string;
  curiosities: string;
}

interface ContactInfo {
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
}

export default function AdminPanel({ onExit }: { onExit: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoteiro, setEditingRoteiro] = useState<Partial<Roteiro> | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    email: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Roteiros
      const q = query(collection(db, 'roteiros'), orderBy('title'));
      const querySnapshot = await getDocs(q);
      const roteirosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Roteiro[];
      setRoteiros(roteirosData);

      // Fetch Contact Info
      const contactSnap = await getDocs(collection(db, 'settings'));
      if (!contactSnap.empty) {
        const data = contactSnap.docs[0].data() as ContactInfo;
        setContactInfo(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError('Email ou senha incorretos.');
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onExit();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSaveRoteiro = async () => {
    if (!editingRoteiro?.title) return;

    try {
      if (editingRoteiro.id) {
        const { id, ...data } = editingRoteiro;
        await updateDoc(doc(db, 'roteiros', id), data);
      } else {
        await addDoc(collection(db, 'roteiros'), editingRoteiro);
      }
      setEditingRoteiro(null);
      fetchData();
    } catch (error) {
      console.error("Error saving roteiro:", error);
    }
  };

  const handleDeleteRoteiro = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este roteiro?')) return;
    try {
      await deleteDoc(doc(db, 'roteiros', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting roteiro:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const settingsSnap = await getDocs(collection(db, 'settings'));
      if (settingsSnap.empty) {
        await addDoc(collection(db, 'settings'), contactInfo);
      } else {
        await updateDoc(doc(db, 'settings', settingsSnap.docs[0].id), contactInfo as any);
      }
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-stone-100 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-stone-200"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="bg-orange-600 p-4 rounded-2xl mb-4 shadow-lg shadow-orange-600/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Acesso Restrito</h2>
            <p className="text-stone-500 text-sm text-center mt-2">Identifique-se para acessar o painel administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="admin@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-red-500 text-sm font-medium text-center">{loginError}</p>
            )}

            <div className="flex flex-col gap-4 pt-2">
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
              >
                Entrar
              </button>
              <button 
                type="button"
                onClick={onExit}
                className="w-full text-stone-500 font-bold py-2 hover:text-stone-900 transition-colors"
              >
                Voltar ao Site
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-50 z-[100] overflow-y-auto pb-20">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-xl">
            <Edit className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">Painel Administrativo</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-12">
        {/* Settings Section */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <Phone className="w-6 h-6 text-orange-600" /> Contatos e Mídias
          </h2>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">WhatsApp</label>
              <input 
                type="text" 
                value={contactInfo.whatsapp}
                onChange={e => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="5527999999999"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Instagram (URL)</label>
              <input 
                type="text" 
                value={contactInfo.instagram}
                onChange={e => setContactInfo({...contactInfo, instagram: e.target.value})}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Facebook (URL)</label>
              <input 
                type="text" 
                value={contactInfo.facebook}
                onChange={e => setContactInfo({...contactInfo, facebook: e.target.value})}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</label>
              <input 
                type="email" 
                value={contactInfo.email}
                onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="contato@exemplo.com"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button 
                onClick={handleSaveSettings}
                className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" /> Salvar Configurações
              </button>
            </div>
          </div>
        </section>

        {/* Roteiros Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-600" /> Gerenciar Roteiros
            </h2>
            <button 
              onClick={() => setEditingRoteiro({ title: '', subtitle: '', price: '', images: [], places: [], history: '', gastronomy: '', curiosities: '' })}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
            >
              <Plus className="w-5 h-5" /> Novo Roteiro
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roteiros.map(roteiro => (
              <div key={roteiro.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 group">
                <div className="h-48 relative">
                  <img src={roteiro.images[0]} alt={roteiro.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => setEditingRoteiro(roteiro)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-orange-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteRoteiro(roteiro.id)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1 block">{roteiro.subtitle}</span>
                  <h3 className="font-bold text-stone-900 mb-2">{roteiro.title}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4">{roteiro.history}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">R$ {roteiro.price}</span>
                    <span className="text-xs text-stone-400">{roteiro.places.length} locais</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRoteiro && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingRoteiro(null)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900"
              >
                <X className="w-8 h-8" />
              </button>

              <h3 className="text-3xl font-bold text-stone-900 mb-8">
                {editingRoteiro.id ? 'Editar Roteiro' : 'Novo Roteiro'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Título do Roteiro</label>
                    <input 
                      type="text" 
                      value={editingRoteiro.title}
                      onChange={e => setEditingRoteiro({...editingRoteiro, title: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Subtítulo (Ex: Roteiro 1)</label>
                    <input 
                      type="text" 
                      value={editingRoteiro.subtitle}
                      onChange={e => setEditingRoteiro({...editingRoteiro, subtitle: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Preço (R$)</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.price}
                        onChange={e => setEditingRoteiro({...editingRoteiro, price: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Horário</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.time}
                        onChange={e => setEditingRoteiro({...editingRoteiro, time: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="08:00 às 16:00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Imagens (Uma URL por linha)</label>
                    <textarea 
                      value={editingRoteiro.images?.join('\n')}
                      onChange={e => setEditingRoteiro({...editingRoteiro, images: e.target.value.split('\n').filter(l => l.trim())})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Locais Visitados (Um por linha)</label>
                    <textarea 
                      value={editingRoteiro.places?.join('\n')}
                      onChange={e => setEditingRoteiro({...editingRoteiro, places: e.target.value.split('\n').filter(l => l.trim())})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">História</label>
                    <textarea 
                      value={editingRoteiro.history}
                      onChange={e => setEditingRoteiro({...editingRoteiro, history: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Gastronomia</label>
                    <textarea 
                      value={editingRoteiro.gastronomy}
                      onChange={e => setEditingRoteiro({...editingRoteiro, gastronomy: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Curiosidades</label>
                    <textarea 
                      value={editingRoteiro.curiosities}
                      onChange={e => setEditingRoteiro({...editingRoteiro, curiosities: e.target.value})}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingRoteiro(null)}
                  className="px-8 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveRoteiro}
                  className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                >
                  Salvar Roteiro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
