import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, User } from 'lucide-react';

const Sidebar = () => {
  const { isSidebarOpen } = useSelector((state) => state.ui);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Habits', href: '/habits', icon: CheckSquare },
    { name: 'Circles / Groups', href: '/groups', icon: Users },
    { name: 'Account Profile', href: '/profile', icon: User },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 bg-slate-50/60 border-r border-slate-200 text-slate-500
        transition-all duration-150 ease-in-out hidden md:block backdrop-blur-md
        ${isSidebarOpen ? 'w-[260px]' : 'w-20'}
      `}
    >
      <div className="flex flex-col h-full justify-between py-5 px-3">
        {/* Navigation Links */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-semibold text-xs transition-all duration-150 group relative
                  ${isActive
                    ? 'bg-slate-200/50 text-slate-900 border-l-2 border-primary font-bold'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon
                  size={15}
                  className="transition-colors duration-150 flex-shrink-0"
                />
                <span
                  className={`transition-all duration-150 truncate font-sans
                    ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}
                  `}
                >
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed mode */}
                {!isSidebarOpen && (
                  <div className="absolute left-18 bg-slate-950 text-white text-[10px] font-bold py-1 px-2.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 shadow ml-2 z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Credit */}
        <div className="border-t border-slate-200 pt-4 px-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse flex-shrink-0" />
            <p
              className={`text-[9px] font-bold text-slate-400 tracking-wider truncate uppercase font-sans
                ${isSidebarOpen ? 'block' : 'hidden'}
              `}
            >
              Network active
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
