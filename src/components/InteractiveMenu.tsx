import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Home, PenTool, Book, Film, BookOpen, Music, Shield, Camera, Tv } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

type IconComponentType = React.ElementType<{ className?: string }>;
export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  to: string;
}

const menuItems: InteractiveMenuItem[] = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Anime', icon: Tv, to: '/anime' },
    { label: 'Journal', icon: BookOpen, to: '/journal' },
    { label: 'Vault', icon: Shield, to: '/vault' },
    { label: 'Gallery', icon: Camera, to: '/exhibition' },
    { label: 'Music', icon: Music, to: '/songs' },
];

export const InteractiveMenu: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeIndex = useMemo(() => {
    const index = menuItems.findIndex(item => 
      item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
    );
    return index === -1 ? 0 : index;
  }, [pathname]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();
    window.addEventListener('resize', setLineWidth);
    return () => window.removeEventListener('resize', setLineWidth);
  }, [activeIndex]);

  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const checkDialog = () => {
      const hasDialog = !!document.querySelector('[role="dialog"], [role="alertdialog"], [data-state="open"]');
      const isLocked = document.body.style.pointerEvents === 'none' || document.body.classList.contains('overflow-hidden');
      setIsHidden(hasDialog || isLocked);
    };

    const observer = new MutationObserver(checkDialog);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    
    // Check initially
    checkDialog();
    
    return () => observer.disconnect();
  }, []);

  if (isHidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="menu max-w-lg mx-auto flex items-center justify-between bg-card/90 backdrop-blur-xl border border-sand rounded-3xl p-1 shadow-2xl">
        {menuItems.map((item, index) => {
          const isActive = index === activeIndex;
          const IconComponent = item.icon;

          return (
            <button
              key={item.label}
              className={`menu__item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.to)}
              ref={(el) => (itemRefs.current[index] = el)}
            >
              <div className="menu__icon">
                <IconComponent className="icon" />
              </div>
              <strong
                className="menu__text"
                ref={(el) => (textRefs.current[index] = el)}
              >
                {item.label}
              </strong>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
