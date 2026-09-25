"use client";

import { CalendarCheck, Search, Smartphone } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal, revealItem } from "@/components/ui/motion";

interface Step {
  icon: ReactNode;
  title: string;
  body: string;
}

/** The node on the beam: the step's icon with its number tucked into the corner. */
function Node({ n, icon }: { n: number; icon: ReactNode }) {
  return (
    <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-leash shadow-card ring-8 ring-canvas [&_svg]:size-5">
      {icon}
      <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-leash text-label font-bold text-surface ring-2 ring-canvas">
        {n}
      </span>
    </span>
  );
}

/**
 * Three steps joined by a beam of light: across the page from 768 px, down the
 * left edge on phones. The travelling light is decoration and stops with
 * reduced motion.
 */
export function HowItWorks({ hours }: { hours: string }) {
  const steps: Step[] = [
    {
      icon: <Search />,
      title: "Find a carer near you",
      body: "Filter by service, price and rating, and see who is free today.",
    },
    {
      icon: <CalendarCheck />,
      title: "Pick a time and pay",
      body: `See the full price before you pay. Cancel free up to ${hours} before the visit.`,
    },
    {
      icon: <Smartphone />,
      title: "Follow the visit live",
      body: "Track your carer on the map, get photo updates and chat without sharing numbers.",
    },
  ];

  return (
    <div className="relative">
      {/* Across: from the first node's centre to the last one's (each is the centre of a third). */}
      <div
        aria-hidden
        className="absolute top-6 hidden h-px overflow-hidden bg-hairline md:block"
        style={{ left: "calc((100% - 3rem) / 6)", right: "calc((100% - 3rem) / 6)" }}
      >
        <span className="block h-full w-1/3 bg-linear-to-r from-transparent via-leash to-transparent motion-safe:animate-[beam-travel_3.2s_ease-in-out_infinite]" />
      </div>

      <Reveal as="ol" className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative flex gap-4 md:flex-col md:items-center md:gap-0 md:text-center"
            {...revealItem(index)}
          >
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-12 -bottom-6 left-6 w-px -translate-x-1/2 overflow-hidden bg-hairline md:hidden"
              >
                <span
                  className="block h-1/2 w-full bg-linear-to-b from-transparent via-leash to-transparent motion-safe:animate-[beam-travel-y_2.4s_ease-in-out_infinite]"
                  style={{ animationDelay: `${index * 0.6}s` }}
                />
              </span>
            ) : null}
            <Node n={index + 1} icon={step.icon} />
            <div className="min-w-0 pt-1 md:mt-5 md:max-w-xs md:pt-0">
              <h3 className="text-title font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </div>
  );
}
