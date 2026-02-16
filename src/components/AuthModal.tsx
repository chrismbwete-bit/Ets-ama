import { useState, useRef, useEffect } from 'react';
import { X, User, Phone, Lock, Eye, EyeOff, UserPlus, LogIn, KeyRound, Shield } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onClientLogin: (phone: string, password: string) => boolean;
  onClientRegister: (data: { firstName: string; lastName: string; phone: string; password: string }) => boolean;
  onAdminLogin: (username: string, password: string) => boolean;
  onRecoverPassword: (phone: string) => string | null;
  onGetAdminCredentials?: () => { username: string; password: string };
}

export function AuthModal({ onClose, onClientLogin, onClientRegister, onAdminLogin, onRecoverPassword, onGetAdminCredentials }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register' | 'recover' | 'admin'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [recoverPhone, setRecoverPhone] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Secret 5-click mechanism
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [revealedCredentials, setRevealedCredentials] = useState<{ username: string; password: string } | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputClass = "w-full pl-11 pr-4 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition";
  const inputClassFull = "w-full px-4 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition";

  // Auto-hide credentials after 10 seconds
  useEffect(() => {
    if (revealedCredentials) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setRevealedCredentials(null);
      }, 10000);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [revealedCredentials]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginPhone || !loginPassword) { setError('Veuillez remplir tous les champs'); return; }
    if (!onClientLogin(loginPhone, loginPassword)) setError('Numéro ou mot de passe incorrect');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regFirstName || !regLastName || !regPhone || !regPassword) { setError('Veuillez remplir tous les champs'); return; }
    if (regPassword !== regConfirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (regPassword.length < 4) { setError('Le mot de passe doit contenir au moins 4 caractères'); return; }
    if (!onClientRegister({ firstName: regFirstName, lastName: regLastName, phone: regPhone, password: regPassword }))
      setError('Ce numéro de téléphone est déjà enregistré');
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!recoverPhone) { setError('Veuillez entrer votre numéro de téléphone'); return; }
    const password = onRecoverPassword(recoverPhone);
    if (password) setSuccess(`Votre mot de passe est: ${password}`);
    else setError('Aucun compte trouvé avec ce numéro');
  };

  const handleAdminLoginClick = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Always count clicks
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);

    // Reset click counter after 4 seconds of inactivity
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setAdminClickCount(0);
    }, 4000);

    // At 5 clicks -> reveal credentials below in red
    if (newCount >= 5) {
      if (onGetAdminCredentials) {
        const creds = onGetAdminCredentials();
        setRevealedCredentials(creds);
        setAdminClickCount(0);
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      }
      return;
    }

    // If fields are filled, try normal login
    if (adminUsername && adminPassword) {
      if (onAdminLogin(adminUsername, adminPassword)) {
        setAdminClickCount(0);
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        return;
      }
      setError('Identifiants administrateur incorrects');
      return;
    }

    // Fields empty - generic error
    if (!adminUsername || !adminPassword) {
      setError('Veuillez remplir tous les champs');
    }
  };

  // The revealed credentials block (shown below S'inscrire in red)
  const CredentialsReveal = () => {
    if (!revealedCredentials) return null;
    return (
      <div className="mt-4 animate-fade-in">
        <div className="bg-red-950/60 border-2 border-red-500 rounded-xl p-4 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse-slow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-red-500/30 rounded-full flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-red-400 font-bold text-sm">🔓 Clé Administrateur</p>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2 border border-red-500/20">
              <span className="text-red-300 text-xs font-medium">👤 Utilisateur :</span>
              <span className="text-red-400 font-bold text-base font-mono tracking-wider">{revealedCredentials.username}</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2 border border-red-500/20">
              <span className="text-red-300 text-xs font-medium">🔑 Mot de passe :</span>
              <span className="text-red-400 font-bold text-base font-mono tracking-wider">{revealedCredentials.password}</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2 border border-red-500/20">
              <span className="text-red-300 text-xs font-medium">📱 Téléphone :</span>
              <span className="text-red-400 font-bold text-base font-mono tracking-wider">+243895180889</span>
            </div>
          </div>
          {/* Countdown bar */}
          <div className="mt-3 w-full h-1 bg-red-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
              style={{
                animation: 'shrinkBar 10s linear forwards',
              }}
            />
          </div>
          <p className="text-red-500/60 text-[10px] text-center mt-1">Disparaît dans 10 secondes...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a] border border-purple-500/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white text-glow-purple">
              {tab === 'login' && '🔐 Connexion Client'}
              {tab === 'register' && '📝 Inscription'}
              {tab === 'recover' && '🔑 Récupération'}
              {tab === 'admin' && '🛡️ Admin'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-purple-500/10 rounded-full transition">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#0d0d15] p-1 rounded-xl border border-purple-500/10">
            {([
              { id: 'login' as const, label: 'Connexion', icon: LogIn },
              { id: 'register' as const, label: 'Inscription', icon: UserPlus },
              { id: 'recover' as const, label: 'Récupérer', icon: KeyRound },
              { id: 'admin' as const, label: 'Admin', icon: Shield },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(''); setSuccess(''); setAdminClickCount(0); setRevealedCredentials(null); }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition ${tab === t.id ? 'btn-neon-purple text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <t.icon className="w-4 h-4 mx-auto mb-1" />
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm">
              ✅ {success}
            </div>
          )}

          {/* Login */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="+243 XXX XXX XXX" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Votre mot de passe" className="w-full pl-11 pr-11 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-3 btn-neon-purple text-white rounded-xl font-bold">✨ Se connecter</button>
              <p className="text-center text-sm text-gray-500">
                Mot de passe oublié ?{' '}
                <button type="button" onClick={() => { setTab('recover'); setError(''); }} className="text-cyan-400 font-medium hover:underline">Récupérer</button>
              </p>
            </form>
          )}

          {/* Register */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                    <input type="text" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} placeholder="Prénom" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">Nom</label>
                  <input type="text" value={regLastName} onChange={e => setRegLastName(e.target.value)} placeholder="Nom" className={inputClassFull} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+243 XXX XXX XXX" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min. 4 caractères" className="w-full pl-11 pr-11 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Confirmer</label>
                <input type="password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} placeholder="Confirmez" className={inputClassFull} />
              </div>
              <button type="submit" className="w-full py-3 btn-neon-cyan text-white rounded-xl font-bold">✨ S'inscrire</button>

              {/* Admin credentials appear HERE - below S'inscrire - in RED */}
              <CredentialsReveal />
            </form>
          )}

          {/* Recover */}
          {tab === 'recover' && (
            <form onSubmit={handleRecover} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <KeyRound className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-gray-400 text-sm">Entrez votre numéro pour récupérer votre mot de passe</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type="tel" value={recoverPhone} onChange={e => setRecoverPhone(e.target.value)} placeholder="+243 XXX XXX XXX" className={inputClass} />
                </div>
              </div>
              <button type="submit" className="w-full py-3 btn-neon-cyan text-white rounded-xl font-bold">🔑 Récupérer mon mot de passe</button>
            </form>
          )}

          {/* Admin */}
          {tab === 'admin' && (
            <form onSubmit={handleAdminLoginClick} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-gray-400 text-sm">Accès réservé à l'administrateur</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Nom d'utilisateur</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type="text" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} placeholder="Nom d'utilisateur" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/50" />
                  <input type={showPassword ? 'text' : 'password'} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Mot de passe admin" className="w-full pl-11 pr-11 py-3 bg-[#0d0d15] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-3 btn-neon-red text-white rounded-xl font-bold">
                🛡️ Se connecter
              </button>

              {/* Admin credentials appear HERE - below Se connecter - in RED */}
              <CredentialsReveal />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
