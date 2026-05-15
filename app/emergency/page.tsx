import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Cross,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BUILDINGS } from "@/data/buildings";

const emergencyBuildings = BUILDINGS.filter((building) => building.type === "emergency");

const contacts = [
  { label: "Campus Security", value: "+91 98765 43210", tone: "var(--red)" },
  { label: "Medical Helpdesk", value: "+91 98765 43211", tone: "var(--green)" },
  { label: "Main Reception", value: "+91 98765 43212", tone: "var(--cyan)" },
];

const responseSteps = [
  "Move to a visible, safe area if possible.",
  "Call campus security or medical help immediately.",
  "Share your nearest building, floor, and room number.",
  "Stay on the line until help reaches you.",
];

export default function EmergencyPage() {
  return (
    <main
      className="min-h-screen bg-grid"
      style={{ background: "var(--bg-1)", paddingTop: 95 }}
    >
      <div className="max-w-[1180px] mx-auto px-5 py-8">
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 mb-5">
          <GlassCard neon className="p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[1.5px]"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.28)",
                  color: "var(--red)",
                  fontFamily: "var(--font-display)",
                }}
              >
                <AlertTriangle className="w-3 h-3" />
                EMERGENCY MODE
              </span>
            </div>

            <h1
              className="text-[clamp(30px,5vw,54px)] font-black leading-tight mb-4"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-display)" }}
            >
              Get Help Fast
            </h1>
            <p
              className="text-[15px] leading-relaxed max-w-2xl mb-7"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              Use this page for urgent campus support, medical assistance, and quick routing to emergency facilities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {contacts.map((contact) => (
                <a
                  key={contact.label}
                  href={`tel:${contact.value.replace(/\s/g, "")}`}
                  className="rounded-xl px-4 py-3 transition-transform hover:scale-[1.02]"
                  style={{
                    background: `${contact.tone}12`,
                    border: `1px solid ${contact.tone}35`,
                    color: contact.tone,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-[11px] font-semibold">{contact.label}</span>
                  </div>
                  <div className="text-[13px] font-bold">{contact.value}</div>
                </a>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div
              className="text-[11px] font-semibold tracking-[1.5px] mb-4 flex items-center gap-2"
              style={{ color: "var(--amber)", fontFamily: "var(--font-display)" }}
            >
              <ShieldAlert className="w-4 h-4" />
              WHAT TO DO NOW
            </div>
            <div className="flex flex-col gap-3">
              {responseSteps.map((step, index) => (
                <div key={step} className="flex gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{
                      background: "rgba(245,158,11,0.12)",
                      border: "1px solid rgba(245,158,11,0.28)",
                      color: "var(--amber)",
                    }}
                  >
                    {index + 1}
                  </div>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <GlassCard neon className="p-5">
              <div
                className="text-[11px] font-semibold tracking-[1.5px] mb-4 flex items-center gap-2"
                style={{ color: "var(--cyan)", fontFamily: "var(--font-display)" }}
              >
                <MapPin className="w-4 h-4" />
                EMERGENCY LOCATIONS
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyBuildings.map((building) => (
                  <div
                    key={building.id}
                    className="rounded-xl p-4"
                    style={{
                      background: `${building.color}0f`,
                      border: `1px solid ${building.color}30`,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${building.color}18`,
                          border: `1px solid ${building.color}35`,
                          color: building.color,
                        }}
                      >
                        {building.id === "medical" ? (
                          <Cross className="w-5 h-5" />
                        ) : (
                          <ShieldCheck className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2
                          className="text-[15px] font-bold mb-1"
                          style={{ color: "var(--text-1)", fontFamily: "var(--font-display)" }}
                        >
                          {building.name}
                        </h2>
                        <p
                          className="text-[12px] leading-relaxed"
                          style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                        >
                          {building.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {building.facilities.slice(0, 4).map((facility) => (
                        <span
                          key={facility}
                          className="text-[10px] px-2.5 py-1 rounded-lg"
                          style={{
                            background: `${building.color}10`,
                            border: `1px solid ${building.color}25`,
                            color: building.color,
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {facility}
                        </span>
                      ))}
                    </div>

                    <Link
                      href="/navigator"
                      className="inline-flex items-center gap-2 text-[12px] font-semibold"
                      style={{ color: building.color, fontFamily: "var(--font-body)" }}
                    >
                      Open in navigator
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <div
              className="text-[11px] font-semibold tracking-[1.5px] mb-4 flex items-center gap-2"
              style={{ color: "var(--green)", fontFamily: "var(--font-display)" }}
            >
              <Clock className="w-4 h-4" />
              LIVE STATUS
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Medical Center", value: "Available", color: "var(--green)" },
                { label: "Security Patrol", value: "Active", color: "var(--cyan)" },
                { label: "SOS Alerts", value: "0 Open", color: "var(--green)" },
                { label: "Ambulance Bay", value: "Ready", color: "var(--amber)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: item.color, fontFamily: "var(--font-body)" }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
