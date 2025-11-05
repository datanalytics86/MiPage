'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { servicesAPI } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function NewServicePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [photoInput, setPhotoInput] = useState('');

  const [formData, setFormData] = useState({
    category: 'MODELAJE',
    title: '',
    description: '',
    price: '',
    priceType: 'hour',
    location: '',
    city: '',
    region: 'Metropolitana',
    photos: [] as string[],
  });

  // Verificar autenticación y rol
  useEffect(() => {
    if (!user) {
      toast.error('Debes iniciar sesión para publicar servicios');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'PUBLISHER' && user.role !== 'ADMIN') {
      toast.error('Solo los publicadores pueden crear servicios');
      router.push('/');
      return;
    }
  }, [user, router]);

  const handleAddPhoto = () => {
    if (!photoInput.trim()) {
      toast.error('Ingresa una URL válida');
      return;
    }

    // Validar URL básica
    try {
      new URL(photoInput);
      setFormData({
        ...formData,
        photos: [...formData.photos, photoInput.trim()],
      });
      setPhotoInput('');
      toast.success('Foto agregada');
    } catch {
      toast.error('URL inválida');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('La descripción es requerida');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }
    if (formData.photos.length === 0) {
      toast.error('Debes agregar al menos una foto');
      return;
    }

    setIsLoading(true);

    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        coverPhoto: formData.photos[0], // Primera foto como cover
      };

      await servicesAPI.create(serviceData);

      toast.success('Servicio creado exitosamente. Será revisado por un administrador.');
      router.push('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al crear servicio';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (user.role !== 'PUBLISHER' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Publicar Nuevo Servicio</h1>
              <p className="text-gray-600 mt-1">Completa la información de tu servicio</p>
            </div>
            <Link href="/">
              <Button variant="ghost">Cancelar</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'MODELAJE' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.category === 'MODELAJE'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">📸</div>
                <div className="font-semibold">Modelaje</div>
                <div className="text-xs text-gray-500">Sesiones fotográficas, eventos</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'MASAJES_PROFESIONALES' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.category === 'MASAJES_PROFESIONALES'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">💆</div>
                <div className="font-semibold">Masajes Profesionales</div>
                <div className="text-xs text-gray-500">Terapéuticos, relajación</div>
              </button>
            </div>
          </div>

          {/* Título */}
          <Input
            label="Título del Servicio *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: Sesión Fotográfica Profesional de Moda"
            fullWidth
            required
          />

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Describe tu servicio en detalle: qué incluye, tu experiencia, beneficios, etc."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Incluye detalles importantes que ayuden a los clientes a entender tu servicio
            </p>
          </div>

          {/* Precio */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Precio *"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="50000"
              fullWidth
              required
              helperText="En pesos chilenos (CLP)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Precio *
              </label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="hour">Por hora</option>
                <option value="session">Por sesión</option>
                <option value="day">Por día</option>
              </select>
            </div>
          </div>

          {/* Ubicación */}
          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="Ubicación *"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Santiago Centro"
              fullWidth
              required
            />

            <Input
              label="Ciudad *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Santiago"
              fullWidth
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Región *
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Metropolitana">Metropolitana</option>
                <option value="Valparaíso">Valparaíso</option>
                <option value="Biobío">Biobío</option>
                <option value="Araucanía">Araucanía</option>
                <option value="Los Lagos">Los Lagos</option>
              </select>
            </div>
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos * (mínimo 1)
            </label>
            <div className="space-y-4">
              {/* Input para agregar fotos */}
              <div className="flex gap-2">
                <Input
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  fullWidth
                  helperText="URL de la imagen (puedes usar Unsplash, Imgur, etc.)"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPhoto}
                  className="whitespace-nowrap"
                >
                  Agregar Foto
                </Button>
              </div>

              {/* Preview de fotos */}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                          Foto Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500">
                💡 Tip: La primera foto será la imagen principal. Usa fotos de alta calidad y profesionales.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Proceso de Aprobación</h3>
                <p className="text-sm text-blue-800">
                  Tu servicio será enviado a revisión. Un administrador lo aprobará antes de que sea visible
                  públicamente. Recibirás una notificación cuando sea aprobado.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t">
            <Link href="/">
              <Button type="button" variant="ghost" size="lg">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
              Publicar Servicio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
