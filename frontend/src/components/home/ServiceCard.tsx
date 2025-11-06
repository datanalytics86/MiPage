'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { formatPrice, getCategoryLabel } from '@/lib/utils';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    category: string;
    price: number;
    priceType: string;
    city: string;
    coverPhoto: string;
    isPremium?: boolean;
    averageRating?: number;
    user?: {
      name: string;
      avatar?: string;
    };
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`} className="group block">
      <div className="card-dark overflow-hidden hover:shadow-fire-lg transition-all duration-300 hover:scale-[1.02]">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-dark-900">
          <Image
            src={service.coverPhoto}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Premium Badge */}
          {service.isPremium && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
              <span>⭐</span>
              <span>Premium</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="badge-modelaje text-xs px-3 py-1.5">
              {getCategoryLabel(service.category)}
            </span>
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-semibold text-warm-50 mb-2 line-clamp-2 group-hover:text-fire-400 transition-colors">
            {service.title}
          </h3>

          {/* Location & Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-warm-400 text-sm">
              <MapPinIcon className="h-4 w-4 mr-1 text-fire-500" />
              <span>{service.city}</span>
            </div>

            {service.averageRating && (
              <div className="flex items-center gap-1 text-sm">
                <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-warm-50 font-semibold">
                  {service.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Publisher */}
          {service.user && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-dark-700">
              {service.user.avatar && (
                <Image
                  src={service.user.avatar}
                  alt={service.user.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="text-sm text-warm-500">{service.user.name}</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-fire-500">
              {formatPrice(service.price)}
            </span>
            <span className="text-sm text-warm-500">
              / {service.priceType === 'hour' ? 'hora' : service.priceType === 'day' ? 'día' : 'sesión'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
