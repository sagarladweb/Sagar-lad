export interface SpeakingGalleryImage {
  src: string;
  alt: string;
}

export interface SpeakingGalleryData {
  id: string;
  enabled: boolean;
  images: SpeakingGalleryImage[];
}

export const DEFAULT_SPEAKING_IMAGES: SpeakingGalleryImage[] = [
  { src: "/images/speaking/main-full-width.webp", alt: "Sagar Lad delivering a keynote" },
  { src: "/images/speaking/candid.webp", alt: "Sagar Lad candid" },
  { src: "/images/speaking/candid-speaking.webp", alt: "Sagar Lad speaking" },
  { src: "/images/speaking/candid-presentation.webp", alt: "Sagar Lad presenting" },
  { src: "/images/speaking/too-close.webp", alt: "Sagar Lad portrait" },
  { src: "/images/speaking/sagar-lad-tedx-talk-aim.webp", alt: "Sagar Lad at TEDx" },
];

export const DEFAULT_SPEAKING_GALLERY: SpeakingGalleryData = {
  id: "default",
  enabled: true,
  images: DEFAULT_SPEAKING_IMAGES,
};
