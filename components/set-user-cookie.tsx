"use client";

import { useEffect } from "react";
import { setUserCookie } from "@/lib/user-cookie";

interface SetUserCookieProps {
  slug: string;
  name?: string;
}

export function SetUserCookie({ slug, name }: SetUserCookieProps) {
  useEffect(() => {
    setUserCookie({ slug, name });
  }, [slug, name]);

  return null;
}
