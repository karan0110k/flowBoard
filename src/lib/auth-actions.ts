"use server";

import { createSession, deleteSession } from "./auth";
import prisma from "./db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Please provide email and password" };

  // Attempt default demo user matching as requested by user
  if (email === "demo@example.com" && password === "demo") {
    let demoUser = await prisma.user.findUnique({ where: { email } });
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      demoUser = await prisma.user.create({
        data: { name: "Demo User", email, password: hashedPassword },
      });
      // Add welcome notification for new demo user
      const { createNotification } = await import("./actions");
      await createNotification(demoUser.id, `Welcome ${demoUser.name} to FlowBoard! 🚀`, "/dashboard");
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return { error: "Invalid credentials" };

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { error: "Invalid credentials" };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Please fill all fields" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already exists" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // Add welcome notification
  const { createNotification } = await import("./actions");
  await createNotification(user.id, `Welcome ${name} to FlowBoard! 🚀`, "/dashboard");

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
