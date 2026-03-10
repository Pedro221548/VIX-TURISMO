import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
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
  User as UserIcon,
  Upload,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Roteiro {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  priceCash?: string;
  priceInstallment?: string;
  time?: string;
  images: string[];
  places: string[];
  history: string;
  gastronomy: string;
  curiosities: string;
  courtesy?: string[];
  flyer?: string;
  timeDeparture?: string;
  timeReturn?: string;
}

interface ContactInfo {
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
}

interface QuickPost {
  id: string;
  image: string;
  description: string;
  comment: string;
  createdAt: number;
}

export default function AdminPanel({ onExit }: { onExit: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [quickPosts, setQuickPosts] = useState<QuickPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoteiro, setEditingRoteiro] = useState<Partial<Roteiro> | null>(null);
  const [editingQuickPost, setEditingQuickPost] = useState<Partial<QuickPost> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
      const q = query(collection(db, 'roteiros'));
      const querySnapshot = await getDocs(q);
      const roteirosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Roteiro[];

      // Sort numerically by subtitle (e.g., "Roteiro 1", "Roteiro 2")
      roteirosData.sort((a, b) => {
        const getNum = (s: string) => {
          const match = s.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getNum(a.subtitle) - getNum(b.subtitle);
      });

      setRoteiros(roteirosData);

      // Fetch Quick Posts
      const qp = query(collection(db, 'quick_posts'), orderBy('createdAt', 'desc'));
      const qpSnapshot = await getDocs(qp);
      const qpData = qpSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuickPost[];
      setQuickPosts(qpData);

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

  const handleFileUpload = async (file: File, path: string): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          }, 
          (error) => {
            console.error("Error uploading file:", error);
            alert("Erro ao fazer upload da imagem.");
            setUploading(false);
            reject(error);
          }, 
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            setUploadProgress(0);
            resolve(url);
          }
        );
      });
    } catch (error) {
      console.error("Error compressing file:", error);
      setUploading(false);
      throw error;
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

  const handleSaveQuickPost = async () => {
    if (!editingQuickPost?.image) return;

    try {
      if (editingQuickPost.id) {
        const { id, ...data } = editingQuickPost;
        await updateDoc(doc(db, 'quick_posts', id), data);
      } else {
        await addDoc(collection(db, 'quick_posts'), {
          ...editingQuickPost,
          createdAt: Date.now()
        });
      }
      setEditingQuickPost(null);
      fetchData();
    } catch (error) {
      console.error("Error saving quick post:", error);
    }
  };

  const handleDeleteQuickPost = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await deleteDoc(doc(db, 'quick_posts', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting quick post:", error);
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
      <div className="fixed inset-0 bg-stone-100 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-none md:rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-full md:h-auto md:max-h-[800px] flex flex-col md:flex-row overflow-hidden border border-stone-200"
        >
          {/* Image Side */}
          <div className="hidden md:block md:w-1/2 relative">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/03/Convento_da_Penha_e_Terceira_Ponte_com_Mar_e_Vit%C3%B3ria_ao_fundo.jpg" 
              alt="Convento da Penha" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
              <h3 className="text-3xl font-bold text-white mb-2">Convento da Penha</h3>
              <p className="text-white/80 text-sm">O maior símbolo da fé e da história capixaba.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white overflow-y-auto">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-orange-600 p-4 rounded-2xl mb-4 shadow-lg shadow-orange-600/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-stone-900">Acesso Restrito</h2>
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
          </div>
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
        {/* Roteiros Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-600" /> Gerenciar Roteiros
            </h2>
            <button 
              onClick={() => setEditingRoteiro({ title: '', subtitle: '', price: '', images: [], places: [], history: '', gastronomy: '', curiosities: '', courtesy: [], flyer: '', timeDeparture: '', timeReturn: '' })}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
            >
              <Plus className="w-5 h-5" /> Novo Roteiro
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roteiros.map(roteiro => (
              <div key={roteiro.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 group">
                <div className="h-48 relative bg-stone-100">
                  <img 
                    src={roteiro.images[0]} 
                    alt={roteiro.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
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
                  <div className="flex items-center gap-2 mb-3 text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {roteiro.timeDeparture && roteiro.timeReturn 
                        ? `Ida: ${roteiro.timeDeparture} | Volta: ${roteiro.timeReturn}`
                        : roteiro.time || 'Horário não definido'}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4">{roteiro.history}</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400">Geral:</span>
                      <span className="font-bold text-stone-900">R$ {roteiro.price}</span>
                    </div>
                    {roteiro.priceCash && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">À Vista:</span>
                        <span className="font-bold text-green-600 text-sm">R$ {roteiro.priceCash}</span>
                      </div>
                    )}
                    {roteiro.priceInstallment && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">Parcelado:</span>
                        <span className="font-bold text-orange-600 text-sm">R$ {roteiro.priceInstallment}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-end mt-2">
                      <span className="text-[10px] text-stone-400 uppercase font-bold">{roteiro.places.length} locais</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Posts Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-orange-600" /> Posts Rápidos
            </h2>
            <button 
              onClick={() => setEditingQuickPost({ image: '', description: '', comment: '' })}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
            >
              <Plus className="w-5 h-5" /> Novo Post
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickPosts.map(post => (
              <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 group">
                <div className="aspect-square relative bg-stone-100">
                  <img 
                    src={post.image} 
                    alt={post.description} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => setEditingQuickPost(post)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-orange-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteQuickPost(post.id)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-stone-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-bold text-stone-900 line-clamp-1">{post.description}</p>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 italic">"{post.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        </section>

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
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Preço Geral (R$)</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.price}
                        onChange={e => setEditingRoteiro({...editingRoteiro, price: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 450,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Horário de Ida</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.timeDeparture || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, timeDeparture: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 08:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Horário de Volta</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.timeReturn || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, timeReturn: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 16:00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Valor à Vista (R$)</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.priceCash || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, priceCash: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 400,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Valor Parcelado (R$)</label>
                      <input 
                        type="text" 
                        value={editingRoteiro.priceInstallment || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, priceInstallment: e.target.value})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 12x de 45,00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Imagens</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        {editingRoteiro.images?.map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200">
                            <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              onClick={() => setEditingRoteiro({...editingRoteiro, images: editingRoteiro.images?.filter((_, i) => i !== idx)})}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                          {uploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                              <Loader2 className="w-6 h-6 text-orange-600 animate-spin mb-1" />
                              <span className="text-[8px] font-bold text-orange-600">{Math.round(uploadProgress)}%</span>
                              <div className="absolute bottom-0 left-0 h-1 bg-orange-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-stone-400" />
                              <span className="text-[8px] font-bold text-stone-400 uppercase mt-1">Upload</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file, 'roteiros');
                                setEditingRoteiro({...editingRoteiro, images: [...(editingRoteiro.images || []), url]});
                              }
                            }}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      <textarea 
                        value={editingRoteiro.images?.join('\n')}
                        onChange={e => setEditingRoteiro({...editingRoteiro, images: e.target.value.split('\n').filter(l => l.trim())})}
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24 text-xs"
                        placeholder="Ou cole as URLs das imagens (uma por linha)"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Flyer (Imagem do Roteiro)</label>
                    <div className="flex gap-4">
                      <label className="flex-1 h-12 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-2 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                        {uploading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                            <Loader2 className="w-4 h-4 text-orange-600 animate-spin mb-1" />
                            <span className="text-[8px] font-bold text-orange-600">{Math.round(uploadProgress)}%</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-stone-400" />
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Upload Flyer</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'flyers');
                              setEditingRoteiro({...editingRoteiro, flyer: url});
                            }
                          }}
                          disabled={uploading}
                        />
                      </label>
                      <input 
                        type="text" 
                        value={editingRoteiro.flyer || ''}
                        onChange={e => setEditingRoteiro({...editingRoteiro, flyer: e.target.value})}
                        className="flex-[2] p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs"
                        placeholder="Ou cole a URL do flyer"
                      />
                    </div>
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
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Cortesias (Uma por linha)</label>
                    <textarea 
                      value={editingRoteiro.courtesy?.join('\n')}
                      onChange={e => setEditingRoteiro({...editingRoteiro, courtesy: e.target.value.split('\n').filter(l => l.trim())})}
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

      {/* Quick Post Edit Modal */}
      <AnimatePresence>
        {editingQuickPost && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 md:p-12 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingQuickPost(null)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900"
              >
                <X className="w-8 h-8" />
              </button>

              <h3 className="text-3xl font-bold text-stone-900 mb-8">
                {editingQuickPost.id ? 'Editar Post' : 'Novo Post Rápido'}
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Foto do Post</label>
                  <div className="flex flex-col gap-4">
                    {editingQuickPost.image && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
                        <img src={editingQuickPost.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => setEditingQuickPost({...editingQuickPost, image: ''})}
                          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <label className="flex-1 h-16 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center gap-3 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all relative overflow-hidden">
                        {uploading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                              <span className="text-xs font-bold text-orange-600">{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-24 h-1 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-stone-400" />
                            <span className="text-xs font-bold text-stone-400 uppercase">Fazer Upload</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'quick_posts');
                              setEditingQuickPost({...editingQuickPost, image: url});
                            }
                          }}
                          disabled={uploading}
                        />
                      </label>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={editingQuickPost.image}
                          onChange={e => setEditingQuickPost({...editingQuickPost, image: e.target.value})}
                          className="w-full h-16 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                          placeholder="Ou cole a URL da foto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Descrição</label>
                  <input 
                    type="text" 
                    value={editingQuickPost.description}
                    onChange={e => setEditingQuickPost({...editingQuickPost, description: e.target.value})}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Ex: Passeio de Escuna em Guarapari"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Comentário</label>
                  <textarea 
                    value={editingQuickPost.comment}
                    onChange={e => setEditingQuickPost({...editingQuickPost, comment: e.target.value})}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32"
                    placeholder="Ex: Um dia inesquecível com águas cristalinas!"
                  />
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingQuickPost(null)}
                  className="px-8 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveQuickPost}
                  className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                >
                  Salvar Post
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
