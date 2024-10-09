import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../../widgets/Navbar/Navbar';
import MobileNavbar from '../../widgets/Navbar/MobileNavbar';
import { TasteSuggest } from '@/features/tasteSuggest/ui/TasteSuggest';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import RightSideLayout from './RightSideLayout';
import Timer from '@/shared/components/Timer';
import { useTimerStore } from '@/shared/stores/timerStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 뷰포트의 스타일 지정
// Outlet에 페이지들이 렌더링
const Layout = () => {
  const isMobile = useIsMobile();
  const [isTasteSuggestOpen, setIsTasteSuggestOpen] = useState(false);
  const { isOpen: isTimerOpen } = useTimerStore();

  const toggleTasteSuggest = () => {
    setIsTasteSuggestOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {!isMobile && <Navbar />}
      <div className={`flex-1 ${isMobile ? 'mb-16' : 'mt-16'} flex`}>
        <main className="flex-grow">
          <Outlet />
        </main>
        <RightSideLayout />
      </div>
      {isMobile && (
        <>
          <MobileNavbar
            onToggleTasteSuggest={toggleTasteSuggest}
            isTasteSuggestOpen={isTasteSuggestOpen}
          />
          <TasteSuggest
            isOpen={isTasteSuggestOpen}
            onClose={() => setIsTasteSuggestOpen(false)}
          />
        </>
      )}
      {isTimerOpen && <Timer />}
      <ToastContainer />
    </div>
  );
};

export default Layout;
