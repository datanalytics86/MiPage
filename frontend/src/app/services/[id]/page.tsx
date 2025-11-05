'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { servicesAPI } from '@/lib/api';
import { formatPrice, getCategoryLabel, formatDate } from '@/lib/utils';
import { MapPinIcon, StarIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const { data } = await servicesAPI.getById(params.id as string);
      setService(data);
    } catch (error: any) {
      console.error('Error al cargar servicio:', error);
      toast.error('Servicio no encontrado');
      router.push('/services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const photos = service.photos || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              MiPage
            </Link>
            <Link href="/services" className="text-gray-600 hover:text-gray-900">
              ← Volver a servicios
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery */}
          <div className="lg:col-span-2">
            {/* Main Photo */}
            <div className="relative aspect-[16/10] bg-gray-200 rounded-2xl overflow-hidden mb-4">
              {photos.length > 0 ? (
                <Image
                  src={photos[activePhoto]}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">📷</span>
                </div>
              )}

              {service.isPremium && (
                <div className="absolute top-4 left-4">
                  <Badge variant="warning" size="lg">⭐ Premium</Badge>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {photos.map((photo: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActivePhoto(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden ${
                      activePhoto === index ? 'ring-4 ring-primary-600' : ''
                    }`}
                  >
                    <Image src={photo} alt={`Foto ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-8 bg-white rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Descripción</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>

              {service.availability && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    Disponibilidad
                  </h3>
                  <p className="text-gray-700">
                    {service.availability.days?.join(', ')}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {service.availability.hours}
                  </p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="mt-8 bg-white rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">
                Reseñas ({service.totalReviews || 0})
              </h2>

              {service.reviews && service.reviews.length > 0 ? (
                <div className="space-y-6">
                  {service.reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.user.avatar ? (
                            <Image
                              src={review.user.avatar}
                              alt={review.user.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-xl">👤</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{review.user.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>

                      {review.response && (
                        <div className="mt-3 ml-12 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            Respuesta del publicador:
                          </p>
                          <p className="text-sm text-gray-700">{review.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aún no hay reseñas para este servicio
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <div className="mb-6">
                <Badge variant="info" className="mb-2">
                  {getCategoryLabel(service.category)}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatPrice(service.price)}
                  </span>
                  <span className="text-gray-600">/ {service.priceType}</span>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="font-semibold">{service.city}</p>
                    <p className="text-sm text-gray-600">{service.location}</p>
                    {service.region && (
                      <p className="text-sm text-gray-600">{service.region}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              {service.averageRating > 0 && (
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold">{service.averageRating.toFixed(1)}</span>
                    <span className="text-gray-600">({service.totalReviews} reseñas)</span>
                  </div>
                </div>
              )}

              {/* Provider */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-gray-600 mb-2">Publicado por</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {service.user.avatar ? (
                      <Image
                        src={service.user.avatar}
                        alt={service.user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      {service.user.name}
                      {service.user.isVerified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Miembro desde {formatDate(service.user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button variant="primary" size="lg" fullWidth>
                  Contactar
                </Button>
                <Button variant="outline" size="lg" fullWidth>
                  Compartir
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600">{service.views}</p>
                  <p className="text-sm text-gray-600">Visualizaciones</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {service._count?.favorites || 0}
                  </p>
                  <p className="text-sm text-gray-600">Favoritos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
