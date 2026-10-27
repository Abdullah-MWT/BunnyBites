import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function withTimeout<T>(promise: Promise<T>, ms: number = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout')), ms)),
  ]);
}

// ==========================================
// 1. AI Feast Sommelier & Menu Recommendation
// ==========================================
app.post('/api/ai/recommend', async (req: Request, res: Response) => {
  try {
    const { partySize = 4, budget = 4500, craving = 'cheesy and spicy', spiceLevel = 'medium' } = req.body;

    const systemPrompt = `You are Faisal Khan, the proud founder and executive culinary master behind Bunny Bites in Hayatabad, Peshawar, Pakistan.
Bunny Bites is famous for:
1. Signature Crown Crust Pizza (Medium Rs. 1450, Large Rs. 1950, Monster 16" Rs. 2550) - 18 hand-pinched melted cheese bumps, tandoori chicken, capsicum, olives.
2. Crispy Fried Chicken (3 pcs Rs. 650, 6 pcs Rs. 1200, 9 pcs Family Bucket Rs. 1750) - 14-spice Khyber crunch.
3. Glazed Wings (6 pcs Rs. 550, 12 pcs Rs. 990) - Honey chipotle, peri-peri or smoked BBQ.
4. Cheesy Baked Alfredo Pasta (Rs. 890) - Stone-oven blistered penne with garlic cream.
5. Bunny Smash Burger (Single Rs. 650, Double Rs. 890) - Brioche bun, double beef or crispy chicken, secret sauce.
6. Santorini Shakes & Coolers (Rs. 350 - 450) - Blue lagoon, mint margarita, lotus biscoff shake.

The customer wants a customized feast recommendation.
Party Size: ${partySize} people
Budget: Rs. ${budget}
Craving: "${craving}"
Spice Preference: "${spiceLevel}"

Respond ONLY in valid JSON with this exact schema:
{
  "feastTitle": "A catchy luxury title (e.g., 'Faisal Khan's Grand Hayatabad Cheese Feast')",
  "greeting": "A warm, genuine 2-sentence Peshawar greeting from Faisal Khan welcoming the family",
  "recommendedItems": [
    {
      "name": "Item name from Bunny Bites menu",
      "size": "e.g., Large 14\" or 6 Pieces or Regular",
      "price": 1450,
      "reason": "Why this specifically fits their craving and party"
    }
  ],
  "totalEstimatedPrice": 4200,
  "chefTip": "An insider culinary tip from Faisal Khan (e.g. how to dip the crust bumps in garlic butter)",
  "ambienceSuggestion": "Recommended seating area: Velvet Cloud Booth, Santorini Arches, or Bunny Garden Terrace"
}`;

    if (ai) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Please recommend the perfect feast for ${partySize} guests with a budget of Rs. ${budget}. Cravings: ${craving}. Spice: ${spiceLevel}.`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.7,
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          }),
          25000
        );

        const responseText = response.text || '{}';
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (_err) {
        // Fallback gracefully without throwing warning logs
      }
    }

    // Deterministic intelligent fallback
    const isLarge = partySize >= 5;
      const pizzaPrice = isLarge ? 2550 : 1950;
      const pizzaSize = isLarge ? 'Monster Crown (16")' : 'Large (14")';
      const chickenPrice = isLarge ? 1750 : 1200;
      const chickenSize = isLarge ? '9 Pcs Family Bucket' : '6 Pcs Box';
      const drinksPrice = partySize * 350;

      return res.json({
        feastTitle: `Chef Faisal's ${partySize > 4 ? 'Royal Family' : 'Signature'} Gathering Feast`,
        greeting: `Assalam-o-Alaikum! Greetings from Hayatabad, Peshawar. For your gathering of ${partySize}, I have assembled our stone-baked crown and Khyber-crunch favorites.`,
        recommendedItems: [
          {
            name: 'Signature Bunny Crown Crust',
            size: pizzaSize,
            price: pizzaPrice,
            reason: '18 hand-crimped mozzarella crown bumps with smoked chicken and fresh bell peppers.',
          },
          {
            name: 'Crispy Fried Chicken',
            size: chickenSize,
            price: chickenPrice,
            reason: 'Fresh 24-hour buttermilk brine with 14 secret spices from the Khyber Pass.',
          },
          {
            name: 'Glazed Wings & Dips',
            size: '6 Pcs Peri-Peri',
            price: 550,
            reason: 'Sweet tangy glaze that cuts through rich stone-oven cheese.',
          },
          {
            name: 'Santorini Blue Lagoon',
            size: `${partySize} Glasses`,
            price: drinksPrice,
            reason: 'Cooling curaçao and mint fizz to balance warm spices.',
          },
        ],
        totalEstimatedPrice: pizzaPrice + chickenPrice + 550 + drinksPrice,
        chefTip: 'Pull the cheese crown bumps right as the cloche lifts—the cheese pull reaches over 12 inches when freshly baked!',
        ambienceSuggestion: partySize > 4 ? 'Velvet Cloud Booth T1 (6-Seater)' : 'Santorini Arches Table T8 (4-Seater)',
      });
  } catch (err: any) {
    console.error('AI Recommend Error:', err);
    return res.status(500).json({
      error: 'Failed to generate recommendation',
      message: err?.message || 'Server error',
    });
  }
});

// ==========================================
// 2. Ask Chef Faisal Khan (Interactive Culinary Q&A)
// ==========================================
app.post('/api/ai/ask-chef', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const systemPrompt = `You are Faisal Khan, owner and head chef of Bunny Bites in Hayatabad, Phase 1, Peshawar, Pakistan.
You speak with genuine Pakistani warmth, pride, and culinary passion. You love talking about:
- Your 24-hour cold-fermented dough with 68% hydration.
- The 18 hand-pinched cheese bumps on the Crown Crust pizza stuffed with imported mozzarella and cream cheese.
- The stone-deck volcanic oven baking at 450°C for 3 minutes to produce leopard blisters and melted pull.
- The 14-spice buttermilk brine for crispy chicken and the tandoori marinade.
- The Santorini-meets-bunny interior (periwinkle arches, gold ring LED chandeliers, cloud walls).
- Your family-friendly atmosphere where children and parents feel treated like royalty.

Keep answers concise (2 to 4 sentences), warm, authentic, and ending with an invitation to come taste or order.
Never break character. Never use robotic phrases.`;

    if (ai) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: question,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.8,
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          }),
          25000
        );

        return res.json({
          answer: response.text || 'Welcome to Bunny Bites! Our kitchen doors are always open for you in Hayatabad.',
        });
      } catch (_err) {
        // Fallback gracefully without throwing warning logs
      }
    }

    // Deterministic friendly fallback based on keywords
      const q = question.toLowerCase();
      let answer = "Assalam-o-Alaikum! At Bunny Bites in Hayatabad, we craft everything from scratch with pure mozzarella and 450°C stone ovens. Come by Phase 1 or order hot delivery tonight!";

      if (q.includes('crown') || q.includes('crust') || q.includes('pizza')) {
        answer = "Every single Crown Crust pizza has 18 hand-pinched cheese bumps filled with rich mozzarella and cream cheese! We bake them at 450°C on stone decks until blistered golden, then brush them with our secret garlic-herb butter. You'll love every single bite!";
      } else if (q.includes('dough') || q.includes('ferment') || q.includes('recipe')) {
        answer = "Our dough is cold-fermented for a full 24 hours at 68% hydration. This slow fermentation creates incredible airy cornicione bubbles that are crispy on the outside, feather-light on the inside, and gentle on digestion.";
      } else if (q.includes('spicy') || q.includes('kids') || q.includes('family')) {
        answer = "We cater to both spicy food lovers and young kids! Our Crown Crust has balanced aromatic Khyber spices, and you can request mild, medium, or fire tandoori. Kids especially love our cheesy fries, mild chicken tenders, and photo booth with our 3D bunny mascot!";
      } else if (q.includes('reserve') || q.includes('table') || q.includes('hours')) {
        answer = "We are open daily from 12:00 PM until 3:00 AM late night! You can reserve your favorite Velvet Cloud Booth or Santorini Arch table right here through our live floor plan with zero wait time.";
      }

      return res.json({ answer });
  } catch (err: any) {
    console.error('AI Chef Error:', err);
    return res.status(500).json({
      error: 'Failed to process question',
      message: err?.message || 'Server error',
    });
  }
});

// ==========================================
// 3. Vite Middlewares (Dev) or Static (Prod)
// ==========================================
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Bunny Bites server running on port ${PORT}`);
  });
}

startServer();
