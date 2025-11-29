"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
    const pathname = usePathname();
    // Only show on admin
    if (!pathname.startsWith('/admin')) return null;

    const paths = pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center space-x-2 text-sm text-neutral-500 mb-4 px-6 pt-4">
            <Link href="/" className="hover:text-neutral-900"><Home className="h-4 w-4" /></Link>
            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`;
                const isLast = index === paths.length - 1;
                // Capitalize
                const label = path.charAt(0).toUpperCase() + path.slice(1);

                return (
                    <div key={path} className="flex items-center">
                        <ChevronRight className="h-4 w-4 mx-1" />
                        {isLast ? (
                            <span className="font-medium text-neutral-900">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-neutral-900">{label}</Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
