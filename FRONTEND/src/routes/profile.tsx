import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Save, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { getUser, updateProfile, type User } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/schemeCatalog";
import { requireAuth } from "@/components/AuthGuard";
import { normalizeDateForInput } from "@/lib/utils";

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
const districts: Record<string, string[]> = {
  Haryana: [
    "Ambala",
    "Bhiwani",
    "Faridabad",
    "Gurugram",
    "Hisar",
    "Karnal",
    "Panipat",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Other",
  ],
  Maharashtra: ["Mumbai City", "Mumbai Suburban", "Nashik", "Pune", "Nagpur", "Thane", "Other"],
  Kerala: ["Thiruvananthapuram", "Kollam", "Ernakulam", "Thrissur", "Kozhikode", "Kannur", "Other"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Other"],
  "Uttar Pradesh": ["Agra", "Ghaziabad", "Lucknow", "Meerut", "Varanasi", "Other"],
};
const occupations = [
  "Student",
  "Employed",
  "Self-employed",
  "Farmer",
  "Business owner",
  "Unemployed",
  "Homemaker",
  "Retired",
  "Other",
];
const educations = [
  "No formal education",
  "Primary",
  "Secondary",
  "Higher Secondary",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Doctorate",
  "Other",
];
const categories = ["General", "OBC", "SC", "ST", "EWS", "Other", "Prefer not to say"];
const categoryLabel = (value: unknown) =>
  ({
    general: "General",
    obc: "OBC",
    sc: "SC",
    st: "ST",
    ews: "EWS",
    other: "Other",
    prefer_not_to_say: "Prefer not to say",
  })[String(value ?? "").toLowerCase()] || "";
const labelValue = (value: unknown, labels: Record<string, string>) =>
  labels[String(value ?? "").toLowerCase()] || "";
const genderLabel = (value: unknown) =>
  labelValue(value, {
    male: "Male",
    female: "Female",
    other: "Other",
    prefer_not_to_say: "Prefer not to say",
  });
const occupationLabel = (value: unknown) =>
  labelValue(value, {
    student: "Student",
    employed: "Employed",
    self_employed: "Self-employed",
    farmer: "Farmer",
    business_owner: "Business owner",
    unemployed: "Unemployed",
    homemaker: "Homemaker",
    retired: "Retired",
    other: "Other",
  });
const educationLabel = (value: unknown) =>
  labelValue(value, {
    no_formal_education: "No formal education",
    primary: "Primary",
    secondary: "Secondary",
    higher_secondary: "Higher Secondary",
    diploma: "Diploma",
    undergraduate: "Undergraduate",
    postgraduate: "Postgraduate",
    doctorate: "Doctorate",
    other: "Other",
  });
const maritalLabel = (value: unknown) =>
  labelValue(value, {
    single: "Single",
    married: "Married",
    divorced: "Divorced",
    widowed: "Widowed",
    prefer_not_to_say: "Prefer not to say",
  });
const languageLabel = (value: unknown) => {
  const text = String(value ?? "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";
};
const marital = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];
const incomeRanges = [
  { label: "Below ₹2 lakh", value: 100000 },
  { label: "₹2–5 lakh", value: 350000 },
  { label: "₹5–10 lakh", value: 750000 },
  { label: "Above ₹10 lakh", value: 1000000 },
];

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ location }) => {
    if (!getUser()) throw requireAuth({ location });
  },
  component: Profile,
});

function Profile() {
  const [user, setUser] = useState<User>(getUser()!);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    void fetchUserProfile(user.id)
      .then((profile) =>
        setUser(
          (current) =>
            ({
              ...current,
              ...profile,
              gender: genderLabel(profile.gender),
              occupation: occupationLabel(profile.occupation),
              education_level: educationLabel(profile.education_level),
              category: categoryLabel(profile.category),
              marital_status: maritalLabel(profile.marital_status),
              preferred_language: languageLabel(profile.preferred_language),
              id: current.id,
              email: current.email,
            }) as User,
        ),
      )
      .catch(() => undefined);
  }, [user.id]);
  const set = (key: keyof User, value: string | number | null) =>
    setUser((current) => ({ ...current, [key]: value }));
  const input = (key: keyof User, label: string, type = "text") => {
    const value =
      key === "date_of_birth" ? normalizeDateForInput(user[key]) : String(user[key] ?? "");
    return (
      <label className="block text-sm">
        {label}
        <input
          type={type}
          value={value}
          onChange={(e) =>
            set(
              key,
              type === "number" ? (e.target.value ? Number(e.target.value) : null) : e.target.value,
            )
          }
          className="mt-2 w-full rounded-lg border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-saffron"
        />
      </label>
    );
  };
  const select = (key: keyof User, label: string, options: string[]) => (
    <label className="block text-sm">
      {label}
      <select
        value={String(user[key] ?? "")}
        onChange={(e) => set(key, e.target.value)}
        className="mt-2 w-full rounded-lg border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-saffron"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
  const districtOptions = districts[user.state] || ["Other"];
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <Nav />
      <section className="edge py-28 md:py-36">
        <p className="eyebrow text-saffron">YOUR PROFILE</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">Tell us about you.</h1>
        <p className="mt-4 text-ink/55">
          More details help Yojantra find relevant benefits. You choose what to share.
        </p>
        <div className="mt-10 max-w-3xl rounded-2xl border border-ink/10 bg-white/45 p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            {input("full_name", "Full name")}
            {input("email", "Email", "email")}
            {input("phone", "Phone")}
            {input("date_of_birth", "Date of birth", "date")}
            {input("age", "Age", "number")}
            {select("gender", "Gender", ["Male", "Female", "Other", "Prefer not to say"])}
            {select("state", "State / union territory", states)}
            {select("district", "District", districtOptions)}
            {input("pincode", "Pincode")}
            {select("occupation", "Occupation", occupations)}
            {select("education_level", "Education", educations)}
            {select("category", "Category", categories)}
            {select("marital_status", "Marital status", marital)}
            {select("preferred_language", "Preferred language", [
              "English",
              "Hindi",
              "Bengali",
              "Tamil",
              "Telugu",
              "Marathi",
              "Gujarati",
              "Kannada",
              "Malayalam",
              "Punjabi",
              "Urdu",
            ])}
            <label className="block text-sm">
              Annual income
              <select
                value={String(user.annual_income ?? "")}
                onChange={(e) =>
                  set("annual_income", e.target.value ? Number(e.target.value) : null)
                }
                className="mt-2 w-full rounded-lg border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-saffron"
              >
                <option value="">Select range</option>
                {incomeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            disabled={saving}
            onClick={async () => {
              setError("");
              setSaving(true);
              try {
                await updateProfile(user, { includeEligibilityFields: false });
                setSaved(true);
                window.setTimeout(() => void navigate({ to: "/dashboard" }), 900);
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : "Unable to save your profile.");
              } finally {
                setSaving(false);
              }
            }}
            className="mt-7 flex items-center gap-2 rounded-full bg-saffron px-5 py-3 text-sm font-semibold text-white"
          >
            <Save size={16} />
            {saved ? "Profile updated successfully." : saving ? "Saving…" : "Save profile"}
          </button>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        </div>
        <div className="mt-6 max-w-3xl rounded-xl border border-ink/10 p-5 text-sm text-ink/60">
          <ShieldCheck className="mr-2 inline text-verified" size={18} />
          Email verification is managed by Supabase Auth.{" "}
          <button className="mt-4 flex items-center gap-2 text-red-600">
            <Trash2 size={15} /> Delete account
          </button>
        </div>
      </section>
    </main>
  );
}
