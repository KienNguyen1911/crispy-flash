"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminAppSidebar } from "@/components/admin/AdminAppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const getBreadcrumb = () => {
      const parts = pathname.split('/').filter(Boolean);
      // Basic breadcrumb logic
      return parts.map((part, index) => {
        const href = `/${parts.slice(0, index + 1).join('/')}`;
        const isLast = index === parts.length - 1;
        return (
             <BreadcrumbItem key={part}>
                {index > 0 && <BreadcrumbSeparator />}
                {isLast ? (
                     <BreadcrumbPage className="capitalize">{part}</BreadcrumbPage>
                ) : (
                    <BreadcrumbLink href={href} className="capitalize">{part}</BreadcrumbLink>
                )}
             </BreadcrumbItem>
        );
      });
  };

  return (
    <AdminGuard>
      <SidebarProvider>
        <AdminAppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
             <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                 {pathname !== '/dashboard' && <BreadcrumbSeparator className="hidden md:block" />}
                 {pathname !== '/dashboard' && (
                    <BreadcrumbItem>
                     <BreadcrumbPage className="capitalize">{pathname.split('/').pop()}</BreadcrumbPage>
                    </BreadcrumbItem>
                 )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
             <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min mt-4">
                {children}
             </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  );
}
