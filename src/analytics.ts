declare global {
  interface Window {
    ym?: (counterId: number | string, method: "reachGoal", goalName: string, params?: GoalParameters) => void;
    __YANDEX_METRIKA_ID__?: number | string;
  }
}

export const YANDEX_METRIKA_ID = 109248707;

type GoalParameters = {
  placement?: "header" | "hero" | "budget" | "featured-route" | "route-list" | "custom-route" | "local-scenes" | "contacts" | "mobile-bar";
  route?: "three-gorges" | "fiagdon" | "dargavs-karmadon" | "midagrabin" | "digoria" | "biragzang" | "mamison" | "tsey" | "happiness-bench" | "bodrov-memorial";
};

export function trackGoal(goalName: string, params?: GoalParameters) {
  if (typeof window === "undefined") return;

  const ym = window.ym;
  const counterId = window.__YANDEX_METRIKA_ID__ ?? YANDEX_METRIKA_ID;

  if (typeof ym === "function" && counterId) {
    if (params) ym(counterId, "reachGoal", goalName, params);
    else ym(counterId, "reachGoal", goalName);
  }
}
