import { useEffect, useState, type FormEvent } from 'react';
import {
  getAnnouncements, createAnnouncement, updateAnnouncement,
  publishAnnouncement, unpublishAnnouncement, archiveAnnouncement,
} from '../api/announcements';
import { getCategories } from '../api/categories';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import type { AnnouncementResponse, CategoryResponse } from '../types';
import {
  Badge, StatusBadge, Modal, EmptyState, inputCls, labelCls, btnPrimaryCls, btnGhostCls, cardCls,
  MegaphoneIcon, ClockIcon, PlusIcon, PencilIcon, ArchiveIcon, EyeIcon, EyeOffIcon, SearchIcon,
} from '../components/ui';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const emptyForm = { title: '', content: '', categoryId: '' };

export default function Announcements() {
  const { isAdmin, user } = useAuth();
  const [items, setItems] = useState<AnnouncementResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AnnouncementResponse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const load = () => {
    getAnnouncements(showInactive, {
      search: debouncedSearch || undefined,
      status: isAdmin && !showInactive ? 'Published' : undefined,
    }).then((r) => setItems(r.data));
    getCategories().then((r) => setCategories(r.data));
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { load(); }, [showInactive, debouncedSearch]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: AnnouncementResponse) => {
    setEditing(item);
    setForm({ title: item.title, content: item.content || '', categoryId: item.categoryId });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateAnnouncement(editing.id, { id: editing.id, title: form.title, content: form.content, categoryId: form.categoryId });
        toast.success('Duyuru güncellendi.');
      } else {
        await createAnnouncement(form);
        toast.success(isAdmin ? 'Duyuru oluşturuldu.' : 'Duyuru taslak olarak oluşturuldu. Yayınlanması için admin onayı gerekiyor.');
      }
      setShowForm(false);
      load();
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Bu duyuruyu arşivlemek istediğinize emin misiniz?')) return;
    await archiveAnnouncement(id);
    toast.success('Duyuru arşivlendi.');
    load();
  };

  // Admin her duyuruyu, kullanıcı sadece kendi duyurusunu düzenleyebilir (backend kuralıyla aynı)
  const canEdit = (item: AnnouncementResponse) =>
    isAdmin || (!!user?.id && item.createdByUserId === user.id);

  const togglePublish = async (item: AnnouncementResponse) => {
    if (item.status === 'Published') {
      await unpublishAnnouncement(item.id);
      toast.info('Duyuru yayından kaldırıldı.');
    } else {
      await publishAnnouncement(item.id);
      toast.success('Duyuru yayınlandı.');
    }
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Duyurular</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Tüm duyuruları yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Duyuru ara..."
              className={`${inputCls} pl-9 w-56`}
            />
          </div>
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 accent-indigo-600"
              />
              Pasifleri göster
            </label>
          )}
          <button onClick={openCreate} className={btnPrimaryCls}>
            <PlusIcon className="w-4 h-4" /> Yeni Duyuru
          </button>
        </div>
      </div>

      {showForm && (
        <Modal title={editing ? 'Duyuru Düzenle' : 'Yeni Duyuru'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Başlık</label>
              <input
                required
                minLength={5}
                maxLength={100}
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={inputCls}
                placeholder="Duyuru başlığı"
              />
            </div>

            <div>
              <label className={labelCls}>İçerik</label>
              <textarea
                maxLength={500}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Duyuru içeriği..."
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">{form.content.length}/500</p>
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

      {items.length === 0 ? (
        <EmptyState
          icon={debouncedSearch ? <SearchIcon className="w-6 h-6" /> : <MegaphoneIcon className="w-6 h-6" />}
          message={debouncedSearch ? `"${debouncedSearch}" için sonuç bulunamadı` : 'Henüz duyuru yok'}
          actionLabel={!debouncedSearch ? 'İlk duyuruyu oluşturun' : undefined}
          onAction={!debouncedSearch ? openCreate : undefined}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`${cardCls} p-5 transition-all hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-black/30 ${
                item.status === 'Published' ? '' : 'opacity-70'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <MegaphoneIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <StatusBadge status={item.status} />
                    <Badge tone="indigo">{item.categoryName}</Badge>
                  </div>
                  {item.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.content}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.createdByName}</span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span className="inline-flex items-center gap-1"><ClockIcon className="w-3 h-3" />{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              {(canEdit(item) || isAdmin) && (
              <div className="flex items-center gap-1 pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                {canEdit(item) && (
                  <button
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5" /> Düzenle
                  </button>
                )}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => togglePublish(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                    >
                      {item.status === 'Published' ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                      {item.status === 'Published' ? 'Yayından Kaldır' : 'Yayınla'}
                    </button>
                    <button
                      onClick={() => handleArchive(item.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-auto"
                    >
                      <ArchiveIcon className="w-3.5 h-3.5" /> Arşivle
                    </button>
                  </>
                )}
              </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
