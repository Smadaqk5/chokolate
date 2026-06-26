"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

export default function GalleryPage() {
  const [images, setImages] = useState<{ id: string; image_path: string; title?: string }[]>([]);

  useEffect(() => {
    api.getGallery().then(setImages).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-bold mb-2">Gallery</h1>
      <p className="text-[var(--muted)] mb-12">A glimpse into our world of luxury gifting</p>
      {images.length === 0 ? (
        <p className="text-center text-[var(--muted)] py-20">Gallery images coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="card aspect-square relative overflow-hidden group">
              <Image src={mediaUrl(img.image_path)} alt={img.title || "Gallery image"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              {img.title && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3 text-sm">{img.title}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
