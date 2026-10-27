"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const publicSiteHost = "scaballeronavia.github.io";
const siteCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE?.trim() ?? "";
const subscribeToHost = () => () => {};
const getIsPublicSite = () => window.location.hostname === publicSiteHost;
const getServerIsPublicSite = () => false;

export default function VisitorCounter() {
  const isPublicSite = useSyncExternalStore(
    subscribeToHost,
    getIsPublicSite,
    getServerIsPublicSite,
  );
  const [count, setCount] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!/^[a-z0-9-]+$/i.test(siteCode) || !isPublicSite) return;

    let isActive = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://gc.zgo.at/count.js";
    script.dataset.goatcounter = `https://${siteCode}.goatcounter.com/count`;
    script.onload = () => {
      void fetch(`https://${siteCode}.goatcounter.com/counter/TOTAL.json`, {
        cache: "no-store",
        credentials: "omit",
      })
        .then((response) => {
          if (!response.ok) throw new Error("Visitor count unavailable");
          return response.json() as Promise<{ count?: unknown }>;
        })
        .then((data) => {
          if (isActive && typeof data.count === "string") setCount(data.count);
          else if (isActive) setUnavailable(true);
        })
        .catch(() => {
          if (isActive) setUnavailable(true);
        });
    };
    script.onerror = () => {
      if (isActive) setUnavailable(true);
    };

    document.head.append(script);
    return () => {
      isActive = false;
      script.remove();
    };
  }, [isPublicSite]);

  if (!/^[a-z0-9-]+$/i.test(siteCode) || !isPublicSite) return null;

  return (
    <span className="footer-visitors" aria-live="polite" aria-atomic="true">
      <span>Visitas al sitio</span>
      <strong>{count ?? (unavailable ? "No disponible" : "Cargando")}</strong>
    </span>
  );
}
