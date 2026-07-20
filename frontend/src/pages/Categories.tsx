import { useEffect, useState, type FormEvent } from 'react';
import { getCategories, createCategory, updateCategory, deactivateCategory, deleteCategory } from '../api/categories';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import type { CategoryResponse, CategoryType } from '../types';
import {
  Badge, Modal, EmptyState, inputCls, labelCls, btnPrimaryCls, btnGhostCls, cardCls,
  TagIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeOffIcon,
  type BadgeTone,
} from '../components/ui';

const categoryTypes: CategoryType[] = ['Undefined', 'Draft', 'Published', 'Unpublished', 'Archived'];

const typeLabels: Record<CategoryType, string> = {
  Undefined: 'Tanımsız',
  Draft: 'Taslak',
  Published: 'Yayında',
  Unpublished: 'Yayında Değil',
  Archived: 'Arşivlenmiş',
};

const typeTones: Record<CategoryType, BadgeTone> = {
  Undefined: 'gray',
  Draft: 'amber',
  Published: 'green',
  Unpublished: 'orange',
  Archived: 'red',
};

const emptyForm = { name: '', type: 'Undefined' as CategoryType };

export default function Categories() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<CategoryResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const load = () => {
    getCategories(showInactive).then((r) => setItems(r.data));
  };

  useEffect(() => { load(); }, [showInactive]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: CategoryResponse) => {
    setEditing(item);
    setForm({ name: item.name, type: item.type });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateCategory({ id: editing.id, name: form.name, type: form.type, isActive: editing.isActive });
        toast.success('Kategori güncellendi.');
      } else {
        await createCategory(form);
        toast.success('Kategori oluşturuldu.');
      }
      setShowForm(false);
      load();
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (item: CategoryResponse) => {
    if (item.isActive) {
      await deactivateCategory(item.id);
      toast.info('Kategori deaktif edildi.');
    } else {
      // Backend'de ayrı bir activate endpoint'i yok; PUT update IsActive'i kabul ediyor
      await updateCategory({ id: item.id, name: item.name, type: item.type, isActive: true });
      toast.success('Kategori aktif edildi.');
    }
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    await deleteCategory(id);
    toast.success('Kategori silindi.');
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategoriler</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Etkinlik ve duyuru kategorilerini yönetin</p>
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
              <PlusIcon className="w-4 h-4" /> Yeni Kategori
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? 'Kategori Düzenle' : 'Yeni Kategori'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Ad</label>
              <input
                required
                minLength={3}
                maxLength={20}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
                placeholder="Kategori adı"
              />
            </div>

            <div>
              <label className={labelCls}>Tür</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CategoryType }))}
                className={inputCls}
              >
                {categoryTypes.map((t) => (
                  <option key={t} value={t}>{typeLabels[t]}</option>
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
          icon={<TagIcon className="w-6 h-6" />}
          message="Henüz kategori yok"
          actionLabel="İlk kategoriyi oluşturun"
          onAction={openCreate}
        />
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ad</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tür</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                {isAdmin && (
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${!item.isActive ? 'opacity-50' : ''}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <TagIcon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={typeTones[item.type]}>{typeLabels[item.type]}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={item.isActive ? 'green' : 'gray'}>{item.isActive ? 'Aktif' : 'Pasif'}</Badge>
                  </td>
                  {isAdmin && (
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        title="Düzenle"
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(item)}
                        title={item.isActive ? 'Deaktif Et' : 'Aktif Et'}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        {item.isActive ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Sil"
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
