/**
 * Photo Gallery Component
 * Displays project photos categorized by milestone and work type
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhotoIcon, 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  EyeIcon,
  CalendarDaysIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface PhotoGalleryProps {
  projectId: string;
}

interface ProjectPhoto {
  id: string;
  url: string;
  caption: string;
  category: 'before' | 'progress' | 'completion' | 'materials' | 'quality';
  milestone?: string;
  uploaded_at: string;
  thumbnail_url?: string;
}

interface PhotoCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export default function PhotoGallery({ projectId }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [categories, setCategories] = useState<PhotoCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, [projectId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      
      // Mock photo data - in real implementation, this would fetch from your API
      const mockPhotos: ProjectPhoto[] = [
        {
          id: 'photo_1',
          url: '/api/placeholder/600/400?text=Before+Living+Room',
          caption: 'Living room before drywall installation',
          category: 'before',
          milestone: 'Project Planning',
          uploaded_at: '2025-01-15T09:00:00Z',
          thumbnail_url: '/api/placeholder/200/150?text=Before+Living+Room'
        },
        {
          id: 'photo_2',
          url: '/api/placeholder/600/400?text=Framing+Inspection',
          caption: 'Framing inspection and measurement',
          category: 'progress',
          milestone: 'Site Preparation',
          uploaded_at: '2025-01-16T14:30:00Z',
          thumbnail_url: '/api/placeholder/200/150?text=Framing+Inspection'
        },
        {
          id: 'photo_3',
          url: '/api/placeholder/600/400?text=Material+Delivery',
          caption: 'Drywall materials delivered and staged',
          category: 'materials',
          milestone: 'Material Delivery',
          uploaded_at: '2025-01-17T08:00:00Z',
          thumbnail_url: '/api/placeholder/200/150?text=Material+Delivery'
        },
        {
          id: 'photo_4',
          url: '/api/placeholder/600/400?text=Drywall+Installation+Progress',
          caption: 'Drywall installation in progress - living room',
          category: 'progress',
          milestone: 'Drywall Installation',
          uploaded_at: '2025-01-18T11:15:00Z',
          thumbnail_url: '/api/placeholder/200/150?text=Drywall+Installation+Progress'
        },
        {
          id: 'photo_5',
          url: '/api/placeholder/600/400?text=Corner+Detail+Work',
          caption: 'Detailed corner work and precision cuts',
          category: 'quality',
          milestone: 'Drywall Installation',
          uploaded_at: '2025-01-18T15:45:00Z',
          thumbnail_url: '/api/placeholder/200/150?text=Corner+Detail+Work'
        },
        {
          id: 'photo_6',
          url: '/api/placeholder/600/400?text=First+Room+Complete',
          caption: 'First room drywall installation complete',
          category: 'progress',
          milestone: 'Drywall Installation',
          uploaded_at: '2025-01-19T16:00:00Z',
          thumbnail_url: '/api/placeholder/200/150?text=First+Room+Complete'
        },
        {
          id: 'photo_7',
          url: '/api/placeholder/600/400?text=Taping+Process',
          caption: 'Joint taping and mudding process',
          category: 'progress',
          milestone: 'Taping & Mudding',
          uploaded_at: '2025-01-20T10:30:00Z',
          thumbnail_url: '/api/placeholder/200/150?text=Taping+Process'
        },
        {
          id: 'photo_8',
          url: '/api/placeholder/600/400?text=Quality+Check',
          caption: 'Quality inspection of taped joints',
          category: 'quality',
          milestone: 'Taping & Mudding',
          uploaded_at: '2025-01-20T14:20:00Z',
          thumbnail_url: '/api/placeholder/200/150?text=Quality+Check'
        }
      ];

      // Generate categories with counts
      const categoryData: PhotoCategory[] = [
        {
          id: 'all',
          name: 'All Photos',
          description: 'View all project photos',
          icon: '📸',
          count: mockPhotos.length
        },
        {
          id: 'before',
          name: 'Before',
          description: 'Pre-construction photos',
          icon: '🏗️',
          count: mockPhotos.filter(p => p.category === 'before').length
        },
        {
          id: 'progress',
          name: 'Progress',
          description: 'Work in progress photos',
          icon: '⚡',
          count: mockPhotos.filter(p => p.category === 'progress').length
        },
        {
          id: 'materials',
          name: 'Materials',
          description: 'Materials and staging',
          icon: '📦',
          count: mockPhotos.filter(p => p.category === 'materials').length
        },
        {
          id: 'quality',
          name: 'Quality',
          description: 'Quality control inspections',
          icon: '✅',
          count: mockPhotos.filter(p => p.category === 'quality').length
        },
        {
          id: 'completion',
          name: 'Completion',
          description: 'Final completion photos',
          icon: '🎉',
          count: mockPhotos.filter(p => p.category === 'completion').length
        }
      ];

      setPhotos(mockPhotos);
      setCategories(categoryData);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPhotos = () => {
    if (selectedCategory === 'all') {
      return photos;
    }
    return photos.filter(photo => photo.category === selectedCategory);
  };

  const openLightbox = (photo: ProjectPhoto) => {
    const filteredPhotos = getFilteredPhotos();
    const index = filteredPhotos.findIndex(p => p.id === photo.id);
    setSelectedPhoto(photo);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const filteredPhotos = getFilteredPhotos();
    let newIndex = lightboxIndex;
    
    if (direction === 'prev') {
      newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : filteredPhotos.length - 1;
    } else {
      newIndex = lightboxIndex < filteredPhotos.length - 1 ? lightboxIndex + 1 : 0;
    }
    
    setLightboxIndex(newIndex);
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPhotos = getFilteredPhotos();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Project Photos</h2>
            <p className="text-gray-600">Visual documentation of your project progress</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{photos.length}</p>
            <p className="text-sm text-gray-500">Total Photos</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Photo Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="text-sm font-medium">{category.name}</div>
              <div className="text-xs text-gray-500">{category.count} photos</div>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedCategory === 'all' ? 'All Photos' : categories.find(c => c.id === selectedCategory)?.name} 
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredPhotos.length} photos)
            </span>
          </h3>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No photos in this category</h3>
            <p className="mt-1 text-sm text-gray-500">
              Photos will appear here as work progresses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-w-4 aspect-h-3"
                onClick={() => openLightbox(photo)}
              >
                <img
                  src={photo.thumbnail_url || photo.url}
                  alt={photo.caption}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
                  <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {photo.milestone && (
                      <div className="flex items-center text-xs text-gray-300">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {photo.milestone}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-300">
                      <CalendarDaysIcon className="h-3 w-3 mr-1" />
                      {formatDate(photo.uploaded_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* Navigation buttons */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption}
              className="max-w-full max-h-full object-contain"
            />

            {/* Photo info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h3 className="text-white text-lg font-medium">{selectedPhoto.caption}</h3>
              <div className="flex items-center space-x-4 mt-2 text-gray-300">
                {selectedPhoto.milestone && (
                  <div className="flex items-center text-sm">
                    <TagIcon className="h-4 w-4 mr-1" />
                    {selectedPhoto.milestone}
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  {formatDate(selectedPhoto.uploaded_at)}
                </div>
                <div className="text-sm">
                  {lightboxIndex + 1} of {filteredPhotos.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}