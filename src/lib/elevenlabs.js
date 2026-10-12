const ELEVENLABS_VOICE_ID = 'DODLEQrClDo8wCz460ld';
const ELEVENLABS_API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;

let activeAudio = null;

export async function speakWithElevenLabs(text) {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!text?.trim()) return false;
  if (!apiKey) {
    throw new Error('VITE_ELEVENLABS_API_KEY is not configured');
  }

  const response = await fetch(ELEVENLABS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    let message = `ElevenLabs request failed with status ${response.status}`;
    try {
      const errorData = JSON.parse(details);
      message = errorData.detail?.message || errorData.detail?.status || message;
    } catch {
      // Keep the status message when ElevenLabs does not return JSON.
    }
    throw new Error(message);
  }

  const audioUrl = URL.createObjectURL(await response.blob());
  if (activeAudio) {
    activeAudio.pause();
    URL.revokeObjectURL(activeAudio.src);
  }

  activeAudio = new Audio(audioUrl);
  activeAudio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl);
    activeAudio = null;
  }, { once: true });
  await activeAudio.play();
  return true;
}