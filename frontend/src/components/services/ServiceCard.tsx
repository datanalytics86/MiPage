'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatPrice, getCategoryLabel, truncate } from '@/lib/utils';
import { useState } from 'react';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    priceType: string;
    city: string;
    category: string;
    coverPhoto?: string;
    averageRating?: number;
    totalReviews?: number;
    isPremium?: boolean;
    isFavorite?: boolean;
  };
  onFavoriteToggle?: (serviceId: string) => void;
}

const categoryColors: Record<string, string> = {
  MODELAJE: 'from-secondary-500/80 to-secondary-600/80',
  FOTOGRAFIA: 'from-fire-500/80 to-fire-600/80',
  MASAJES_PROFESIONALES: 'from-emerald-500/80 to-emerald-600/80',
  EVENTOS: 'from-primary-500/80 to-primary-600/80',
};

const ServiceCard = ({ service, onFavoriteToggle }: ServiceCardProps) => {
  const [isFavorite, setIsFavorite] = useState(service.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    setIsFavorite(!isFavorite);

    try {
      if (onFavoriteToggle) {
        await onFavoriteToggle(service.id);
      }
    } catch (error) {
      setIsFavorite(isFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryColor = categoryColors[service.category] || 'from-warm-500/80 to-warm-600/80';

  return (
    <Link href={`/services/${service.id}`} className="block group">
      <article className="relative overflow-hidden rounded-2xl bg-dark-850 border border-white/10 transition-all duration-300 hover:border-fire-400/40 hover:shadow-xl hover:shadow-fire-500/10 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-dark-900">
          {service.coverPhoto && !imageError ? (
            <Image
              src={service.coverPhoto}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
              <span className="text-5xl opacity-30">📷</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent" />

          {/* Top Row - Premium Badge & Favorite */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {service.isPremium && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold shadow-lg">
                <StarIcon className="h-3.5 w-3.5 fill-current" />
                Premium
              </span>
            )}

            <button
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className={`ml-auto p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
                isFavorite
                  ? 'bg-lust-500/90 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Bottom Row - Price Tag */}
          <div className="absolute bottom-3 left-3">
            <div className="px-3 py-1.5 rounded-lg bg-dark-950/80 backdrop-blur-md border border-white/10">
              <span className="text-lg font-bold text-white">
                {formatPrice(service.price)}
              </span>
              <span className="text-sm text-warm-400 ml-1">
                /{service.priceType}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r ${categoryColor} text-white text-xs font-medium`}>
              {getCategoryLabel(service.category)}
            </span>

            {service.averageRating && service.averageRating > 0 && (
              <div className="flex items-center gap-1.5 text-warm-300">
                <StarIcon className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold">
                  {service.averageRating.toFixed(1)}
                </span>
                {service.totalReviews !== undefined && (
                  <span className="text-xs text-warm-500">
                    ({service.totalReviews})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3rem] group-hover:text-fire-300 transition-colors">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-warm-400 line-clamp-2">
            {truncate(service.description, 100)}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-warm-500 pt-2 border-t border-white/5">
            <MapPinIcon className="h-4 w-4" />
            <span className="text-sm">{service.city}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ServiceCard;
