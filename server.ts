import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_STOCKS, INITIAL_PAIRS } from './src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK on server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/stocks', (req, res) => {
  res.json({ stocks: INITIAL_STOCKS });
});

app.get('/api/pairs', (req, res) => {
  res.json({ pairs: INITIAL_PAIRS });
});

// AI Deep Stock Story & Signal Handler
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { symbol, name, sector, price, peRatio, fwdPeRatio, priceToBook, rsi, low52w, high52w } = req.body;
    
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response if key is missing or not provided
      return res.json({
        analysis: `Fundamental Analysis for ${symbol} (${name}):\n` +
          `• Valuation: Trading at $${price} between 52-week low ($${low52w}) and high ($${high52w}). Trailing P/E of ${peRatio}x vs Forward P/E of ${fwdPeRatio}x.\n` +
          `• Technical Momentum: RSI at ${rsi}. Price/Book ratio sits at ${priceToBook}x.\n` +
          `• Strategy: Monitor sector earnings and pair hedge ratios for volatility control.`
      });
    }

    const prompt = `You are a top Wall Street quant analyst and fundamental equity strategist.
Provide a concise, data-driven equity narrative and signal analysis for:
Stock: ${symbol} (${name})
Sector: ${sector}
Current Price: $${price} (52-Week Range: $${low52w} - $${high52w})
Ratios:
- Trailing P/E: ${peRatio}x
- Forward P/E: ${fwdPeRatio}x
- Price / Book: ${priceToBook}x
- RSI (14-day): ${rsi}

In 3 concise paragraphs or bullet points:
1. Explain the ratio story (P/E vs Forward P/E, P/B) and what it implies for earnings growth.
2. Provide explicit guidance on whether to BUY, HOLD, or SELL, along with exact "WHEN TO SELL" trigger conditions (e.g. RSI overbought levels, target price, or fundamental breakdown).
3. Offer a pair hedging or sector correlation note. Keep it punchy, quantitative, and professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ analysis: response.text || 'Analysis generated successfully.' });
  } catch (error: any) {
    console.error('Error generating stock analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI analysis' });
  }
});

// AI Portfolio Rebalancing Suggestions
app.post('/api/ai/rebalance', async (req, res) => {
  try {
    const { portfolioHoldings, totalValue, cashBalance } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        rebalanceAdvice: `Portfolio Rebalancing Overview:\n` +
          `• Total Portfolio Equity: $${totalValue?.toLocaleString() || 0} with $${cashBalance?.toLocaleString() || 0} cash.\n` +
          `• Suggestion: Keep high-beta tech sectors (AI, Quantum, Chips) balanced with defensive energy or pair-hedged assets to minimize drawdowns.`
      });
    }

    const prompt = `You are an institutional risk manager and portfolio manager.
Analyze the following user portfolio holdings across AI, Database, Energy, Quantum, and Chips sectors:
Total Value: $${totalValue}
Cash: $${cashBalance}
Holdings: ${JSON.stringify(portfolioHoldings)}

Provide 3 actionable rebalancing recommendations:
1. Sector Weighting Assessment (identify over-concentrated or under-allocated sectors).
2. Risk & Volatility Mitigation (suggest specific pair hedges or trailing stops).
3. Specific Rebalancing Transactions (which stocks to trim or buy to optimize risk-adjusted returns).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ rebalanceAdvice: response.text || 'Rebalance advice generated.' });
  } catch (error: any) {
    console.error('Error generating rebalance advice:', error);
    res.status(500).json({ error: error.message || 'Failed to generate rebalance advice' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TradePulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
