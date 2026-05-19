"use client";

import { motion } from "framer-motion";

export default function NavigatorLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-grid"
      style={{
        height: "100vh",
        paddingTop: 95,
        background: "var(--bg-1)",
        overflow: "hidden",
      }}
    >
      <div className="flex h-full overflow-hidden">
        {/* Sidebar Skeleton */}
        <motion.div
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            width: 380,
            height: "100%",
            padding: "24px",
            borderRight: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Search skeleton */}
          <div
            style={{
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <ShimmerEffect delay={0} />
          </div>

          {/* Quick actions skeleton */}
          <div style={{ display: "flex", gap: 12 }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 64,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <ShimmerEffect delay={i * 0.1} />
              </div>
            ))}
          </div>

          {/* List items skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 72,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <ShimmerEffect delay={i * 0.08} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main content skeleton */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Mode toggle skeleton */}
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 30,
              width: 280,
              height: 40,
              borderRadius: 12,
              background: "rgba(6,13,24,0.92)",
              border: "1px solid rgba(0,212,255,0.18)",
              backdropFilter: "blur(16px)",
              overflow: "hidden",
            }}
          >
            <ShimmerEffect delay={0.2} />
          </motion.div>

          {/* Map skeleton */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: "absolute",
              inset: 0,
              margin: 24,
              borderRadius: 20,
              background: "rgba(255,255,255,0.01)",
              border: "1px solid rgba(255,255,255,0.04)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShimmerEffect delay={0.3} />

            {/* Map icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto",
                  borderRadius: 16,
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.6 }}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-3)",
                  letterSpacing: "0.05em",
                  fontFamily: "var(--font-body)",
                }}
              >
                Loading Campus Map
              </div>

              {/* Pulse dots */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--cyan)",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Shimmer component for skeleton elements
function ShimmerEffect({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "200%" }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
        repeatDelay: 0.5,
      }}
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
        transform: "skewX(-20deg)",
      }}
    />
  );
}