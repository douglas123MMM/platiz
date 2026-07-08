import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import type { TenantSuite, TenantService, TenantProfessional } from '../../types';
import toast from 'react-hot-toast';

interface PublicTenantData {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  is_active: boolean;
}

export default function PublicLanding() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<PublicTenantData | null>(null);
  const [services, setServices] = useState<TenantService[]>([]);
  const [professionals, setProfessionals] = useState<TenantProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    service_id: '',
    date: '',
    time: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    notes: '',
  });

  useEffect(() => {
    loadPublicData();
  }, [slug]);

  const loadPublicData = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [{ data: t }, { data: svcs }, { data: profs }] = await Promise.all([
        api.get(`/suite/public/${slug}`),
        api.get(`/suite/public/${slug}/services`),
        api.get(`/suite/public/${slug}/professionals`),
      ]);
      if (!t || !t.id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setTenant(t);
      setServices(Array.isArray(svcs) ? svcs : []);
      setProfessionals(Array.isArray(profs) ? profs : []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setBookingForm({ service_id: '', date: '', time: '', client_name: '', client_email: '', client_phone: '', notes: '' });
    setShowBooking(false);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.client_name.trim() || !bookingForm.date || !bookingForm.time) {
      toast.error('Completa nombre, fecha y hora');
      return;
    }
    setBookingSaving(true);
    try {
      await api.post(`/suite/public/${slug}/bookings`, bookingForm);
      toast.success('Cita agendada. Te contactaremos pronto.');
      resetBooking();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al agendar cita');
    } finally {
      setBookingSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !tenant) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-12 text-center max-w-md">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-lg text-white mb-2">Pagina no encontrada</h2>
          <p className="text-white/40 mb-4">No se encontro un negocio con el identificador "{slug}"</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-black font-semibold rounded-lg hover:opacity-90 transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const accentColor = tenant.secondary_color || '#DAA520';
  const bgColor = tenant.primary_color || '#0a0a0f';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgColor }}>
      <header
        className="p-6 border-b border-white/[0.04]"
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-10 rounded-lg object-contain" />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold text-lg"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${tenant.secondary_color || '#B8860B'})` }}
              >
                {tenant.name.charAt(0)}
              </div>
            )}
            <h1 className="text-xl font-bold" style={{ color: tenant.accent_color || '#FFFFFF' }}>
              {tenant.name}
            </h1>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className="px-5 py-2.5 font-semibold rounded-lg hover:opacity-90 transition text-sm text-black"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${tenant.secondary_color || '#B8860B'})` }}
          >
            Agendar Cita
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {services.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: accentColor }}>
                Servicios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services
                  .filter((s) => s.is_active)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 hover:border-[#E5C158]/20 transition"
                    >
                      <h3 className="text-white font-semibold">{s.name}</h3>
                      {s.description && (
                        <p className="text-white/40 text-sm mt-1">{s.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        {s.price != null && (
                          <span className="font-semibold" style={{ color: accentColor }}>
                            ${s.price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-white/30">{s.duration_minutes} min</span>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {professionals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: accentColor }}>
                Profesionales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {professionals
                  .filter((p) => p.is_active)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 flex items-center gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${tenant.secondary_color || '#B8860B'})` }}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{p.name}</h3>
                        {p.specialty && <p className="text-white/40 text-sm">{p.specialty}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {services.length === 0 && professionals.length === 0 && (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg text-white mb-2">Proximamente</h3>
              <p className="text-white/40">Este espacio esta configurando sus servicios y profesionales.</p>
            </div>
          )}
        </div>
      </main>

      {showBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowBooking(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0a0a0f] border border-white/[0.04] rounded-xl p-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: accentColor }}
            >
              Agendar Cita
            </h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <label className="block">
                <span className="text-white/70 text-sm">Servicio</span>
                <select
                  value={bookingForm.service_id}
                  onChange={(e) => setBookingForm({ ...bookingForm, service_id: e.target.value })}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                >
                  <option value="" className="bg-[#0a0a0f]">Seleccionar servicio</option>
                  {services
                    .filter((s) => s.is_active)
                    .map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0a0a0f]">
                        {s.name} {s.price != null ? `($${s.price})` : ''} - {s.duration_minutes}min
                      </option>
                    ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-white/70 text-sm">Fecha *</span>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-white/70 text-sm">Hora *</span>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#E5C158]/50 focus:outline-none"
                    required
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-white/70 text-sm">Nombre *</span>
                  <input
                    type="text"
                    value={bookingForm.client_name}
                    onChange={(e) => setBookingForm({ ...bookingForm, client_name: e.target.value })}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-white/70 text-sm">Email</span>
                  <input
                    type="email"
                    value={bookingForm.client_email}
                    onChange={(e) => setBookingForm({ ...bookingForm, client_email: e.target.value })}
                    className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-white/70 text-sm">Telefono</span>
                <input
                  type="text"
                  value={bookingForm.client_phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, client_phone: e.target.value })}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">Notas</span>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows={3}
                  className="w-full mt-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:border-[#E5C158]/50 focus:outline-none resize-none"
                />
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={bookingSaving}
                  className="flex-1 px-5 py-2.5 font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 transition text-sm text-black"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${tenant.secondary_color || '#B8860B'})` }}
                >
                  {bookingSaving ? 'Enviando...' : 'Confirmar Cita'}
                </button>
                <button
                  type="button"
                  onClick={resetBooking}
                  className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 hover:bg-white/[0.08] transition flex-1 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="p-6 border-t border-white/[0.04] text-center">
        <p className="text-white/20 text-xs">
          Impulsado por{' '}
          <a
            href="https://globalservicex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#E5C158] transition"
            style={{ color: accentColor }}
          >
            Global Dorado
          </a>
        </p>
      </footer>
    </div>
  );
}
