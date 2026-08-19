import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function fixRequestUrl(req: NextRequest) {
  if (!basePath) return req;

  // We use a Proxy to intercept the 'url' property and inject the basePath.
  // This prevents Next.js from consuming the body stream (which happens if you use new Request)
  return new Proxy(req, {
    get(target, prop) {
      if (prop === "url") {
        const originalUrl = target.url;
        // Inject basePath if it's missing from the URL path
        try {
          const urlObj = new URL(originalUrl);
          if (!urlObj.pathname.startsWith(basePath)) {
            urlObj.pathname = `${basePath}${urlObj.pathname}`;
            return urlObj.toString();
          }
        } catch (e) {
          return originalUrl;
        }
      }
      if (prop === "nextUrl") {
        const newUrl = target.nextUrl.clone();
        if (!newUrl.pathname.startsWith(basePath)) {
          newUrl.pathname = `${basePath}${newUrl.pathname}`;
        }
        return newUrl;
      }
      const value = Reflect.get(target, prop);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export const GET = (req: NextRequest) => handlers.GET(fixRequestUrl(req));
export const POST = (req: NextRequest) => handlers.POST(fixRequestUrl(req));
