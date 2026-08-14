import { redirect } from "@tanstack/react-router";
import { getUser, hydrateUser } from "@/lib/auth";
export async function requireAuth({ location }: { location: { href: string } }) {
  if (typeof window === "undefined") return;
  if (!getUser() && !(await hydrateUser()))
    throw redirect({ to: "/login", search: { redirect: location.href } });
}
