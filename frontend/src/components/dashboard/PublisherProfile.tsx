'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CameraIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar?: string;
  metadata?: {
    businessName?: string;
    address?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
}

export default function PublisherProfile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    metadata: {
      businessName: '',
      address: '',
      website: '',
      socialMedia: {
        instagram: '',
        facebook: '',
        twitter: '',
      },
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        metadata: {
          businessName: user.metadata?.businessName || '',
          address: user.metadata?.address || '',
          website: user.metadata?.website || '',
          socialMedia: {
            instagram: user.metadata?.socialMedia?.instagram || '',
            facebook: user.metadata?.socialMedia?.facebook || '',
            twitter: user.metadata?.socialMedia?.twitter || '',
          },
        },
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.updateProfile(formData);
      setUser(data.data);
      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        socialMedia: {
          ...prev.metadata?.socialMedia,
          [platform]: value,
        },
      },
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-warm-50 mb-2">Mi Perfil</h2>
        <p className="text-warm-400">
          Gestiona tu información personal y profesional
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="card-dark p-6">
          <h3 className="text-xl font-bold text-warm-50 mb-4">Foto de Perfil</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-dark-850 border-4 border-dark-700">
              {formData.avatar ? (
                <Image
                  src={formData.avatar}
                  alt={formData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-warm-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Input
                type="url"
                placeholder="URL de tu foto de perfil"
                value={formData.avatar || ''}
                onChange={(e) => handleChange('avatar', e.target.value)}
              />
              <p className="text-xs text-warm-500 mt-2">
                Ingresa la URL de tu foto de perfil (formato: https://...)
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card-dark p-6">
          <h3 className="text-xl font-bold text-warm-50 mb-4">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre completo"
              type="text"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              disabled
            />
            <div className="md:col-span-2">
              <Input
                label="Teléfono"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-warm-300 mb-2">
                Biografía
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti y tu experiencia..."
                rows={4}
                className="input-dark w-full resize-none"
              />
              <p className="text-xs text-warm-500 mt-2">
                Esta información aparecerá en tu perfil público
              </p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="card-dark p-6">
          <h3 className="text-xl font-bold text-warm-50 mb-4">Información del Negocio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del negocio"
              type="text"
              placeholder="Nombre de tu empresa o marca"
              value={formData.metadata?.businessName || ''}
              onChange={(e) => handleMetadataChange('businessName', e.target.value)}
            />
            <Input
              label="Sitio web"
              type="url"
              placeholder="https://tuempresa.cl"
              value={formData.metadata?.website || ''}
              onChange={(e) => handleMetadataChange('website', e.target.value)}
            />
            <div className="md:col-span-2">
              <Input
                label="Dirección"
                type="text"
                placeholder="Av. Principal 123, Santiago"
                value={formData.metadata?.address || ''}
                onChange={(e) => handleMetadataChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="card-dark p-6">
          <h3 className="text-xl font-bold text-warm-50 mb-4">Redes Sociales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-warm-300 mb-2">
                <span className="text-xl mr-2">📷</span>
                Instagram
              </label>
              <Input
                type="text"
                placeholder="@tuusuario"
                value={formData.metadata?.socialMedia?.instagram || ''}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-300 mb-2">
                <span className="text-xl mr-2">📘</span>
                Facebook
              </label>
              <Input
                type="text"
                placeholder="facebook.com/tuusuario"
                value={formData.metadata?.socialMedia?.facebook || ''}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-300 mb-2">
                <span className="text-xl mr-2">🐦</span>
                Twitter
              </label>
              <Input
                type="text"
                placeholder="@tuusuario"
                value={formData.metadata?.socialMedia?.twitter || ''}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="dark"
            size="lg"
            onClick={() => {
              if (user) {
                setFormData({
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  bio: user.bio || '',
                  avatar: user.avatar || '',
                  metadata: user.metadata || {},
                });
              }
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="fire" size="lg" isLoading={loading}>
            💾 Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
