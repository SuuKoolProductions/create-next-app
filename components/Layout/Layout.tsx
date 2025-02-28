import React from 'react';
import CRTOverlay from './CRTOverlay';
import BackgroundVideo from './BackgroundVideo';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <canvas id="gridCanvas" />
      <CRTOverlay />
      <BackgroundVideo />
      
      <div className="main-content">
        <div className="container">
          <Navigation />
          <main className="content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout; 