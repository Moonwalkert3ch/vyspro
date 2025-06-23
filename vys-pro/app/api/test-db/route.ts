import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 1,
    });

    return Response.json({ message: "Connected successfully", users });
  } catch (error) {
    console.error("Database connection failed:", error);
    return new Response("Failed to connect to DB", { status: 500 });
  }
}
