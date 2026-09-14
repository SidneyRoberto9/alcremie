import { GalleryVertical, House, Image, OctagonAlert, Tag, Upload } from "lucide-react"

export const NAV_ITEMS = [
  { href: "/", title: "Home", icon: House, section: "browse" },
  { href: "/recent", title: "Recent", icon: GalleryVertical, section: "browse" },
  { href: "/gallery", title: "Gallery", icon: Image, section: "browse" },
  { href: "/nsfw", title: "NSFW", icon: OctagonAlert, section: "browse" },
  { href: "/upload", title: "Upload", icon: Upload, section: "library" },
  { href: "/tags", title: "Tags", icon: Tag, section: "library" },
] as const

export const RAIL_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/tags")
