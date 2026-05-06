"use client";

import React from "react";
import { Row } from "@tanstack/react-table";
import { Grid } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { m, AnimatePresence, LazyMotion } from "framer-motion";
import { domAnimation } from "framer-motion/m";

interface DataTableCardsViewProps<TData> {
  rows: Row<TData>[];
  onRowClick: (word: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
}

export function DataTableCardsView<TData>({
  rows,
  onRowClick,
  getStatusIcon
}: DataTableCardsViewProps<TData>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-2">
          <Grid className="h-12 w-12 mx-auto opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No vocabulary found
        </h3>
        <p className="text-sm md:text-base text-muted-foreground">
          Try adjusting your filters or add new vocabulary
        </p>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {rows.map((row, index) => {
            const item = row.original as any;
            return (
              <m.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="h-full"
              >
                <Card
                  className="group h-full bg-card/50 backdrop-blur-sm border-white/5 shadow-md hover:shadow-glow transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => onRowClick(item.word)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl lg:text-2xl font-bold text-primary mb-2 break-words">
                          {item.word}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm md:text-base text-muted-foreground italic break-words">
                            {item.pronunciation}
                          </p>
                          {item.part_of_speech && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              {item.part_of_speech}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                {getStatusIcon(item.status)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {item.status?.replace("_", " ") || "Unknown"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm md:text-base text-foreground leading-relaxed">
                      {item.meaning}
                    </p>
                  </CardContent>
                </Card>
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
