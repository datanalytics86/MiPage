'use client';

import { useEffect, useState } from 'react';
import { postsAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MegaphoneIcon,
  NewspaperIcon,
  CalendarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ServiceUpdate {
  id: string;
  type: 'PROMOTION' | 'ANNOUNCEMENT' | 'NEWS' | 'SCHEDULE';
  content: string;
  isPinned?: boolean;
  createdAt: string;
}

export default function ServiceUpdates() {
  const [updates, setUpdates] = useState<ServiceUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ServiceUpdate | null>(null);
  const [formData, setFormData] = useState({
    type: 'ANNOUNCEMENT' as 'PROMOTION' | 'ANNOUNCEMENT' | 'NEWS' | 'SCHEDULE',
    content: '',
    isPinned: false,
  });

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const { data } = await postsAPI.getFeed();
      setUpdates(data.data || []);
    } catch (error) {
      console.error('Error al cargar actualizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error('El contenido no puede estar vacío');
      return;
    }

    try {
      await postsAPI.create({
        type: formData.type,
        content: formData.content,
        isPinned: formData.isPinned,
      });

      toast.success('Actualización creada exitosamente');
      setFormData({ type: 'ANNOUNCEMENT', content: '', isPinned: false });
      setShowForm(false);
      fetchUpdates();
    } catch (error) {
      console.error('Error al crear actualización:', error);
      toast.error('Error al crear actualización');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta actualización?')) return;

    try {
      await postsAPI.delete(id);
      toast.success('Actualización eliminada');
      fetchUpdates();
    } catch (error) {
      console.error('Error al eliminar actualización:', error);
      toast.error('Error al eliminar actualización');
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'PROMOTION':
        return <SparklesIcon className="h-5 w-5" />;
      case 'ANNOUNCEMENT':
        return <MegaphoneIcon className="h-5 w-5" />;
      case 'NEWS':
        return <NewspaperIcon className="h-5 w-5" />;
      case 'SCHEDULE':
        return <CalendarIcon className="h-5 w-5" />;
      default:
        return <NewspaperIcon className="h-5 w-5" />;
    }
  };

  const getUpdateBadge = (type: string) => {
    switch (type) {
      case 'PROMOTION':
        return <Badge variant="fire">🎉 Promoción</Badge>;
      case 'ANNOUNCEMENT':
        return <Badge variant="info">📢 Anuncio</Badge>;
      case 'NEWS':
        return <Badge variant="success">📰 Noticia</Badge>;
      case 'SCHEDULE':
        return <Badge variant="warning">📅 Horario</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'PROMOTION':
        return 'border-fire-500/30 bg-fire-500/5';
      case 'ANNOUNCEMENT':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'NEWS':
        return 'border-green-500/30 bg-green-500/5';
      case 'SCHEDULE':
        return 'border-yellow-500/30 bg-yellow-500/5';
      default:
        return 'border-dark-700 bg-dark-850';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-dark p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-dark-800 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-dark-800 rounded w-1/4" />
                <div className="h-4 bg-dark-800 rounded w-full" />
                <div className="h-4 bg-dark-800 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-warm-50 mb-2">Actualizaciones</h2>
          <p className="text-warm-400">
            Comparte novedades con tus clientes
          </p>
        </div>
        <Button
          variant="fire"
          size="lg"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {showForm ? 'Cancelar' : 'Nueva Actualización'}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card-dark p-6 mb-6 border-l-4 border-fire-500">
          <h3 className="text-xl font-bold text-warm-50 mb-4">
            Nueva Actualización
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div>
              <label className="block text-sm font-medium text-warm-300 mb-3">
                Tipo de actualización
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'PROMOTION' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === 'PROMOTION'
                      ? 'border-fire-500 bg-fire-500/10 shadow-fire'
                      : 'border-dark-700 bg-dark-850 hover:border-fire-500/50'
                  }`}
                >
                  <SparklesIcon className={`h-6 w-6 mx-auto mb-2 ${
                    formData.type === 'PROMOTION' ? 'text-fire-500' : 'text-warm-400'
                  }`} />
                  <div className={`text-sm font-medium ${
                    formData.type === 'PROMOTION' ? 'text-fire-400' : 'text-warm-300'
                  }`}>
                    Promoción
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'ANNOUNCEMENT' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === 'ANNOUNCEMENT'
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                      : 'border-dark-700 bg-dark-850 hover:border-blue-500/50'
                  }`}
                >
                  <MegaphoneIcon className={`h-6 w-6 mx-auto mb-2 ${
                    formData.type === 'ANNOUNCEMENT' ? 'text-blue-500' : 'text-warm-400'
                  }`} />
                  <div className={`text-sm font-medium ${
                    formData.type === 'ANNOUNCEMENT' ? 'text-blue-400' : 'text-warm-300'
                  }`}>
                    Anuncio
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'NEWS' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === 'NEWS'
                      ? 'border-green-500 bg-green-500/10 shadow-lg'
                      : 'border-dark-700 bg-dark-850 hover:border-green-500/50'
                  }`}
                >
                  <NewspaperIcon className={`h-6 w-6 mx-auto mb-2 ${
                    formData.type === 'NEWS' ? 'text-green-500' : 'text-warm-400'
                  }`} />
                  <div className={`text-sm font-medium ${
                    formData.type === 'NEWS' ? 'text-green-400' : 'text-warm-300'
                  }`}>
                    Noticia
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'SCHEDULE' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === 'SCHEDULE'
                      ? 'border-yellow-500 bg-yellow-500/10 shadow-lg'
                      : 'border-dark-700 bg-dark-850 hover:border-yellow-500/50'
                  }`}
                >
                  <CalendarIcon className={`h-6 w-6 mx-auto mb-2 ${
                    formData.type === 'SCHEDULE' ? 'text-yellow-500' : 'text-warm-400'
                  }`} />
                  <div className={`text-sm font-medium ${
                    formData.type === 'SCHEDULE' ? 'text-yellow-400' : 'text-warm-300'
                  }`}>
                    Horario
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-warm-300 mb-2">
                Contenido
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escribe tu actualización aquí..."
                rows={4}
                className="input-dark w-full resize-none"
              />
            </div>

            {/* Pin Option */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-5 h-5 rounded border-dark-700 bg-dark-850 text-fire-500 focus:ring-fire-500 focus:ring-offset-0"
              />
              <label htmlFor="isPinned" className="text-sm text-warm-300 flex items-center gap-2">
                <span className="text-lg">📌</span>
                Fijar actualización (aparecerá primero)
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="fire" size="lg">
                Publicar Actualización
              </Button>
              <Button
                type="button"
                variant="dark"
                size="lg"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ type: 'ANNOUNCEMENT', content: '', isPinned: false });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Updates Timeline */}
      {updates.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-2xl font-bold text-warm-50 mb-2">
            No hay actualizaciones
          </h3>
          <p className="text-warm-400 mb-6">
            Comparte novedades con tus clientes para mantenerlos informados
          </p>
          <Button variant="fire" onClick={() => setShowForm(true)}>
            Crear tu primera actualización
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div
              key={update.id}
              className={`card-dark border-l-4 hover:shadow-dark-lg transition-all duration-300 ${getUpdateColor(update.type)}`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-dark-850 flex items-center justify-center border border-dark-700">
                    {getUpdateIcon(update.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getUpdateBadge(update.type)}
                        {update.isPinned && (
                          <Badge variant="fire">
                            <span className="mr-1">📌</span>
                            Fijado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(update.id)}
                          className="p-2 text-warm-500 hover:text-lust-400 hover:bg-lust-500/10 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-warm-200 leading-relaxed mb-3 whitespace-pre-wrap">
                      {update.content}
                    </p>

                    <div className="text-sm text-warm-500">
                      🕐 {new Date(update.createdAt).toLocaleString('es-CL')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
