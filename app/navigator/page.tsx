"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { CampusMap } from "@/components/map/CampusMap";
import { FloorMap } from "@/components/map/FloorMap";

import { Sidebar } from "@/components/navigation/Sidebar";
import { CommandPalette } from "@/components/navigation/CommandPalette";

import { Building } from "@/data/buildings";
import { NavigationRoute } from "@/types/navigation";

type NavigatorMode = "campus" | "indoor";

export default function NavigatorPage() {
  const [route, setRoute] =
    useState<NavigationRoute | null>(null);

  const [currentStep, setCurrentStep] =
    useState(0);

  const [isNavigating, setIsNavigating] =
    useState(false);

  const [selected, setSelected] =
    useState<Building | null>(null);

  const [mode, setMode] =
    useState<NavigatorMode>("campus");

  const [commandDestination, setCommandDestination] =
    useState("");

  // ─────────────────────────────────────────────
  // BUILDING
  // ─────────────────────────────────────────────

  const handleBuildingClick = useCallback(
    (b: Building) => {
      setSelected((prev) =>
        prev?.id === b.id ? null : b
      );
    },
    []
  );

  const handleCloseBuilding = useCallback(() => {
    setSelected(null);
  }, []);

  const handleNavigateTo = useCallback(
    (name: string) => {
      setSelected(null);
    },
    []
  );

  // ─────────────────────────────────────────────
  // ROUTE
  // ─────────────────────────────────────────────

  const handleRouteFound = useCallback(
    (r: NavigationRoute) => {
      setRoute(r);
      setCurrentStep(0);
      setIsNavigating(false);
    },
    []
  );

  const handleStart = useCallback(() => {
    setIsNavigating(true);
    setCurrentStep(0);
  }, []);

  const handleStop = useCallback(() => {
    setIsNavigating(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((s) =>
      Math.min(
        s + 1,
        (route?.buildings.length ?? 1) - 1
      )
    );
  }, [route]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleClear = useCallback(() => {
    setRoute(null);
    setCurrentStep(0);
    setIsNavigating(false);
  }, []);

  // ─────────────────────────────────────────────
  // AUTO STEP
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (
      !isNavigating ||
      !route ||
      currentStep >= route.buildings.length - 1
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((s) =>
        Math.min(
          s + 1,
          route.buildings.length - 1
        )
      );
    }, 4000);

    return () => clearTimeout(timer);
  }, [
    isNavigating,
    currentStep,
    route,
  ]);

  // ─────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────

  return (
    <motion.div
      className="bg-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      style={{
        height: "100vh",
        paddingTop: 95,
        background: "var(--bg-1)",
        overflow: "hidden",
        willChange: "opacity",
      }}
    >
      <div className="flex h-full overflow-hidden">

        {/* ───────────────── SIDEBAR ───────────────── */}
        <AnimatePresence mode="wait">
          {mode === "campus" && (
            <motion.div
              key="sidebar"
              initial={{
                x: -24,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: -24,
                opacity: 0,
              }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                display: "flex",
                willChange:
                  "transform, opacity",
              }}
            >
              <Sidebar
                selectedBuilding={selected}
                route={route}
                isNavigating={isNavigating}
                currentStep={currentStep}
                onRouteFound={handleRouteFound}
                onStart={handleStart}
                onStop={handleStop}
                onNext={handleNext}
                onPrev={handlePrev}
                onClear={handleClear}
                onCloseBuilding={
                  handleCloseBuilding
                }
                onNavigateTo={
                  handleNavigateTo
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───────────────── MAIN ───────────────── */}
        <div className="relative flex-1 overflow-hidden">

          {/* ───────────────── LIVE HUD ───────────────── */}
          <AnimatePresence>
            {isNavigating && route && (
              <motion.div
                key="hud"
                className="absolute top-4 left-1/2 z-40"
                initial={{
                  y: -16,
                  opacity: 0,
                  scale: 0.97,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  y: -12,
                  opacity: 0,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  width:
                    "min(520px, calc(100vw - 40px))",

                  translateX: "-50%",

                  willChange:
                    "transform, opacity",
                }}
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background:
                      "rgba(6,13,24,0.88)",

                    border:
                      "1px solid rgba(0,212,255,0.18)",

                    backdropFilter:
                      "blur(20px)",

                    boxShadow:
                      "0 12px 40px rgba(0,0,0,0.45), 0 0 24px rgba(0,212,255,0.08)",
                  }}
                >

                  {/* Header */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                    <div>

                      <motion.div
                        className="text-[11px] tracking-[0.24em]"
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay: 0.1,
                          duration: 0.2,
                        }}
                        style={{
                          color:
                            "var(--cyan)",

                          fontFamily:
                            "var(--font-body)",
                        }}
                      >
                        LIVE NAVIGATION
                      </motion.div>

                      <motion.div
                        className="mt-1 text-lg font-semibold"
                        initial={{
                          opacity: 0,
                          y: 4,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.15,
                          duration: 0.25,
                        }}
                        style={{
                          color:
                            "var(--text-1)",

                          fontFamily:
                            "var(--font-display)",
                        }}
                      >
                        Proceed to{" "}
                        {route.buildings[
                          Math.min(
                            currentStep + 1,
                            route.buildings.length - 1
                          )
                        ]?.name ??
                          "Destination"}
                      </motion.div>
                    </div>

                    <motion.div
                      className="px-3 py-1 rounded-full text-sm"
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: 0.2,
                        duration: 0.22,
                      }}
                      style={{
                        background:
                          "rgba(0,212,255,0.08)",

                        border:
                          "1px solid rgba(0,212,255,0.16)",

                        color:
                          "var(--cyan)",
                      }}
                    >
                      {Math.max(
                        1,
                        route.estimatedMinutes -
                          currentStep
                      )}{" "}
                      min
                    </motion.div>
                  </div>

                  {/* Progress */}
                  <div className="px-5 pb-4">

                    {/* Bar */}
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        background:
                          "rgba(255,255,255,0.05)",
                      }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        animate={{
                          width: `${
                            ((currentStep + 1) /
                              route.buildings
                                .length) *
                            100
                          }%`,
                        }}
                        transition={{
                          duration: 0.55,
                          ease: [
                            0.22,
                            1,
                            0.36,
                            1,
                          ],
                        }}
                        style={{
                          background:
                            "linear-gradient(90deg,#00d4ff,#8b5cf6)",

                          boxShadow:
                            "0 0 16px rgba(0,212,255,0.35)",

                          willChange:
                            "width",
                        }}
                      />
                    </div>

                    {/* Dots */}
                    <div className="flex items-center justify-between mt-4">
                      {route.buildings.map(
                        (b, idx) => {
                          const active =
                            idx <= currentStep;

                          return (
                            <div
                              key={b.id}
                              className="flex flex-col items-center gap-2"
                            >
                              <motion.div
                                className="w-3 h-3 rounded-full"
                                animate={{
                                  background:
                                    active
                                      ? "var(--cyan)"
                                      : "rgba(255,255,255,0.12)",

                                  boxShadow:
                                    active
                                      ? "0 0 14px rgba(0,212,255,0.45)"
                                      : "0 0 0px rgba(0,212,255,0)",
                                }}
                                transition={{
                                  duration: 0.3,
                                  ease:
                                    "easeOut",
                                }}
                                style={{
                                  willChange:
                                    "background, box-shadow",
                                }}
                              />

                              <motion.div
                                className="text-[10px] text-center max-w-[72px]"
                                animate={{
                                  color:
                                    active
                                      ? "var(--text-1)"
                                      : "var(--text-3)",
                                }}
                                transition={{
                                  duration: 0.3,
                                }}
                              >
                                {b.shortName}
                              </motion.div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* Arrived */}
                    <AnimatePresence>
                      {currentStep >=
                        route.buildings.length -
                          1 && (
                        <motion.div
                          className="mt-4 rounded-xl px-4 py-3 text-center"
                          initial={{
                            opacity: 0,
                            scale: 0.95,
                            y: 6,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.95,
                          }}
                          transition={{
                            duration: 0.3,
                            ease: [
                              0.22,
                              1,
                              0.36,
                              1,
                            ],
                          }}
                          style={{
                            background:
                              "rgba(16,185,129,0.08)",

                            border:
                              "1px solid rgba(16,185,129,0.18)",

                            color:
                              "#10b981",

                            fontWeight: 600,

                            boxShadow:
                              "0 0 24px rgba(16,185,129,0.12)",
                          }}
                        >
                          ✨ You have arrived at
                          your destination
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ───────────────── MODE TOGGLE ───────────────── */}
          <div
            className="absolute top-4 right-4 z-30 flex rounded-xl overflow-hidden"
            style={{
              background:
                "rgba(6,13,24,0.92)",

              border:
                "1px solid rgba(0,212,255,0.18)",

              backdropFilter:
                "blur(16px)",

              boxShadow:
                "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            {([
              {
                id: "campus",
                label: "Campus Map",
              },

              {
                id: "indoor",
                label: "Indoor Map",
              },
            ] as const).map((item) => {
              const active =
                mode === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setMode(item.id)
                  }
                  className="relative px-4 py-2 text-[12px] font-semibold"
                  style={{
                    background:
                      "transparent",

                    color: active
                      ? "var(--cyan)"
                      : "var(--text-2)",

                    border: "none",

                    borderRight:
                      item.id === "campus"
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "none",

                    cursor: "pointer",

                    fontFamily:
                      "var(--font-body)",

                    transition:
                      "color 0.2s ease",
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="mode-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "rgba(0,212,255,0.12)",

                        zIndex: -1,
                      }}
                      transition={{
                        duration: 0.25,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                    />
                  )}

                  {item.label}
                </button>
              );
            })}
          </div>

          {/* ───────────────── MAIN CONTENT ───────────────── */}
          <AnimatePresence mode="wait">
            {mode === "campus" ? (
              <motion.div
                key="campus"
                className="h-full"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.22,
                  ease: "easeInOut",
                }}
                style={{
                  willChange:
                    "opacity",
                }}
              >
                <CampusMap
                  route={
                    route?.path ?? []
                  }
                  selectedBuilding={
                    selected
                  }
                  currentStep={
                    currentStep
                  }
                  isNavigating={
                    isNavigating
                  }
                  onBuildingClick={
                    handleBuildingClick
                  }
                  height="100%"
                />
              </motion.div>
            ) : (
              <motion.div
                key="indoor"
                className="h-full p-4 pt-16"
                initial={{
                  opacity: 0,
                  scale: 0.99,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.99,
                }}
                transition={{
                  duration: 0.25,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                style={{
                  willChange:
                    "transform, opacity",
                }}
              >
                <FloorMap />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ───────────────── COMMAND PALETTE ───────────────── */}
          <CommandPalette
            onSelectDestination={(
              name
            ) => {
              setCommandDestination(
                name
              );
            }}
            onSelectBuilding={(b) => {
              setSelected(b);
            }}
            onSetSource={() => {}}
            currentSource=""
          />
        </div>
      </div>
    </motion.div>
  );
}