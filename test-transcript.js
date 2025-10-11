// Test script to debug YouTube transcript issues
// Run with: node test-transcript.js

const { YoutubeTranscript } = require('youtube-transcript');

async function testTranscript() {
  // Test with a known video that has transcripts
  const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (has transcripts)
  
  console.log('Testing YouTube transcript extraction...');
  console.log('Video ID:', testVideoId);
  
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(testVideoId, {
      lang: 'en'
    });
    
    console.log('Transcript length:', transcript?.length || 0);
    console.log('First few items:', transcript?.slice(0, 3));
    
    if (transcript && transcript.length > 0) {
      const scriptText = transcript.map((item) => item.text).join(" ");
      console.log('Script text length:', scriptText.length);
      console.log('Script preview:', scriptText.slice(0, 200));
      console.log('✅ SUCCESS: Transcript extracted successfully');
    } else {
      console.log('❌ FAILED: No transcript data received');
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testTranscript();
