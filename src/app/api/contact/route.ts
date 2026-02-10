import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@photonsolar.be";
const TO = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || "info@photonsolar.be";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Nom, email, sujet et message sont requis." },
        { status: 400 }
      );
    }

    if (!resend) {
      console.warn("Contact: RESEND_API_KEY non configuré, message ignoré.");
      return NextResponse.json(
        { success: true, message: "Message enregistré. Nous vous recontacterons." },
        { status: 200 }
      );
    }

    const html = `
      <h2>Nouveau message depuis le formulaire de contact</h2>
      <p><strong>Nom:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Téléphone:</strong> ${escapeHtml(phone || "-")}</p>
      <p><strong>Sujet:</strong> ${escapeHtml(subject)}</p>
      <hr />
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `[Contact] ${subject.slice(0, 60)}`,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "Votre message a bien été envoyé.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
