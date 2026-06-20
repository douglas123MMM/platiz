import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';
import { IconEye, IconEyeOff } from '../icons/PremiumIcons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenido a Global Dorado');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 bg-gold-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 via-transparent to-[#DAA520]/5 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#FFD700]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#DAA520]/10 rounded-full blur-3xl" />
        <div className="relative glass rounded-3xl p-8 border border-[#FFD700]/10">
          <div className="text-center mb-8">
            <Logo size={36} className="mx-auto mb-4" />
            <p className="text-gray-400 mt-1">Inicia sesión en tu cuenta</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" className="input" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="contraseña" className="label">Contraseña</label>
              <div className="relative">
                <input id="contraseña" type={showPassword ? 'text' : 'password'} className="input pr-12" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="text-center text-gray-400 mt-6">
            ¿No tienes cuenta? <Link to="/register" className="text-[#FFD700] hover:text-[#FFE44D] font-medium">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
