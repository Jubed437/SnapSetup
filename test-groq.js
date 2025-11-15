// Quick test script for Groq API
require('dotenv').config();
const apiKey = process.env.VITE_GROQ_API_KEY;
const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

if (!apiKey) {
  console.error('❌ ERROR: VITE_GROQ_API_KEY not found in .env file');
  process.exit(1);
}

async function testGroqAPI() {
  console.log('🧪 Testing Groq API connection...\n');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hello! Groq API is working!" in one sentence.' }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error details:', JSON.stringify(errorData, null, 2));
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message.content;

    console.log('✅ SUCCESS!\n');
    console.log('Response:', message);
    console.log('\n✅ Groq API is working correctly!');
    console.log('✅ Your SnapSetup AI agent is ready to use!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n⚠️  Troubleshooting:');
    console.log('1. Check your API key is correct');
    console.log('2. Verify internet connection');
    console.log('3. Check Groq API status: https://status.groq.com');
  }
}

testGroqAPI();
