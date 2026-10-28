import type { Request, Response } from "express";

import {
  ADMIN_SESSION_COOKIE_NAME,
  COOKIE_OPTIONS,
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from "@/config/session.js";
import { AppError } from "@/middlewares/errorHandler.js";
import { generateCsrfToken } from "@/middlewares/csrf.js";
import * as authService from "./service.js";
import type { ChangePasswordBody, LoginBody, RegisterBody, UpdateProfileBody } from "./schema.js";
import type { SessionKind } from "@/db/schema/sessions.js";

const CSRF_TTL_MS = 24 * 60 * 60 * 1000;

export function issueCsrf(_req: Request, res: Response): void {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: COOKIE_OPTIONS.secure,
    sameSite: "lax",
    path: "/",
    maxAge: CSRF_TTL_MS,
    domain: COOKIE_OPTIONS.domain,
  });
  res.status(200).json({ data: { csrfToken: token } });
}

export async function register(req: Request, res: Response): Promise<void> {
  const body = req.body as RegisterBody;
  const user = await authService.registerUser(body);
  await startCustomerSession(req, res, user.id);
  res.status(201).json({ data: user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = req.body as LoginBody;
  const user = await authService.verifyCredentials(body);
  if (!user) {
    throw new AppError("UNAUTHORIZED", 401, "Invalid email or password");
  }
  await startCustomerSession(req, res, user.id);
  res.status(200).json({ data: authService.toAuthUser(user) });
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (req.sessionId) {
    await authService.logout(req.sessionId);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
  res.status(204).end();
}

export function me(req: Request, res: Response): void {
  if (!req.user) {
    throw new AppError("UNAUTHORIZED", 401, "Authentication required");
  }
  res.status(200).json({ data: req.user });
}

/** Staff login — issues the admin cookie, never the customer one. */
export async function adminLogin(req: Request, res: Response): Promise<void> {
  const body = req.body as LoginBody;
  const user = await authService.verifyAdminCredentials(body);
  if (!user) {
    throw new AppError("UNAUTHORIZED", 401, "Invalid email or password");
  }
  const sessionId = await startSession(req, res, user.id, "admin");
  res.cookie(ADMIN_SESSION_COOKIE_NAME, sessionId, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_TTL_MS,
  });
  res.status(200).json({ data: authService.toAuthUser(user) });
}

export async function adminLogout(req: Request, res: Response): Promise<void> {
  if (req.sessionId) {
    await authService.logout(req.sessionId);
  }
  res.clearCookie(ADMIN_SESSION_COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
  res.status(204).end();
}

export function adminMe(req: Request, res: Response): void {
  if (!req.user) {
    throw new AppError("UNAUTHORIZED", 401, "Authentication required");
  }
  res.status(200).json({ data: req.user });
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("UNAUTHORIZED", 401, "Authentication required");
  res.status(200).json({ data: req.user });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("UNAUTHORIZED", 401, "Authentication required");
  const body = req.body as UpdateProfileBody;
  const user = await authService.updateProfile(req.user.id, body);
  res.status(200).json({ data: user });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError("UNAUTHORIZED", 401, "Authentication required");
  const body = req.body as ChangePasswordBody;
  await authService.changePassword(req.user.id, body.currentPassword, body.newPassword, req.sessionId);
  res.status(204).end();
}

async function startCustomerSession(req: Request, res: Response, userId: string): Promise<void> {
  const sessionId = await startSession(req, res, userId, "customer");
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_TTL_MS,
  });
}

async function startSession(
  req: Request,
  _res: Response,
  userId: string,
  kind: SessionKind,
): Promise<string> {
  return authService.createSession({ id: userId }, kind, {
    ip: req.ip ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  });
}
