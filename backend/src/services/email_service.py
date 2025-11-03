"""
Servicio para envío de emails
"""
import os
from typing import Optional
from aws_lambda_powertools import Logger

from src.core.config import settings

logger = Logger(service="email-service")


class EmailService:
    """
    Servicio para envío de emails.
    - En desarrollo: solo logea los emails (no envía realmente)
    - En producción: usa AWS SES para enviar emails reales
    """

    @staticmethod
    def _get_reset_password_html(reset_link: str, user_name: Optional[str] = None) -> str:
        """
        Genera el HTML del email de recuperación de contraseña.
        
        Args:
            reset_link: URL completa para resetear la contraseña
            user_name: Nombre del usuario (opcional)
            
        Returns:
            String con HTML del email
        """
        greeting = f"Hola {user_name}," if user_name else "Hola,"
        
        return f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                Recuperación de Contraseña
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                {greeting}
                            </p>
                            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                                Recibimos una solicitud para restablecer la contraseña de tu cuenta en 
                                <strong>Registro de Participantes</strong>.
                            </p>
                            <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                                Haz clic en el siguiente botón para crear una nueva contraseña:
                            </p>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{reset_link}" 
                                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                            Restablecer Contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                O copia y pega este enlace en tu navegador:
                            </p>
                            <p style="color: #667eea; font-size: 13px; line-height: 1.6; margin: 10px 0 0 0; word-break: break-all;">
                                {reset_link}
                            </p>
                            
                            <!-- Warning -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                                            <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong>.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0;">
                                Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de manera segura.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; font-size: 13px; line-height: 1.6; margin: 0;">
                                © 2025 Registro de Participantes. Todos los derechos reservados.
                            </p>
                            <p style="color: #adb5bd; font-size: 12px; line-height: 1.6; margin: 10px 0 0 0;">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    @staticmethod
    async def send_password_reset_email(
        to_email: str,
        reset_token: str,
        user_name: Optional[str] = None
    ) -> bool:
        """
        Envía email de recuperación de contraseña usando Gmail SMTP.
        
        Args:
            to_email: Email del destinatario
            reset_token: Token UUID para el reset
            user_name: Nombre del usuario (opcional)
            
        Returns:
            True si se envió exitosamente, False si hubo error
        """
        # Construir el link de reset
        frontend_url = settings.FRONTEND_URL or "http://localhost:3000"
        reset_link = f"{frontend_url}/reset-password/{reset_token}"
        
        # En desarrollo, si no hay credenciales de Gmail, solo logeamos
        if settings.ENVIRONMENT == "development" and (not settings.GMAIL_USER or not settings.GMAIL_APP_PASSWORD):
            logger.info(
                "📧 [DEV MODE] Email de recuperación de contraseña (simulado - no se envía)",
                extra={
                    "to": to_email,
                    "user_name": user_name,
                    "reset_link": reset_link,
                    "token": reset_token,
                }
            )
            print("\n" + "="*80)
            print("📧 EMAIL DE RECUPERACIÓN DE CONTRASEÑA (MODO DESARROLLO - SIMULADO)")
            print("="*80)
            print(f"Para: {to_email}")
            if user_name:
                print(f"Usuario: {user_name}")
            print(f"Token: {reset_token}")
            print(f"Link de reset: {reset_link}")
            print("="*80)
            print("💡 TIP: Configura GMAIL_USER y GMAIL_APP_PASSWORD para enviar emails reales")
            print("="*80 + "\n")
            return True
        
        # Enviar email real usando Gmail SMTP
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            # Crear mensaje
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Recuperación de Contraseña - Registro de Participantes'
            msg['From'] = settings.GMAIL_USER
            msg['To'] = to_email
            
            # Texto plano como fallback
            text_body = f"""
Recuperación de Contraseña

Hola{' ' + user_name if user_name else ''},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Registro de Participantes.

Haz clic en el siguiente enlace para crear una nueva contraseña:
{reset_link}

⚠️ Importante: Este enlace expirará en 1 hora.

Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de manera segura.

© 2025 Registro de Participantes
"""
            
            # HTML body (profesional)
            html_body = EmailService._get_reset_password_html(reset_link, user_name)
            
            # Adjuntar ambas versiones
            part1 = MIMEText(text_body, 'plain', 'utf-8')
            part2 = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(part1)
            msg.attach(part2)
            
            # Conectar y enviar
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()  # Secure the connection
            server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
            
            server.sendmail(settings.GMAIL_USER, to_email, msg.as_string())
            server.quit()
            
            logger.info(
                "📧 Email de recuperación enviado exitosamente via Gmail SMTP",
                extra={
                    "to": to_email,
                    "from": settings.GMAIL_USER,
                    "user_name": user_name
                }
            )
            return True
            
        except Exception as e:
            logger.error(
                "❌ Error al enviar email de recuperación via Gmail SMTP",
                extra={
                    "to": to_email,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
            )
            # En desarrollo, mostramos el error pero seguimos
            if settings.ENVIRONMENT == "development":
                print(f"\n⚠️ ERROR al enviar email: {str(e)}")
                print(f"🔍 Verifica tus credenciales de Gmail en .env\n")
            return False
