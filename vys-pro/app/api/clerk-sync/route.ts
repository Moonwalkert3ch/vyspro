import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Try to find user in DB
    const existingUser = await prisma.user.findFirst({
      where: { clerk_id: userId },
    });

    if (existingUser) {
      return Response.json({ message: "User already exists in DB", user: existingUser });
    }

    // If not found, get Clerk user info from frontend
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
      },
    });

    const clerkUser = await clerkRes.json();

    const newUser = await prisma.user.create({
      data: {
        clerk_id: userId,
        email: clerkUser.email_addresses[0].email_address,
      },
    });

    return Response.json({ message: "User synced", user: newUser });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response("Error syncing user", { status: 500 });
  }
}
