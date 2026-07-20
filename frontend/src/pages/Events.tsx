import { useEffect, useState, type FormEvent } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent, publishEvent, unpublishEvent } from '../api/events';
import { getEventParticipants, joinEvent, leaveEvent } from '../api/participants';
import { getCategories } from '../api/categories';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import type { EventResponse, CategoryResponse, EventParticipantsResponse } from '../types';
import {
  Badge, StatusBadge, Modal, EmptyState, inputCls, labelCls, btnPrimaryCls, btnGhostCls, cardCls,
  CalendarIcon, MapPinIcon, ClockIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeOffIcon,
  UsersIcon, CheckIcon, SearchIcon,
} from '../components/ui';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateInput(d: string) {
  return new Date(d).toISOString().slice(0, 16);
}

const emptyForm = {
  name: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  categoryId: '',
};

export default function Events() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventResponse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rsvp, setRsvp] = useState<Record<string, EventParticipantsResponse>>({});
  const [rsvpReady, setRsvpReady] = useState(true); // backend endpoint'i yoksa RSVP UI gizlenir
  const [participantsOf, setParticipantsOf] = useState<EventResponse | null>(null);

  const loadParticipants = async (list: EventResponse[]) => {
    try {
      const results = await Promise.all(list.map((e) => getEventParticipants(e.id)));
      const map: Record<string, EventParticipantsResponse> = {};
      results.forEach((r) => { map[r.data.eventId] = r.data; });
      setRsvp(map);
      setRsvpReady(true);
    } catch {
      setRsvpReady(false);
    }
  };

  const load = () => {
    getEvents(showInactive, {
      search: debouncedSearch || undefined,
      // Admin "Pasifleri göster" kapalıyken sadece yayındakileri iste
      status: isAdmin && !showInactive ? 'Published' : undefined,
    }).then((r) => {
      setEvents(r.data);
      if (r.data.length > 0) loadParticipants(r.data);
    });
    getCategories().then((r) => setCategories(r.data));
  };

  // Arama kutusu: 350ms yazma molası sonrası istek at (debounce)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(); }, [showInactive, debouncedSearch]);

  const toggleJoin = async (event: EventResponse) => {
    const joined = rsvp[event.id]?.isJoined;
    const r = joined ? await leaveEvent(event.id) : await joinEvent(event.id);
    setRsvp((m) => ({ ...m, [event.id]: r.data }));
    if (joined) {
      toast.info('Katılımınız iptal edildi.');
    } else {
      toast.success('Etkinliğe katıldınız!');
    }
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (event: EventResponse) => {
    setEditing(event);
    setForm({
      name: event.name,
      description: event.description || '',
      location: event.location || '',
      startDate: formatDateInput(event.startDate),
      endDate: formatDateInput(event.endDate),
      categoryId: event.categoryId,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateEvent(editing.id, { id: editing.id, ...form });
        toast.success('Etkinlik güncellendi.');
      } else {
        await createEvent(form);
        toast.success('Etkinlik oluşturuldu.');
      }
      setShowForm(false);
      load();
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;
    await deleteEvent(id);
    toast.success('Etkinlik silindi.');
    load();
  };

  const togglePublish = async (event: EventResponse) => {
    if (event.status === 'Published') {
      await unpublishEvent(event.id);
      toast.info('Etkinlik yayından kaldırıldı.');
    } else {
      await publishEvent(event.id);
      toast.success('Etkinlik yayınlandı.');
    }
    load();
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Etkinlikler</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Tüm etkinlikleri yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Etkinlik ara..."
              className={`${inputCls} pl-9 w-56`}
            />
          </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 accent-indigo-600"
              />
              Pasifleri göster
            </label>
            <button onClick={openCreate} className={btnPrimaryCls}>
              <PlusIcon className="w-4 h-4" /> Yeni Etkinlik
            </button>
          </div>
        )}
        </div>
      </div>

      {showForm && (
        <Modal title={editing ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Ad</label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Etkinlik adı" />
            </div>

            <div>
              <label className={labelCls}>Açıklama</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Kısa bir açıklama..."
              />
            </div>

            <div>
              <label className={labelCls}>Konum</label>
              <input value={form.location} onChange={(e) => set('location', e.target.value)} className={inputCls} placeholder="Örn: Konferans Salonu A" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Başlangıç</label>
                <input type="datetime-local" required value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Bitiş</label>
                <input type="datetime-local" required value={form.endDate} onChange={(e) => set('endDate', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Kategori</label>
              <select required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputCls}>
                <option value="">Seçin...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className={btnGhostCls}>
                İptal
              </button>
              <button type="submit" disabled={loading} className={btnPrimaryCls}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {participantsOf && (
        <Modal title={`Katılımcılar — ${participantsOf.name}`} onClose={() => setParticipantsOf(null)}>
          {(rsvp[participantsOf.id]?.participants?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Henüz katılımcı yok</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {rsvp[participantsOf.id].participants.map((p) => (
                <div key={p.userId} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-white">{p.userName?.charAt(0).toUpperCase() || '?'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.firstName} {p.lastName}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(p.joinedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {events.length === 0 ? (
        <EmptyState
          icon={debouncedSearch ? <SearchIcon className="w-6 h-6" /> : <CalendarIcon className="w-6 h-6" />}
          message={debouncedSearch ? `"${debouncedSearch}" için sonuç bulunamadı` : 'Henüz etkinlik yok'}
          actionLabel={!debouncedSearch && isAdmin ? 'İlk etkinliği oluşturun' : undefined}
          onAction={!debouncedSearch && isAdmin ? openCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`${cardCls} group p-5 flex flex-col transition-all hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-black/30 hover:-translate-y-0.5 ${
                event.status === 'Published' ? '' : 'opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">{event.name}</h3>
                <StatusBadge status={event.status} />
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
              )}

              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4 mt-auto">
                {event.location && (
                  <p className="flex items-center gap-2"><MapPinIcon className="w-3.5 h-3.5 shrink-0" />{event.location}</p>
                )}
                <p className="flex items-center gap-2"><ClockIcon className="w-3.5 h-3.5 shrink-0" />{formatDate(event.startDate)} → {formatDate(event.endDate)}</p>
                {categoryName(event.categoryId) && (
                  <p><Badge tone="indigo">{categoryName(event.categoryId)}</Badge></p>
                )}
              </div>

              {rsvpReady && event.status === 'Published' && (
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 mb-0.5">
                  <button
                    onClick={() => isAdmin && setParticipantsOf(event)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1.5 rounded-lg transition-colors ${
                      isAdmin ? 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer' : 'cursor-default'
                    }`}
                    title={isAdmin ? 'Katılımcıları gör' : undefined}
                  >
                    <UsersIcon className="w-4 h-4" />
                    {rsvp[event.id]?.count ?? 0} katılımcı
                  </button>
                  <button
                    onClick={() => toggleJoin(event)}
                    className={
                      rsvp[event.id]?.isJoined
                        ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20 hover:bg-red-50 hover:text-red-600 hover:ring-red-600/20 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors'
                        : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/20'
                    }
                  >
                    {rsvp[event.id]?.isJoined ? (
                      <><CheckIcon className="w-3.5 h-3.5" /> Katılıyorsun</>
                    ) : (
                      'Katıl'
                    )}
                  </button>
                </div>
              )}

              {isAdmin && (
              <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => openEdit(event)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                >
                  <PencilIcon className="w-3.5 h-3.5" /> Düzenle
                </button>
                <button
                  onClick={() => togglePublish(event)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                >
                  {event.status === 'Published' ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                  {event.status === 'Published' ? 'Yayından Kaldır' : 'Yayınla'}
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-auto"
                >
                  <TrashIcon className="w-3.5 h-3.5" /> Sil
                </button>
              </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
