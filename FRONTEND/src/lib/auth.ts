import { supabase } from "@/supabase";

export type User = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  date_of_birth: string;
  age: number | null;
  gender: string;
  state: string;
  district: string;
  pincode: string;
  occupation: string;
  annual_income: number | null;
  education_level: string;
  category: string;
  disability_status: boolean | null;
  marital_status: string;
  is_student: boolean | null;
  profile_completed: boolean;
  preferred_language: string;
};
const KEY = "yojantra-auth-user";
const CATEGORY_VALUES: Record<string, string> = {
  general: "general",
  obc: "obc",
  sc: "sc",
  st: "st",
  ews: "ews",
  other: "other",
  prefer_not_to_say: "prefer_not_to_say",
  "prefer not to say": "prefer_not_to_say",
};
export function normalizeCategory(value: unknown): string | null {
  const key = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
  return CATEGORY_VALUES[key] || null;
}
const valueMap = (value: unknown, map: Record<string, string>) => {
  const key = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
  return map[key] || null;
};
const optionalText = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text && text.toLowerCase() !== "select" ? text : null;
};
export function normalizeProfileForDatabase(
  user: User,
  options: { includeEligibilityFields?: boolean } = {},
) {
  const profile: Record<string, unknown> = {
    id: user.id,
    full_name: optionalText(user.full_name),
    email: optionalText(user.email),
    phone: optionalText(user.phone),
    avatar_url: optionalText(user.avatar_url),
    date_of_birth: optionalText(user.date_of_birth),
    age: user.age || null,
    gender: valueMap(user.gender, {
      male: "male",
      female: "female",
      other: "other",
      prefer_not_to_say: "prefer_not_to_say",
    }),
    state: optionalText(user.state),
    district: optionalText(user.district),
    pincode: optionalText(user.pincode),
    occupation: valueMap(user.occupation, {
      student: "student",
      employed: "employed",
      self_employed: "self_employed",
      "self-employed": "self_employed",
      farmer: "farmer",
      business_owner: "business_owner",
      "business owner": "business_owner",
      government_employee: "government_employee",
      "government employee": "government_employee",
      agricultural_worker: "agricultural_worker",
      "agricultural worker": "agricultural_worker",
      daily_wage: "daily_wage",
      "daily wage": "daily_wage",
      unemployed: "unemployed",
      homemaker: "homemaker",
      retired: "retired",
      other: "other",
    }),
    annual_income: user.annual_income || null,
    education_level: valueMap(user.education_level, {
      no_formal_education: "no_formal_education",
      primary: "primary",
      secondary: "secondary",
      higher_secondary: "higher_secondary",
      diploma: "diploma",
      undergraduate: "undergraduate",
      postgraduate: "postgraduate",
      doctorate: "doctorate",
      other: "other",
    }),
    category: normalizeCategory(user.category),
    marital_status: valueMap(user.marital_status, {
      single: "single",
      married: "married",
      divorced: "divorced",
      widowed: "widowed",
      prefer_not_to_say: "prefer_not_to_say",
    }),
    profile_completed: Boolean(user.profile_completed),
    preferred_language: valueMap(user.preferred_language, {
      english: "english",
      hindi: "hindi",
      bengali: "bengali",
      tamil: "tamil",
      telugu: "telugu",
      marathi: "marathi",
      gujarati: "gujarati",
      kannada: "kannada",
      malayalam: "malayalam",
      punjabi: "punjabi",
      urdu: "urdu",
    }),
    updated_at: new Date().toISOString(),
  };
  if (options.includeEligibilityFields !== false) {
    profile.disability_status = user.disability_status ?? null;
    profile.is_student = user.is_student ?? null;
  }
  return profile;
}
const defaults: Omit<User, "id" | "email"> = {
  full_name: "",
  phone: "",
  avatar_url: "",
  date_of_birth: "",
  age: null,
  gender: "",
  state: "",
  district: "",
  pincode: "",
  occupation: "",
  annual_income: null,
  education_level: "",
  category: "",
  disability_status: null,
  marital_status: "",
  is_student: null,
  profile_completed: false,
  preferred_language: "English",
};

function userFromAuth(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): User {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email || "",
    ...defaults,
    full_name:
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : "",
  };
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(KEY);
  return value ? (JSON.parse(value) as User) : null;
}
function cacheUser(user: User) {
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}
export async function hydrateUser() {
  if (!supabase || typeof window === "undefined") return getUser();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return cacheUser(userFromAuth(data.user));
}
export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(error?.message || "Unable to sign in.");
  return cacheUser(userFromAuth({ ...data.user, email: data.user.email || email }));
}
export async function signUp(name: string, email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, full_name: name } },
  });
  if (error) throw new Error(error.message);
  if (data.user)
    cacheUser({ id: data.user.id, email: data.user.email || email, ...defaults, full_name: name });
  return data.user;
}
export async function updateProfile(
  user: User,
  options: { includeEligibilityFields?: boolean } = {},
) {
  cacheUser(user);
  if (!supabase) return;
  const profile = normalizeProfileForDatabase(user, options);
  const { error } = await supabase.from("profiles").upsert(profile);
  if (error) throw new Error(error.message);
  const { error: recommendationError } = await supabase
    .from("scheme_recommendations")
    .delete()
    .eq("user_id", user.id);
  if (recommendationError) throw new Error(recommendationError.message);
}
export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  localStorage.removeItem(KEY);
}
export async function resetPassword(email: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw new Error(error.message);
}
export function profileCompletion(
  profile: Record<string, unknown> | User | null,
  fields?: string[],
) {
  if (!profile) return 0;
  const trackedFields = fields || [
    "full_name",
    "phone",
    "date_of_birth",
    "gender",
    "state",
    "district",
    "occupation",
    "annual_income",
    "education_level",
    "category",
    "disability_status",
    "marital_status",
    "is_student",
    "preferred_language",
  ];
  const completed = trackedFields.filter((field) => {
    const value = profile[field];
    return (
      value !== null &&
      value !== undefined &&
      (typeof value === "boolean" || String(value).trim().length > 0)
    );
  }).length;
  return Math.min(
    100,
    Math.max(0, Math.round((completed / Math.max(trackedFields.length, 1)) * 100)),
  );
}
