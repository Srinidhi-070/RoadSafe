
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16"> {/* Add padding to bottom to prevent content from being hidden behind the navigation */}
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
