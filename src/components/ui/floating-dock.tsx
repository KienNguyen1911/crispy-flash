"use client"
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export const FloatingDock = ({
  items,
  desktopClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string; isCurrentPage?: boolean }[];
  desktopClassName?: string;
}) => {
  return <FloatingDockDesktop items={items} className={desktopClassName} />;
};


const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string; isCurrentPage?: boolean }[];
  className?: string;
}) => {
  const [isMobile, setIsMobile] = useState(false);
  let mouseX = useMotionValue(Infinity);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div
      onMouseMove={!isMobile ? (e) => mouseX.set(e.pageX) : undefined}
      onMouseLeave={!isMobile ? () => mouseX.set(Infinity) : undefined}
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 mx-auto h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 flex dark:bg-neutral-900",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          isMobile={isMobile}
          title={item.title}
          icon={item.icon}
          href={item.href}
          isCurrentPage={item.isCurrentPage}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  isMobile,
  isCurrentPage = false,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  isMobile: boolean;
  isCurrentPage?: boolean;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  // Disable animations on mobile
  let widthTransform = useTransform(distance, [-150, 0, 150], isMobile ? [40, 40, 40] : [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], isMobile ? [40, 40, 40] : [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], isMobile ? [20, 20, 20] : [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    isMobile ? [20, 20, 20] : [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={!isMobile ? () => setHovered(true) : undefined}
      onMouseLeave={!isMobile ? () => setHovered(false) : undefined}
      className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
    >
      <AnimatePresence>
        {hovered && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.div>
    </motion.div>
  );

  // Don't wrap in Link if href is "#" (for interactive elements like buttons)
  // or if we're already on the current page (prevents unnecessary navigation)
  if (href === "#" || isCurrentPage) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}
