import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      // ИЗМЕНЕНО: Возвращаем JSON с сообщением об ошибке
      return NextResponse.json(
        { message: "Missing email or password" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // ИЗМЕНЕНО: Возвращаем JSON с сообщением об ошибке
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: email.split("@")[0],
      },
    });

    // В случае успеха возвращаем созданного пользователя
    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    // ИЗМЕНЕНО: Возвращаем JSON с сообщением об ошибке
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
