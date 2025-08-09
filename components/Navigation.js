'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Domů', href: '/' },
    { name: 'Osevní plán', href: '/osevni-plan' },
  ];

  return (
    <nav className="bg-white h-16 shadow-sm flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center">
        <span className="text-xl font-bold flex items-center gap-2">
          <span role="img" aria-label="seedling">🌱</span>
          Moje Zahrada
        </span>
      </div>
      <div className="flex items-center gap-4">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default Navigation;
