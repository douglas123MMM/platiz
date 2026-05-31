import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Registro exitoso. Espera la aprobación del administrador.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al registrarse');
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
            <p className="text-gray-400 mt-1">Crea tu cuenta y transforma el internet en dinero</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Usuario</label>
              <input type="text" className="input" placeholder="usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
          <p className="text-center text-gray-400 mt-6">
            ¿Ya tienes cuenta? <Link to="/login" className="text-[#FFD700] hover:text-[#FFE44D] font-medium">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
