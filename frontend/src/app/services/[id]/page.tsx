'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { servicesAPI } from '@/lib/api';
import { formatPrice, getCategoryLabel, formatDate } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const categoryColors: Record<string, string> = {
  MODELAJE: 'from-secondary-500 to-secondary-600',
  FOTOGRAFIA: 'from-fire-500 to-fire-600',
  MASAJES_PROFESIONALES: 'from-emerald-500 to-emerald-600',
  EVENTOS: 'from-primary-500 to-primary-600',
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

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
      setIsFavorite(data.isFavorite || false);
    } catch (error: any) {
      console.error('Error al cargar servicio:', error);
      toast.error('Servicio no encontrado');
      router.push('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: service.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const nextPhoto = () => {
    const photos = service.photos || [service.coverPhoto];
    setActivePhoto((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    const photos = service.photos || [service.coverPhoto];
    setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050308] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-warm-400">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const photos = service.photos?.length > 0 ? service.photos : [service.coverPhoto].filter(Boolean);
  const categoryColor = categoryColors[service.category] || 'from-warm-500 to-warm-600';

  return (
    <div className="min-h-screen bg-[#050308]">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-warm-500 hover:text-warm-300 transition-colors">
              Inicio
            </Link>
            <span className="text-warm-600">/</span>
            <Link href="/services" className="text-warm-500 hover:text-warm-300 transition-colors">
              Servicios
            </Link>
            <span className="text-warm-600">/</span>
            <span className="text-warm-300 truncate max-w-[200px]">{service.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-dark-900 border border-white/10">
              {/* Main Photo */}
              <div
                className="relative aspect-[16/10] cursor-pointer group"
                onClick={() => setShowGallery(true)}
              >
                {photos.length > 0 ? (
                  <Image
                    src={photos[activePhoto]}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
                    <span className="text-6xl opacity-30">📷</span>
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 via-transparent to-transparent" />

                {/* Premium badge */}
                {service.isPremium && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold shadow-lg">
                      <StarSolidIcon className="h-4 w-4" />
                      Premium
                    </span>
                  </div>
                )}

                {/* Navigation arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-dark-950/80 text-white opacity-0 group-hover:opacity-100 hover:bg-dark-950 transition-all backdrop-blur-sm"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-dark-950/80 text-white opacity-0 group-hover:opacity-100 hover:bg-dark-950 transition-all backdrop-blur-sm"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Photo counter */}
                {photos.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-dark-950/80 text-white text-sm backdrop-blur-sm">
                    {activePhoto + 1} / {photos.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto">
                  {photos.map((photo: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActivePhoto(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                        activePhoto === index
                          ? 'ring-2 ring-fire-400 ring-offset-2 ring-offset-dark-900'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={photo} alt={`Foto ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Quick Info (Mobile) */}
            <div className="lg:hidden">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r ${categoryColor} text-white text-sm font-medium mb-3`}>
                {getCategoryLabel(service.category)}
              </span>
              <h1 className="text-2xl font-bold text-white mb-2">{service.title}</h1>
              <div className="flex items-center gap-4 text-warm-400">
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{service.city}</span>
                </div>
                {service.averageRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarSolidIcon className="h-4 w-4 text-amber-400" />
                    <span>{service.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Descripción</h2>
              <p className="text-warm-300 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>

              {service.availability && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <CalendarDaysIcon className="h-5 w-5 text-fire-400" />
                    Disponibilidad
                  </h3>
                  <p className="text-warm-300">
                    {service.availability.days?.join(', ')}
                  </p>
                  {service.availability.hours && (
                    <p className="text-warm-500 text-sm mt-1">
                      {service.availability.hours}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-fire-400" />
                  Reseñas
                  {service.totalReviews > 0 && (
                    <span className="text-warm-500 font-normal">({service.totalReviews})</span>
                  )}
                </h2>
                {service.averageRating > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">
                    <StarSolidIcon className="h-5 w-5 text-amber-400" />
                    <span className="text-xl font-bold text-white">{service.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {service.reviews && service.reviews.length > 0 ? (
                <div className="space-y-6">
                  {service.reviews.map((review: any) => (
                    <div key={review.id} className="pb-6 border-b border-white/5 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fire-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                          {review.user.avatar ? (
                            <Image
                              src={review.user.avatar}
                              alt={review.user.name}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-xl">👤</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-white">{review.user.name}</p>
                            <span className="text-sm text-warm-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <StarSolidIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-amber-400' : 'text-warm-700'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-warm-300">{review.comment}</p>

                          {review.response && (
                            <div className="mt-4 ml-4 p-4 rounded-xl bg-white/5 border-l-2 border-fire-500">
                              <p className="text-sm font-semibold text-warm-200 mb-1">
                                Respuesta del proveedor
                              </p>
                              <p className="text-sm text-warm-400">{review.response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-warm-500" />
                  </div>
                  <p className="text-warm-400">Aún no hay reseñas para este servicio</p>
                  <p className="text-warm-600 text-sm mt-1">Sé el primero en dejar una opinión</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Main Card */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                {/* Category & Title (Desktop) */}
                <div className="hidden lg:block mb-6">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r ${categoryColor} text-white text-sm font-medium mb-3`}>
                    {getCategoryLabel(service.category)}
                  </span>
                  <h1 className="text-2xl font-bold text-white">{service.title}</h1>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <p className="text-sm text-warm-500 mb-1">Precio</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(service.price)}
                    </span>
                    <span className="text-warm-400">/ {service.priceType}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-fire-500/10">
                      <MapPinIcon className="h-5 w-5 text-fire-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{service.city}</p>
                      {service.location && (
                        <p className="text-sm text-warm-400">{service.location}</p>
                      )}
                      {service.region && (
                        <p className="text-sm text-warm-500">{service.region}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {service.averageRating > 0 && (
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(service.averageRating)
                                ? 'text-amber-400'
                                : 'text-warm-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-white">
                        {service.averageRating.toFixed(1)}
                      </span>
                      <span className="text-warm-500">({service.totalReviews} reseñas)</span>
                    </div>
                  </div>
                )}

                {/* Provider */}
                {service.user && (
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <p className="text-sm text-warm-500 mb-3">Publicado por</p>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fire-500/20 to-secondary-500/20 flex items-center justify-center">
                        {service.user.avatar ? (
                          <Image
                            src={service.user.avatar}
                            alt={service.user.name}
                            width={56}
                            height={56}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white flex items-center gap-1.5">
                          {service.user.name}
                          {service.user.isVerified && (
                            <CheckBadgeIcon className="h-5 w-5 text-primary-400" />
                          )}
                        </p>
                        {service.user.createdAt && (
                          <p className="text-sm text-warm-500">
                            Miembro desde {formatDate(service.user.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-fire-500 to-fire-600 text-white font-semibold shadow-lg shadow-fire-500/25 hover:shadow-fire-500/40 transition-all hover:-translate-y-0.5">
                    Contactar ahora
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                        isFavorite
                          ? 'bg-lust-500/10 border-lust-500/50 text-lust-400'
                          : 'bg-white/5 border-white/10 text-warm-300 hover:border-white/20'
                      }`}
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="h-5 w-5" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">Favorito</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-warm-300 hover:border-white/20 transition-all"
                    >
                      <ShareIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Compartir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <EyeIcon className="h-4 w-4 text-fire-400" />
                      <span className="text-xl font-bold text-white">{service.views || 0}</span>
                    </div>
                    <p className="text-xs text-warm-500">Visualizaciones</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <HeartIcon className="h-4 w-4 text-lust-400" />
                      <span className="text-xl font-bold text-white">
                        {service._count?.favorites || 0}
                      </span>
                    </div>
                    <p className="text-xs text-warm-500">Favoritos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {showGallery && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-dark-950/95 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowGallery(false)}
        >
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-5xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[activePhoto]}
              alt={service.title}
              width={1200}
              height={800}
              className="object-contain max-h-[90vh] w-full"
            />

            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-dark-950/80 text-white text-sm">
              {activePhoto + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
