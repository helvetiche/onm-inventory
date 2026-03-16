// Debug script - run this in browser console to test API
async function testAPI() {
  try {
    console.log('Testing /api/items...');
    const response = await fetch('/api/items?limit=8&page=1');
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Success! Data:', data);
    console.log('Items count:', data.items?.length);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testAPI();