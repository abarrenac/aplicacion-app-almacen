import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un arquitecto e interiorista experto en materiales de construcción con más de 20 años de experiencia. Trabajas para una empresa de materiales de construcción que vende desde cemento y morteros hasta griferías, platos de ducha, pavimentos, revestimientos, tuberías y todo tipo de materiales de obra.

Tu función es ayudar al equipo comercial y a los clientes a visualizar cómo quedarían los productos en distintos espacios. Cuando alguien te mencione una referencia de producto y un espacio, debes:

1. Describir con detalle técnico y estético cómo quedaría ese material instalado en el espacio indicado
2. Indicar combinaciones de materiales, colores y acabados que complementen el producto
3. Calcular la cantidad aproximada necesaria si el usuario proporciona medidas
4. Sugerir alternativas o productos complementarios del catálogo
5. Indicar consideraciones técnicas importantes para la instalación (pendientes para duchas, juntas de dilatación, etc.)

Si el usuario sube una foto o boceto, analízala en detalle y basa tu recomendación en lo que ves.

Responde siempre en español, de forma clara, profesional pero cercana. Usa párrafos cortos. Cuando menciones datos técnicos sé preciso.`;

export async function POST(req: NextRequest) {
  try {
    const { mensajes } = await req.json();

    const messages = mensajes.slice(1).map((m: any) => {
      if (m.imagen && m.role === 'user') {
        const base64 = m.imagen.split(',')[1];
        const mediaType = m.imagen.split(';')[0].split(':')[1];
        return {
          role: 'user' as const,
          content: [
            { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType, data: base64 } },
            { type: 'text' as const, text: m.content || 'Analiza esta imagen del espacio.' },
          ],
        };
      }
      return { role: m.role as 'user' | 'assistant', content: m.content };
    });

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const respuesta = response.content.find(b => b.type === 'text')?.text || '';
    return NextResponse.json({ respuesta });
  } catch (error: any) {
    console.error('Error AI:', error);
    return NextResponse.json({ respuesta: 'Error al conectar con el asistente. Verifica tu clave ANTHROPIC_API_KEY en .env.local.' }, { status: 500 });
  }
}
