import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { getScheme } from "@/data/schemes";

export type LatestSchemeItem = {
  id: string;
  name: string;
  detail: string;
};

const DEFAULT_ITEMS: LatestSchemeItem[] = [
  { id: "pm-kisan", name: "PM-KISAN", detail: "₹6,000/year" },
  { id: "ayushman-bharat", name: "Ayushman Bharat", detail: "₹5 lakh health cover" },
  { id: "pm-vishwakarma", name: "PM Vishwakarma", detail: "Training + financial support" },
  { id: "pmay", name: "PM Awas Yojana", detail: "Housing assistance" },
  { id: "post-matric-scholarship", name: "National Scholarship", detail: "Student benefits" },
];

export function LatestSchemesTicker({
  items = DEFAULT_ITEMS,
  className,
}: {
  items?: LatestSchemeItem[];
  className?: string;
}) {
  const { t } = useT();

  return (
    <nav
      aria-label={t("LATEST SCHEMES")}
      className={cn(
        "fixed bottom-4 left-1/2 z-[70] w-[calc(100%-20px)] max-w-[1200px] -translate-x-1/2 md:w-[88%]",
        className,
      )}
    >
      <div className="ticker-bar flex h-[46px] items-center gap-2.5 overflow-hidden rounded-[14px] border border-white/12 bg-[rgba(23,23,23,0.92)] pl-3.5 pr-1.5 backdrop-blur-md md:h-[50px] md:gap-4 md:pl-5 md:pr-2">
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="ticker-dot size-1.5 rounded-full bg-[#FF6542] md:size-2"
            aria-hidden="true"
          />
          <span className="eyebrow whitespace-nowrap text-[10px] text-white/70 md:text-[11px]">
            {t("LATEST SCHEMES")}
          </span>
        </div>
        <span className="h-5 w-px shrink-0 bg-white/10 md:h-6" aria-hidden="true" />

        <div className="ticker-viewport min-w-0 flex-1">
          <div className="ticker-track flex w-max items-center">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                {items.map((item) => {
                  const toScheme = Boolean(getScheme(item.id));
                  const label = (
                    <>
                      <span className="text-xs font-semibold tracking-[0.01em] text-white/85 transition-colors duration-200 group-hover:text-[#FF6542]">
                        {item.name}
                      </span>
                      <span className="mx-2 text-white/40 md:mx-2.5" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs text-white/55 transition-colors duration-200 group-hover:text-[#FF6542]">
                        {item.detail}
                      </span>
                    </>
                  );
                  const cls = cn(
                    "ticker-item group flex items-center whitespace-nowrap pr-7 transition-colors duration-200 md:pr-9",
                  );
                  return (
                    <li key={item.id}>
                      {toScheme ? (
                        <Link
                          to="/scheme/$id"
                          params={{ id: item.id }}
                          className={cls}
                        >
                          {label}
                        </Link>
                      ) : (
                        <span className={cn(cls, "cursor-default")}>{label}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>

        <Link
          to="/schemes"
          aria-label={t("VIEW ALL")}
          className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-white/75 uppercase transition-colors duration-200 hover:border-[#FF6542] hover:text-[#FF6542] md:px-4 md:text-[11px]"
        >
          <span className="hidden md:inline">{t("VIEW ALL")} →</span>
          <ArrowRight className="size-4 md:hidden" strokeWidth={2.2} />
        </Link>
      </div>
    </nav>
  );
}
