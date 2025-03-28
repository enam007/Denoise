import { YoutubeBlogState } from "../types";
import { YoutubeTranscript } from "youtube-transcript";

// Function to extract the video ID from a YouTube URL
function extractVideoId(videoUrl: string): string | null {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = videoUrl.match(regex);
  return match ? match[1] : null;
}

// Function to fetch YouTube transcript
async function extractTranscript(
  state: YoutubeBlogState
): Promise<YoutubeBlogState> {
  const videoUrl = state.video_url;

  if (!videoUrl) {
    console.error("Video URL is missing");
    return state;
  }

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      console.error("Incorrect URL format");
      return state;
    }

    // Fetch transcript using youtube-transcript library
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error("No transcript found for this video");
    }

    // Convert transcript array into a single string
    const transcriptText = transcriptData.map((entry) => entry.text).join("\n");

    return {
      ...state,
      transcript: transcriptText,
      last_node: "extractTranscript",
    };
  } catch (error) {
    console.error("Error Extracting Transcript:", error);
    return state;
  }
}

export { extractTranscript };
