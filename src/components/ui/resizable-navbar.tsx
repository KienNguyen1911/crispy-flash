"use client";

import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export const ResizableNavbar = ({
  className,
}: {
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const { user, login } = useAuth();
  
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Guide", link: "/guide" },
  ];

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <motion.div
      initial={{
        opacity: 1,
        y: -100,
      }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        duration: 0.2,
      }}
      className={cn(
        "flex max-w-fit md:min-w-[70vw] lg:min-w-[50vw] fixed top-4 inset-x-0 mx-auto border border-white/[0.2] rounded-full bg-background/70 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-4 py-2 items-center justify-between space-x-4",
        className
      )}
    >
      <div className="flex items-center gap-2 pl-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Rocket className="w-5 h-5 text-primary" />
        </div>
        <span className="font-headline font-bold text-lg hidden sm:block">Lingofy</span>
      </div>

      <div className="flex items-center gap-6">
        {navItems.map((navItem, idx: number) => (
          <Link
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative text-sm font-medium text-foreground hover:text-primary transition-colors"
            )}
          >
            <span>{navItem.name}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center">
        {user ? (
          <Button asChild size="sm" className="rounded-full px-6">
            <Link href="/">Open App</Link>
          </Button>
        ) : (
          <Button onClick={login} size="sm" className="rounded-full px-6">
            Sign In
          </Button>
        )}
      </div>
    </motion.div>
  );
};
