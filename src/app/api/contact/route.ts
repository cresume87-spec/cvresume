import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
// ИЗМЕНЕНО: Используем именованный импорт { ContactEmail } вместо дефолтного.
import { ContactEmail } from "@/components/emails/ContactEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z.string().email("Invalid email address."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ==========================================================
    // == ДОБАВЬТЕ ЭТУ СТРОКУ ДЛЯ ОТЛАДКИ ==
    console.log("Received data on server:", body);
    // ==========================================================
    const validation = contactFormSchema.safeParse(body);

    if (!validation.success) {
      console.error("Zod validation failed:", validation.error.errors);
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { name, email, message } = validation.data;

    const { data, error } = await resend.emails.send({
      from: "Invoicerly Contact Form <info@invoicerly.co.uk>", // Замените на ваш верифицированный домен
      to: ["info@invoicerly.co.uk"], // Укажите здесь ваш email
      subject: `New message from ${name}`,
      replyTo: email,
      // Теперь этот компонент будет найден и отрендерен корректно
      react: ContactEmail({ name, email, message }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message." },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
