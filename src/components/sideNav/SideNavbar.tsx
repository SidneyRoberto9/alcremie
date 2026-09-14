"use client"

import { AlertOctagon, GalleryVertical, Home, Image, Menu, Upload, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { Fragment, useState } from "react"
import Drawer from "react-modern-drawer"

import { SideNavItem } from "@/components/sideNav/SideNavItem"

export function SideNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const toggleDrawer = () => setIsOpen((prevState) => !prevState)

  return (
    <Fragment>
      <button
        onClick={toggleDrawer}
        className="group peer fixed left-2 top-2 z-20 inline-flex items-center justify-center rounded-md px-2 py-1 text-lucide-300 hover:bg-lucide-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-lucide-300"
      >
        <Menu size={36} />
      </button>
      <Drawer open={isOpen} onClose={toggleDrawer} direction="left">
        <div className="relative h-full w-full bg-lucide-600">
          <X onClick={toggleDrawer} size={20} className="absolute right-2 top-2 cursor-pointer" />

          <div className="pt-14" />

          <div className="flex flex-col gap-2">
            <SideNavItem
              onClick={toggleDrawer}
              link="/"
              title="Home"
              icon={Home}
              isActive={pathname === "/"}
              closeDrawer={toggleDrawer}
            />

            <SideNavItem
              title="Recent"
              link="/recent"
              closeDrawer={toggleDrawer}
              icon={GalleryVertical}
              isActive={pathname === "/recent"}
            />

            <SideNavItem
              title="Gallery"
              link="/gallery"
              closeDrawer={toggleDrawer}
              icon={Image}
              isActive={pathname === "/gallery"}
            />

            <SideNavItem
              title="NSFW"
              link="/nsfw/validation"
              closeDrawer={toggleDrawer}
              icon={AlertOctagon}
              isActive={pathname === "/nsfw/validation" || pathname === "/nsfw"}
            />

            <SideNavItem
              title="Upload"
              link="/upload"
              closeDrawer={toggleDrawer}
              icon={Upload}
              isActive={pathname === "/upload"}
            />
            {/* 
             routes that did not enter
            <SideNavItem
              title="Tag"
              link="/tag"
              icon={<Tag size={24} />}
              closeDrawer={toggleDrawer}
              isActive={pathname == '/tag'}
            />
            <SideNavItem
              title="Docs"
              link="/docs"
              closeDrawer={toggleDrawer}
              isActive={pathname == '/docs'}
              icon={<BookMarked size={24} />}
            />
            <SideNavItem
              link="/contact"
              title="Contact Us"
              closeDrawer={toggleDrawer}
              icon={<PhoneCall size={24} />}
              isActive={pathname == '/contact'}
            />
            <SideNavItem
              title="Favorites"
              link="/favorites"
              closeDrawer={toggleDrawer}
              icon={<Heart size={24} />}
              isActive={pathname == '/favorites'}
            />
            <SideNavItem
              title="Tag Manager"
              link="/tag/manager"
              closeDrawer={toggleDrawer}
              icon={<AppWindow size={24} />}
              isActive={pathname == '/tag/manager'} 
            />*/}
          </div>
        </div>
      </Drawer>
    </Fragment>
  )
}
