import type { SchemeRecord } from "./schemeCatalog";

export type EligibilityStatus =
  "ELIGIBLE" | "LIKELY ELIGIBLE" | "PARTIALLY MATCHED" | "NOT ELIGIBLE" | "INSUFFICIENT DATA";
export type EligibilityResult = {
  status: EligibilityStatus;
  score: number;
  reasons: string[];
  blockers: string[];
  missing: string[];
};

type Profile = Record<string, unknown>;
const text = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();
const number = (value: unknown) =>
  typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9.]/g, "")) || null;

function normalizeEligibility(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) => ({ [k]: v }));
  }
  return [];
}

function formatEligibilityItem(item: unknown): string {
  if (item == null) return "";
  if (typeof item === "string" || typeof item === "number" || typeof item === "boolean")
    return String(item);
  if (Array.isArray(item)) return item.map(String).join(" ");
  if (typeof item === "object")
    return Object.entries(item as Record<string, unknown>)
      .map(([k, v]) => `${k} ${String(v)}`)
      .join(" ");
  return String(item);
}

function criterion(rule: string, profile: Profile, field: string, keywords: string[]) {
  const value = text(profile[field]);
  const applies = keywords.some((keyword) => rule.includes(keyword));
  return applies
    ? value
      ? rule.includes(value) ||
        keywords.some((keyword) => value.includes(keyword) && rule.includes(keyword))
        ? "pass"
        : "fail"
      : "missing"
    : "irrelevant";
}

export function evaluateScheme(scheme: SchemeRecord, profile: Profile): EligibilityResult {
  const eligibilityArr = normalizeEligibility((scheme as any).eligibility);
  const rules = eligibilityArr.map(formatEligibilityItem).map(text).join(" ");
  const reasons: string[] = [];
  const blockers: string[] = [];
  const missing: string[] = [];
  let points = 0;
  let applicable = 0;
  const check = (field: string, keywords: string[], label: string) => {
    const result = criterion(rules, profile, field, keywords);
    if (result === "irrelevant") return;
    applicable += 1;
    if (result === "missing") {
      missing.push(`${label} information is missing.`);
      return;
    }
    if (result === "pass") {
      points += 1;
      reasons.push(`${label} matches the published scheme conditions.`);
    } else blockers.push(`${label} does not match the published scheme conditions.`);
  };
  if (scheme.state) {
    applicable += 1;
    if (!text(profile.state)) missing.push("State information is missing.");
    else if (text(profile.state) === text(scheme.state)) {
      points += 1;
      reasons.push(`Your state matches ${scheme.state}.`);
    } else
      blockers.push(`This scheme is listed for ${scheme.state}, not ${String(profile.state)}.`);
  }
  const age = number(profile.age);
  if (/\b(age|aged|years? old)\b/.test(rules)) {
    applicable += 1;
    if (!age) missing.push("Age information is missing.");
    else {
      const ranges = [...rules.matchAll(/(\d{1,3})\s*(?:-|to)\s*(\d{1,3})/g)].map(
        (match) => [Number(match[1]), Number(match[2])] as const,
      );
      const passes = ranges.length === 0 || ranges.some(([min, max]) => age >= min && age <= max);
      if (passes) {
        points += 1;
        reasons.push("Your age is consistent with the published conditions.");
      } else blockers.push(`Your age (${age}) does not fit the published age range.`);
    }
  }
  const income = number(profile.annual_income);
  if (/income|annual|lakh|₹|rupee/.test(rules)) {
    applicable += 1;
    if (!income) missing.push("Annual income information is missing.");
    else {
      const limit = rules.match(
        /(?:up to|below|less than|not exceed|maximum)[^0-9]{0,12}(\d+(?:\.\d+)?)\s*(lakh|million)?/,
      );
      const max = limit ? Number(limit[1]) * (limit[2] === "lakh" ? 100000 : 1) : null;
      if (!max || income <= max) {
        points += 1;
        reasons.push(
          "Your annual income is within the published limit or no exact limit is available.",
        );
      } else
        blockers.push(
          `Your annual income exceeds the published limit of ₹${max.toLocaleString("en-IN")}.`,
        );
    }
  }
  check(
    "occupation",
    [
      "farmer",
      "student",
      "employed",
      "self-employed",
      "unemployed",
      "homemaker",
      "retired",
      "worker",
      "entrepreneur",
    ],
    "Your occupation",
  );
  check("gender", ["women", "woman", "female", "girl", "men", "male"], "Your gender");
  check("category", ["sc", "st", "obc", "ews", "general", "caste"], "Your category");
  check(
    "education_level",
    ["student", "school", "college", "education", "graduate", "diploma"],
    "Your education",
  );
  if (/disabil|divyang|special needs/.test(rules)) {
    applicable += 1;
    if (profile.disability_status === null || profile.disability_status === undefined)
      missing.push("Disability information is missing.");
    else if (profile.disability_status) {
      points += 1;
      reasons.push("Your disability information matches a published target group.");
    } else blockers.push("This scheme requires disability-related eligibility.");
  }
  const score = applicable ? Math.round((points / applicable) * 100) : 50;
  const status: EligibilityStatus =
    blockers.length && points === 0
      ? "NOT ELIGIBLE"
      : missing.length && !blockers.length
        ? "INSUFFICIENT DATA"
        : score >= 90
          ? "ELIGIBLE"
          : score >= 70
            ? "LIKELY ELIGIBLE"
            : score > 0
              ? "PARTIALLY MATCHED"
              : "INSUFFICIENT DATA";
  return { status, score: Math.min(100, Math.max(0, score)), reasons, blockers, missing };
}
