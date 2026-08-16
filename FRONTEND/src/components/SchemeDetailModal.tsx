import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExternalLink, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/renderMarkdown";

export interface SchemeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheme: {
    id: string;
    name: string;
    summary?: string;
    description?: string;
    benefit?: string;
    benefitNote?: string;
    category?: string;
    level?: string;
    match?: number;
    whoCanApply?: string[];
    whatYouGet?: string[];
    documents?: Array<{ name: string; why: string; how: string; mandatory: boolean }>;
    howToApply?: string[];
    source?: string;
    application_url?: string;
    source_url?: string;
    official_application_url?: string;
    official_source_url?: string;
    deadlineDays?: number;
    status?: string;
    is_demo?: boolean;
    eligibility?: string[];
    benefits?: string[];
    documents_required?: string[];
  } | null;
}

export function SchemeDetailModal({ open, onOpenChange, scheme }: SchemeDetailModalProps) {
  const { t } = useT();

  if (!scheme) return null;

  const hasOfficialUrl =
    scheme.application_url ||
    scheme.official_application_url ||
    scheme.source_url ||
    scheme.official_source_url;
  const officialUrl =
    scheme.application_url ||
    scheme.official_application_url ||
    scheme.source_url ||
    scheme.official_source_url;
  const isDemo = scheme.is_demo || !hasOfficialUrl;

  const handleOpenPortal = () => {
    if (officialUrl && (officialUrl.startsWith("http://") || officialUrl.startsWith("https://"))) {
      window.open(officialUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl sm:text-2xl">{scheme.name}</DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {scheme.match && (
                  <div className="flex flex-col gap-0.5">
                    <span className="rounded-full bg-saffron/10 px-3 py-1 text-saffron font-medium">
                      {scheme.match}% {t("match")}
                    </span>
                    {isDemo && (
                      <span className="text-[10px] text-ink/40 pl-1">
                        {t("Demo match based on the information you provided")}
                      </span>
                    )}
                  </div>
                )}
                {scheme.level && (
                  <span className="rounded-full border border-ink/15 px-3 py-1 text-ink/60">
                    {scheme.level}
                  </span>
                )}
                {scheme.category && (
                  <span className="rounded-full border border-ink/15 px-3 py-1 text-ink/60">
                    {scheme.category}
                  </span>
                )}
                {isDemo && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold text-amber-700 uppercase">
                    {t("Demo")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {scheme.summary && (
            <div>
              <DialogDescription
                className="text-base leading-relaxed text-ink/75 [&_strong]:font-semibold [&_em]:italic"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(scheme.summary) }}
              />
            </div>
          )}

          {scheme.description && scheme.description !== scheme.summary && (
            <div>
              <DialogDescription
                className="text-sm leading-relaxed text-ink/65 [&_strong]:font-semibold [&_em]:italic"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(scheme.description) }}
              />
            </div>
          )}

          {scheme.benefit && (
            <div className="rounded-lg bg-saffron/5 p-4 border border-saffron/20">
              <p className="eyebrow text-saffron">{t("Benefit")}</p>
              <p className="mt-1 text-base leading-relaxed text-ink/80">{scheme.benefit}</p>
              {scheme.benefitNote && (
                <p className="mt-1 text-sm text-ink/60">{scheme.benefitNote}</p>
              )}
            </div>
          )}

          {scheme.deadlineDays !== undefined && scheme.deadlineDays !== null && (
            <div className="rounded-lg bg-ivory-deep/50 p-4 border border-ink/10">
              <p className="eyebrow text-ink/40">{t("Deadline")}</p>
              <p className="display text-2xl font-semibold">
                {scheme.deadlineDays <= 0
                  ? t("Deadline passed")
                  : scheme.deadlineDays === 1
                    ? t("1 day remaining")
                    : `${scheme.deadlineDays} ${t("days remaining")}`}
              </p>
            </div>
          )}

          {(scheme.whoCanApply || scheme.eligibility) && (
            <div>
              <p className="eyebrow text-ink/40 mb-3">{t("Who can apply")}</p>
              <ul className="space-y-2">
                {(scheme.whoCanApply || scheme.eligibility || []).map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink/75">
                    <Check className="size-4 shrink-0 text-verified mt-0.5" strokeWidth={2.4} />
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }} className="[&_p]:inline" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scheme.whatYouGet && scheme.whatYouGet.length > 0 && (
            <div>
              <p className="eyebrow text-ink/40 mb-3">{t("What you get")}</p>
              <ul className="space-y-2">
                {scheme.whatYouGet.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink/75">
                    <Check className="size-4 shrink-0 text-verified mt-0.5" strokeWidth={2.4} />
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }} className="[&_p]:inline" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(scheme.documents || scheme.documents_required) && (
            <div>
              <p className="eyebrow text-ink/40 mb-3">{t("Documents required")}</p>
              <ul className="space-y-2">
                {(scheme.documents || scheme.documents_required || []).map((doc, i) => {
                  const name = typeof doc === "object" ? doc.name : doc;
                  const mandatory = typeof doc === "object" ? doc.mandatory : false;
                  return (
                    <li key={i} className="flex gap-3 text-sm text-ink/75">
                      <Check className="size-4 shrink-0 text-verified mt-0.5" strokeWidth={2.4} />
                      <span>{name}</span>
                      {mandatory && (
                        <span className="ml-2 rounded-full bg-saffron/10 px-2 py-0.5 text-[10px] font-semibold text-saffron uppercase">
                          {t("Mandatory")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {scheme.howToApply && scheme.howToApply.length > 0 && (
            <div>
              <p className="eyebrow text-ink/40 mb-3">{t("How to apply")}</p>
              <ol className="space-y-3">
                {scheme.howToApply.map((step, i) => (
                  <li key={i} className="flex gap-4 text-sm text-ink/75">
                    <span className="flex-shrink-0 w-6 text-center text-saffron font-semibold">
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {scheme.source && (
            <div className="rounded-lg bg-ivory-deep/50 p-4 border border-ink/10">
              <p className="eyebrow text-ink/40">{t("Official source")}</p>
              <p
                className="mt-1 text-base leading-snug text-ink/80 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(scheme.source) }}
              />
            </div>
          )}

          {isDemo && (
            <div className="rounded-lg bg-amber-50/80 p-4 border border-amber-200/60">
              <p className="eyebrow text-amber-700">{t("Why is this marked \"Demo\"?")}</p>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink/65">
                <p>
                  {t("These schemes are provided for demonstration purposes only. This application does not currently have government authorization to represent these schemes as official government programs. The information shown is sample/demo content and should not be treated as an official eligibility decision.")}
                </p>
                <p>
                  {t("Always verify scheme details and eligibility through the relevant official government portal.")}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-ink/10">
          <div className="w-full flex flex-col sm:flex-row gap-3">
            {isDemo ? (
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-full bg-ink px-5 py-2.5 text-[11px] font-semibold tracking-[.14em] text-ivory uppercase transition-colors hover:bg-saffron"
              >
                {t("Close")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 rounded-full border border-ink/15 px-5 py-2.5 text-[11px] font-semibold tracking-[.14em] text-ink hover:border-saffron hover:text-saffron"
                >
                  {t("Close")}
                </button>
                <button
                  onClick={() => {
                    handleOpenPortal();
                    onOpenChange(false);
                  }}
                  className="flex-1 rounded-full bg-saffron px-5 py-2.5 text-[11px] font-semibold tracking-[.14em] text-white uppercase transition-colors hover:bg-ink flex items-center justify-center gap-2"
                >
                  <ExternalLink className="size-3.5" />
                  {t("Open Official Portal")}
                </button>
              </>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-ink/45">
            {t("Always verify eligibility and apply through the official government portal.")}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
