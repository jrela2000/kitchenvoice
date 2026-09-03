import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const narration = String(body?.narration || '').trim();
    if (!narration) return Response.json({ error: 'narration required' }, { status: 400 });

    const prompt =
      'You are a culinary assistant. A cook narrated their recipe out loud while cooking. Turn this narration into a clean, structured recipe. Infer a good title, a one-sentence description, cook_time_minutes (integer estimate), difficulty (easy|medium|hard), servings (integer), ingredients (array with quantities), and ordered steps (each a single clear action under 18 words, spoken-friendly). Fix grammar and fill gaps sensibly, but keep the cook\'s intent, technique and quantities. Narration:\n"""' +
      narration +
      '"""';

    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        cook_time_minutes: { type: 'number' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        servings: { type: 'number' },
        ingredients: { type: 'array', items: { type: 'string' } },
        steps: { type: 'array', items: { type: 'string' } },
        tags: { type: 'array', items: { type: 'string' } }
      },
      required: ['title', 'description', 'cook_time_minutes', 'difficulty', 'servings', 'ingredients', 'steps', 'tags']
    };

    const result: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json({ recipe: result });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}