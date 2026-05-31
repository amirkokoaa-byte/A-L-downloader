import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import youtubedl from "youtube-dl-exec";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running smoothly" });
  });

  // Verify and fetch media info using yt-dlp
  app.post("/api/download/prepare", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "الرابط مطلوب" });
      }

      // We will attempt to use yt-dlp to dump info
      try {
        const output = await youtubedl(url, {
          dumpSingleJson: true,
          noWarnings: true,
          noCallHome: true,
          noCheckCertificate: true,
          preferFreeFormats: true,
          youtubeSkipDashManifest: true,
        });

        // Filter and map formats
        const formats = [];
        
        if (output.formats) {
            output.formats.forEach((f: any) => {
                if (f.vcodec !== 'none' || f.acodec !== 'none') {
                    formats.push({
                        formatId: f.format_id,
                        label: `${f.ext.toUpperCase()} - ${f.resolution || (f.vcodec === 'none' ? 'Audio' : 'Video')}`,
                        type: f.vcodec === 'none' ? 'audio' : 'video'
                    });
                }
            });
        }
        
        // Add default options if empty
        if (formats.length === 0) {
            formats.push({ formatId: "bestvideo+bestaudio", label: "أفضل جودة ممكنة", type: "video" });
            formats.push({ formatId: "bestaudio", label: "صوت فقط MP3", type: "audio" });
        }

        const previewData = {
          title: output.title || `فيديو من ${new URL(url).hostname}`,
          thumbnail: output.thumbnail || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
          formats: formats.slice(-5).reverse(), // Take a few top formats
          estimatedSizeMB: output.filesize ? (output.filesize / (1024 * 1024)) : 15,
          source: url
        };

        return res.json(previewData);
      } catch (ytdlError) {
        console.error("YTDL Error:", ytdlError);
        // If it's a private video or geo-blocked, yt-dlp might throw
        return res.status(403).json({ error: "لا يمكن الوصول للفيديو! تأكد من أن الحساب ليس خاصاً (Private)، أو أن الرابط صحيح." });
      }

    } catch (err) {
      console.error("Server Error:", err);
      res.status(500).json({ error: "حدث خطأ في الخادم أثناء معالجة الرابط." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
