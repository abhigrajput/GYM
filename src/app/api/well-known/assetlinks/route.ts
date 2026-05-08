import { secureJson } from "@/lib/security/api"

export const dynamic = "force-dynamic"

export async function GET() {
  return secureJson([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "in.ironiq.app",
        sha256_cert_fingerprints: ["REPLACE_WITH_YOUR_SHA256_AFTER_PLAY_CONSOLE_SETUP"],
      },
    },
  ])
}
