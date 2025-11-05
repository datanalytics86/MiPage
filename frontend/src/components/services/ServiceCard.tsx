'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatPrice, getCategoryLabel, truncate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
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

const ServiceCard = ({ service, onFavoriteToggle }: ServiceCardProps) => {
  const [isFavorite, setIsFavorite] = useState(service.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);

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
      // Revertir si falla
      setIsFavorite(isFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/services/${service.id}`}>
      <Card
        variant="bordered"
        padding="none"
        hoverable
        className="overflow-hidden h-full"
      >
        {/* Imagen */}
        <div className="relative aspect-[4/3] bg-gray-200">
          {service.coverPhoto ? (
            <Image
              src={service.coverPhoto}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-gray-400 text-4xl">📷</span>
            </div>
          )}

          {/* Badges superiores */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {service.isPremium && (
              <Badge variant="warning" size="sm" className="shadow-md">
                ⭐ Premium
              </Badge>
            )}

            {/* Botón favorito */}
            <button
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className="ml-auto bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">
          {/* Categoría y Rating */}
          <div className="flex items-center justify-between">
            <Badge variant="info" size="sm">
              {getCategoryLabel(service.category)}
            </Badge>

            {service.averageRating && service.averageRating > 0 && (
              <div className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {service.averageRating.toFixed(1)}
                </span>
                {service.totalReviews !== undefined && (
                  <span className="text-xs text-gray-500">
                    ({service.totalReviews})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 min-h-[3.5rem]">
            {service.title}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {truncate(service.description, 100)}
          </p>

          {/* Ubicación */}
          <div className="flex items-center text-gray-500 text-sm">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{service.city}</span>
          </div>

          {/* Precio */}
          <div className="flex items-baseline justify-between pt-2 border-t border-gray-200">
            <div>
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(service.price)}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                /{service.priceType}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ServiceCard;
