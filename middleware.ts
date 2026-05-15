import { NextResponse, type NextRequest } from "next/server";
import { PARTICIPANT_COOKIE } from "./lib/participant";

// When someone opens `/?u=TOKEN` (or any path with ?u=), bake the token into a
// cookie and redirect to the same path without the query param. That way the
// shareable URL is one-shot and the browser doesn't keep the token in history.
export function middleware(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("u");
  if (!token) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.searchParams.delete("u");
  const res = NextResponse.redirect(url);
  res.cookies.set(PARTICIPANT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // a year — outlives the trip
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
