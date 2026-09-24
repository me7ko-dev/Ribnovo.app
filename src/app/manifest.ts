import type { MetadataRoute } from "next";

// Описание на приложението за инсталиране на началния екран
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Рибново",
    short_name: "Рибново",
    description: "Аларми, събития и новини от село Рибново",
    lang: "bg",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F3EFE6",
    theme_color: "#F3EFE6",
    categories: ["news", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Аларми", url: "/alarmi", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Събития", url: "/sabitiya", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Публикувай", url: "/publikuvay", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
