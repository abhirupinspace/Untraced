import crypto from "crypto";
import dbConnect from "./db/mongodb";
import { ApiKey, Project, type IApiKey, type IProject } from "./db/models";

export interface ValidatedApiKey {
  apiKey: IApiKey;
  project: IProject;
}

/**
 * Validate an API key and return the associated project
 */
export async function validateApiKey(
  key: string
): Promise<ValidatedApiKey | null> {
  if (!key) return null;

  // Validate key format
  if (!key.startsWith("uk_live_") && !key.startsWith("sk_live_")) {
    return null;
  }

  await dbConnect();

  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  const apiKey = await ApiKey.findOne({
    keyHash,
    isActive: true,
  });

  if (!apiKey) return null;

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Get project
  const project = await Project.findById(apiKey.projectId);
  if (!project || project.status !== "active") {
    return null;
  }

  // Update last used
  await ApiKey.findByIdAndUpdate(apiKey._id, {
    $set: { lastUsedAt: new Date() },
  });

  return { apiKey, project };
}

/**
 * Check if API key has required permission
 */
export function hasApiPermission(
  apiKey: IApiKey,
  permission: string
): boolean {
  return apiKey.permissions.includes(permission);
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Rate limiting check (simple in-memory implementation)
 * In production, use Redis for distributed rate limiting
 */
const rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

export function checkRateLimit(
  apiKeyId: string,
  limit: number,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `ratelimit:${apiKeyId}`;

  let record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + windowMs };
    rateLimitStore.set(key, record);
  }

  record.count++;

  if (record.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}
