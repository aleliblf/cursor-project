import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, getApiKeyByKey } from '@/lib/apiKeyOperations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    console.log('Validating API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'empty');

    if (!apiKey) {
      console.log('No API key provided');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    console.log('Checking if API key exists in database...');
    const isValid = await validateApiKey(apiKey);

    if (!isValid) {
      console.log('No matching API key found');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const apiKeyData = await getApiKeyByKey(apiKey);
    console.log('Valid API key found:', apiKeyData?.name);
    
    return NextResponse.json(
      { 
        message: 'Valid API key',
        name: apiKeyData?.name,
        createdAt: apiKeyData?.createdAt
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Validation error:', err);
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  try {
    const isValid = await validateApiKey(apiKey);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const apiKeyData = await getApiKeyByKey(apiKey);
    
    return NextResponse.json(
      { 
        message: 'Valid API key',
        name: apiKeyData?.name,
        createdAt: apiKeyData?.createdAt
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
}
