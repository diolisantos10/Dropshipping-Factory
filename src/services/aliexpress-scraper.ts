import axios from "axios";
import * as cheerio from "cheerio";

export interface AliExpressRawData {
  title: string;
  description: string;
  price: string | null;
  originalPrice: string | null;
  images: string[];
  attributes: Record<string, string>;
  url: string;
  productId: string | null;
}

function extractProductId(url: string): string | null {
  // Matches /item/1234567890.html or _1234567890.html or productId=1234567890
  const patterns = [
    /\/item\/(\d+)\.html/,
    /_(\d+)\.html/,
    /productId=(\d+)/,
    /\/(\d{10,})\.html/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function cleanImageUrl(url: string): string {
  // Remove size suffixes like _220x220.jpg to get full-size images
  return url
    .replace(/_\d+x\d+\.(jpg|jpeg|png|webp)/i, ".$1")
    .replace(/^\/\//, "https://")
    .split("_")[0]
    .endsWith(".jpg") || url.includes("alicdn.com")
    ? url.replace(/_\d+x\d+/, "")
    : url;
}

export async function scrapeAliExpressProduct(url: string): Promise<AliExpressRawData> {
  const productId = extractProductId(url);

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    Referer: "https://www.aliexpress.com/",
  };

  let html: string;
  try {
    const response = await axios.get(url, {
      headers,
      timeout: 15000,
      maxRedirects: 5,
    });
    html = response.data as string;
  } catch (error) {
    throw new Error(`Failed to fetch AliExpress page: ${error instanceof Error ? error.message : String(error)}`);
  }

  const $ = cheerio.load(html);

  // Extract title
  let title =
    $("h1.product-title-text").text().trim() ||
    $("h1[class*='title']").first().text().trim() ||
    $("meta[property='og:title']").attr("content") ||
    "";

  // Extract images from multiple possible locations
  const images: string[] = [];
  const imageSet = new Set<string>();

  // From JSON data embedded in page
  const scriptContent = $("script").toArray().map((s) => $(s).html() || "").join("\n");

  // Try to extract from window.runParams or __GLOBAL_DATA__
  const imageMatches = Array.from(scriptContent.matchAll(/"imagePathList":\s*\[([^\]]+)\]/g));
  for (const match of imageMatches) {
    const urls = match[1].match(/"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi);
    if (urls) {
      urls.forEach((u) => {
        const clean = u.replace(/"/g, "");
        if (!imageSet.has(clean)) {
          imageSet.add(clean);
          images.push(clean);
        }
      });
    }
  }

  // Fallback: collect from img tags
  if (images.length === 0) {
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || "";
      if (src.includes("alicdn.com") && !imageSet.has(src)) {
        const cleaned = cleanImageUrl(src);
        imageSet.add(cleaned);
        images.push(cleaned);
      }
    });
  }

  // OG image as fallback
  const ogImage = $("meta[property='og:image']").attr("content");
  if (ogImage && !imageSet.has(ogImage)) {
    imageSet.add(ogImage);
    images.push(ogImage);
  }

  // Extract price
  let price: string | null = null;
  let originalPrice: string | null = null;

  const priceText =
    $("[class*='price-current']").first().text().trim() ||
    $("[class*='product-price']").first().text().trim() ||
    $("meta[itemprop='price']").attr("content") ||
    null;

  if (priceText) price = priceText;

  const originalPriceText =
    $("[class*='price-original']").first().text().trim() ||
    $("[class*='price-del']").first().text().trim() ||
    null;
  if (originalPriceText) originalPrice = originalPriceText;

  // Extract description
  const description =
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='description']").attr("content") ||
    $("[class*='product-description']").first().text().trim() ||
    "";

  // Extract attributes/specs
  const attributes: Record<string, string> = {};
  $("[class*='specification'] tr, [class*='product-prop'] li").each((_, el) => {
    const cells = $(el).find("td, span");
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim();
      const value = $(cells[1]).text().trim();
      if (key && value) attributes[key] = value;
    }
  });

  return {
    title,
    description,
    price,
    originalPrice,
    images: images.slice(0, 20), // cap at 20 images
    attributes,
    url,
    productId,
  };
}
