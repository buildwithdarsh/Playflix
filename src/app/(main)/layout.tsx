import MotionProvider from '@/components/MotionProvider';
import AppInitializer from '@/components/AppInitializer';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import ToastContainer from '@/components/ToastContainer';
import AuthDrawer from '@/components/AuthDrawer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <AppInitializer />
      <ToastContainer />
      <AuthDrawer />
      <TopBar />
      <main className="!max-w-[476px] lg:!max-w-full mx-auto pt-14 lg:pt-16 pb-[calc(var(--bottom-nav-height)+var(--safe-bottom))] lg:pb-0 min-h-dvh">
        {children}
      </main>
      <BottomNav />
    </MotionProvider>
  );
}
