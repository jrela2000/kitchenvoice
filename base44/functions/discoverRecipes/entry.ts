import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const query = String(body?.query || '').trim();
    if (!query) return Response.json({ error: 'query required' }, { status: 400 });

    const prompt =
      'You are a culinary assistant for a voice-first cooking app. Find 3 distinct, reliable recipes related to "' +
      query +
      '". For each recipe return: a short title, a one-sentence description, cook_time_minutes (integer), difficulty (easy|medium|hard), servings (integer), ingredients (array of strings each with quantity, e.g. "2 cups flour"), steps (array of clear single-action cooking instructions, each under 18 words, spoken-friendly), and tags (up to 4). Keep steps concrete and hands-free friendly.';

    const schema = {
      type: 'object',
      properties: {
        recipes: {
          type: 'array',
          items: {
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
          }
        }
      },
      required: ['recipes']
    };

    const result: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: schema,
      model: 'gemini_3_flash'
    });

    return Response.json({ recipes: Array.isArray(result.recipes) ? result.recipes : [] });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}