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
    const { partySize = 4, budget = 4500, craving = 'cheesy and spicy', spiceLevel = 'medium', language = 'roman' } = req.body;

    const langInstruction =
      language === 'ur'
        ? "CRITICAL: Write feastTitle, greeting, reason fields, chefTip, and ambienceSuggestion entirely in fluent, elegant Urdu script (اردو)."
        : language === 'roman'
        ? "CRITICAL: Write feastTitle, greeting, reason fields, chefTip, and ambienceSuggestion in natural, mouth-watering Roman Urdu (e.g. 'Assalam-o-Alaikum! Hayatabad ke doston ke liye...')."
        : "Write in English with warm Pakistani hospitality.";

    const systemPrompt = `You are Faisal Khan Marwat, the proud founder and executive culinary master behind Bunny Bites in Hayatabad, Peshawar, Pakistan.
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
Language Preference: ${language}

${langInstruction}

Respond ONLY in valid JSON with this exact schema:
{
  "feastTitle": "A catchy luxury title",
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
  "chefTip": "An insider culinary tip from Faisal Khan",
  "ambienceSuggestion": "Recommended seating area: Velvet Cloud Booth, Santorini Arches, or Bunny Garden Terrace"
}`;

    if (ai) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Please recommend the perfect feast for ${partySize} guests with a budget of Rs. ${budget}. Cravings: ${craving}. Spice: ${spiceLevel}. Language: ${language}`,
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

    let feastTitle = `Chef Faisal's ${partySize > 4 ? 'Royal Family' : 'Signature'} Gathering Feast`;
    let greeting = `Assalam-o-Alaikum! Greetings from Hayatabad, Peshawar. For your gathering of ${partySize}, I have assembled our stone-baked crown and Khyber-crunch favorites.`;
    let chefTip = 'Pull the cheese crown bumps right as the cloche lifts—the cheese pull reaches over 12 inches when freshly baked!';
    let ambienceSuggestion = partySize > 4 ? 'Velvet Cloud Booth T1 (6-Seater)' : 'Santorini Arches Table T8 (4-Seater)';

    if (language === 'ur') {
      feastTitle = `شیف فیصل خان کی ${partySize > 4 ? 'شاہی فیملی' : 'اسپیشل'} پشاور دعوت`;
      greeting = `السلام علیکم! حیات آباد پشاور سے محبت بھرا سلام۔ آپ کے ${partySize} افراد کی محفل کے لیے ہم نے گرم پتھر کے اوون کا کراؤن کرسٹ اور خیبر کرسپی چکن تیار کیا ہے۔`;
      chefTip = 'جیسے ہی پیزا میز پر آئے کراؤن بمپ کو فوری الگ کریں، تازہ بیکنگ کے وقت چیز پل 12 انچ تک کھنچتی ہے!';
      ambienceSuggestion = partySize > 4 ? 'ویلویٹ کلاؤڈ بوتھ T1 (6 نشستیں)' : 'سانتورینی آرچز ٹیبل T8 (4 نشستیں)';
    } else if (language === 'roman') {
      feastTitle = `Chef Faisal Khan Ki ${partySize > 4 ? 'Shahi Family' : 'Special'} Dawat Deal`;
      greeting = `Assalam-o-Alaikum! Hayatabad Peshawar se dher sara pyar. Aapke ${partySize} doston/family ke liye hamne fresh stone-baked Crown Crust aur Khyber crunch chicken assemble kiya hai.`;
      chefTip = 'Crown crust bump ko garam garam alag karein, cheese pull 12 inch tak khinchti hai garlic herb dip ke sath!';
      ambienceSuggestion = partySize > 4 ? 'Velvet Cloud Booth T1 (6-Seater)' : 'Santorini Arches Table T8 (4-Seater)';
    }

    return res.json({
      feastTitle,
      greeting,
      recommendedItems: [
        {
          name: 'Signature Bunny Crown Crust',
          size: pizzaSize,
          price: pizzaPrice,
          reason: language === 'ur'
            ? '18 ہاتھ سے بنے ہوئے موزریلا چیز بمپس اور تندوری چکن'
            : language === 'roman'
            ? '18 hand-crimped mozzarella cheese crown bumps aur smoky chicken'
            : '18 hand-crimped mozzarella crown bumps with smoked chicken and fresh bell peppers.',
        },
        {
          name: 'Crispy Fried Chicken',
          size: chickenSize,
          price: chickenPrice,
          reason: language === 'ur'
            ? '24 گھنٹے بٹر ملک میں تیار شدہ 14 روایتی خیبر مصالحہ جات کا خستہ پن'
            : language === 'roman'
            ? '24-hour buttermilk brine aur 14 secret Khyber spices ka zabardast crunch'
            : 'Fresh 24-hour buttermilk brine with 14 secret spices from the Khyber Pass.',
        },
        {
          name: 'Glazed Wings & Dips',
          size: '6 Pcs Peri-Peri',
          price: 550,
          reason: language === 'ur'
            ? 'میٹھی اور تیز پیری پیری گلیز جو چیز کے ساتھ لاجواب لگتی ہے'
            : language === 'roman'
            ? 'Chatpati peri-peri glaze jo cheese crust ke sath balance banati hai'
            : 'Sweet tangy glaze that cuts through rich stone-oven cheese.',
        },
        {
          name: 'Santorini Blue Lagoon',
          size: `${partySize} Glasses`,
          price: drinksPrice,
          reason: language === 'ur'
            ? 'تازہ پودینہ اور لیموں کا ٹھنڈا شربت جو بھاری کھانے کے بعد فرحت بخشتا ہے'
            : language === 'roman'
            ? 'Thandi curacao aur mint fizz jo khaney ke baad taazgi bakhshti hai'
            : 'Cooling curaçao and mint fizz to balance warm spices.',
        },
      ],
      totalEstimatedPrice: pizzaPrice + chickenPrice + 550 + drinksPrice,
      chefTip,
      ambienceSuggestion,
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

    const systemPrompt = `You are Faisal Khan Marwat, founder and executive culinary master behind Bunny Bites in Hayatabad, Phase 1, Peshawar, Pakistan.
You speak with genuine Pakistani warmth, hospitality, and culinary passion.

MULTILINGUAL CAPABILITIES FOR PAKISTAN:
You are completely fluent in three modes of communication used across Pakistan:
1. Urdu (اردو): When the user writes or speaks in Urdu script (e.g., "کراؤن کرسٹ کی خصوصیات کیا ہیں؟"), reply in elegant, mouth-watering, polite Pakistani Urdu (آپ، تشریف لائیے، جزاک اللہ / شکریہ).
2. Roman Urdu: When the user writes or speaks in Roman Urdu (e.g., "Crown crust kaisa hai?", "Hayatabad mein delivery kab tak milti hai?", "Bachon ke liye konsa pizza best hai?"), reply in natural, friendly, appetizing Roman Urdu ("Assalam-o-Alaikum! Hamara Crown Crust pizza bohot zabardast hai, 18 mozzarella cheese bumps ke sath...").
3. English: When the user asks in English, reply in warm Pakistani-English.

CRITICAL RULE:
Always detect the user's language automatically and reply in that EXACT same language (Urdu script, Roman Urdu, or English). Never force English onto an Urdu question.

BUNNY BITES CULINARY SIGNATURES:
- 24-hour cold-fermented dough with 68% hydration for ultra-crisp, light digestibility.
- 18 hand-crimped mozzarella and garlic-herb cream cheese crown bumps.
- 450°C stone-deck volcanic oven blistering for 3 minutes to produce authentic leopard crust bubbles and a 12-inch cheese pull.
- 14-spice buttermilk fried chicken and glazed wings (Honey chipotle, peri-peri, BBQ).
- Santorini-meets-bunny interior in Phase 1, Hayatabad, open daily until 3:00 AM late night.

Keep answers concise (2 to 4 sentences), warm, appetizing, and always ending with an invitation to taste or order.`;

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

    // Deterministic intelligent fallback based on Urdu/Roman Urdu/English
    const isUrduScript = /[\u0600-\u06FF]/.test(question);
    const q = question.toLowerCase();
    const isRomanUrdu = q.includes('kya') || q.includes('kaisa') || q.includes('kaise') || q.includes('bhai') || q.includes('chahiye') || q.includes('batao') || q.includes('kitna') || q.includes('hai') || q.includes('mein') || q.includes('bhejo') || q.includes('shukriya');

    let answer = "Assalam-o-Alaikum! At Bunny Bites in Hayatabad, we craft everything from scratch with pure mozzarella and 450°C stone ovens. Come by Phase 1 or order hot delivery tonight!";

    if (isUrduScript) {
      if (question.includes('کراؤن') || question.includes('پیزا') || question.includes('پنیر')) {
        answer = "السلام علیکم! ہمارے کراؤن کرسٹ پیزا میں 18 ہاتھ سے بنے ہوئے چیز بمپس ہوتے ہیں جو خالص موزریلا اور گارلک کریم چیز سے بھرے ہیں۔ ہم اسے 450 ڈگری پتھر کے اوون میں بیک کرتے ہیں جس سے زبردست چیز پل بنتی ہے۔ آپ کو ہر لقمہ پسند آئے گا!";
      } else if (question.includes('ڈو') || question.includes('آٹا') || question.includes('خمیر')) {
        answer = "ہماری ڈو 24 گھنٹے ٹھنڈی فریمینٹیشن سے گزرتی ہے جس میں 68 فیصد ہائیڈریشن رکھی جاتی ہے۔ یہ پیزا باہر سے انتہائی خستہ اور اندر سے روئی کی طرح نرم اور ہضم کرنے میں ہلکا رہتا ہے۔";
      } else if (question.includes('وقت') || question.includes('ٹائم') || question.includes('کھلا') || question.includes('حیات آباد')) {
        answer = "ہم روزانہ دوپہر 12:00 بجے سے لے کر رات کے 3:00 بجے تک حیات آباد فیز 1 میں کھلے رہتے ہیں۔ آپ گرم ڈلیوری گھر منگوا سکتے ہیں یا ہماری خوبصورت سانتورینی ہال میں تشریف لا سکتے ہیں۔";
      } else {
        answer = "السلام علیکم! بنی بائٹس حیات آباد میں خوش آمدید۔ ہم خالص موزریلا، 18 کراؤن پاکٹس اور خیبر اسپائسز کے ساتھ بہترین پیزا پیش کرتے ہیں۔ آپ آج کیا چکھنا پسند فرمائیں گے؟";
      }
    } else if (isRomanUrdu) {
      if (q.includes('crown') || q.includes('crust') || q.includes('pizza') || q.includes('cheese')) {
        answer = "Assalam-o-Alaikum! Hamare Crown Crust pizza mein 18 hand-pinched cheese bumps hain jo Danish mozzarella aur garlic-herb cream cheese se bhare hue hain. 450°C stone oven mein bake hone ke baad iska cheese pull kamaal hota hai!";
      } else if (q.includes('dough') || q.includes('aata') || q.includes('recipe')) {
        answer = "Hamara dough 24 ghante slow cold-ferment hota hai 68% hydration par. Is se crust bahar se crispy aur andar se airy feather-light banta hai jo pait par bilkul bhari nahi lagta.";
      } else if (q.includes('delivery') || q.includes('time') || q.includes('kab') || q.includes('hours')) {
        answer = "Bunny Bites rozana dopahar 12:00 PM se raat 03:00 AM tak khula rehta hai! Hayatabad ke tamam phases aur University Town mein Rs. 1500 se zyada ke order par delivery bilkul FREE hai.";
      } else {
        answer = "Assalam-o-Alaikum! Bunny Bites Peshawar mein khushamdeed. Hamara signature Crown Crust pizza aur crispy fried chicken Phase 1 Hayatabad mein zaroor try karein!";
      }
    } else {
      if (q.includes('crown') || q.includes('crust') || q.includes('pizza')) {
        answer = "Every single Crown Crust pizza has 18 hand-pinched cheese bumps filled with rich mozzarella and cream cheese! We bake them at 450°C on stone decks until blistered golden, then brush them with our secret garlic-herb butter. You'll love every single bite!";
      } else if (q.includes('dough') || q.includes('ferment') || q.includes('recipe')) {
        answer = "Our dough is cold-fermented for a full 24 hours at 68% hydration. This slow fermentation creates incredible airy cornicione bubbles that are crispy on the outside, feather-light on the inside, and gentle on digestion.";
      } else if (q.includes('spicy') || q.includes('kids') || q.includes('family')) {
        answer = "We cater to both spicy food lovers and young kids! Our Crown Crust has balanced aromatic Khyber spices, and you can request mild, medium, or fire tandoori. Kids especially love our cheesy fries, mild chicken tenders, and photo booth with our 3D bunny mascot!";
      } else if (q.includes('reserve') || q.includes('table') || q.includes('hours')) {
        answer = "We are open daily from 12:00 PM until 3:00 AM late night! You can reserve your favorite Velvet Cloud Booth or Santorini Arch table right here through our live floor plan with zero wait time.";
      }
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
