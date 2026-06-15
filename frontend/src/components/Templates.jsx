import { useState } from "react";
import { useApp } from "../context/AppContext";

const TEMPLATES = [
  { id: "product-desc", name: "Product Description", category: "E-commerce", mode: "product", icon: "🛍️", description: "Compelling product copy for any marketplace", prompt: "Write a professional product description for: [product name]. Include features, benefits, and a clear CTA." },
  { id: "seo-page", name: "SEO Page Content", category: "SEO", mode: "seo", icon: "🔍", description: "Full SEO-optimized page content", prompt: "Create complete SEO content for a [page type] targeting the keyword: [keyword]." },
  { id: "meta-tags", name: "Meta Title & Description", category: "SEO", mode: "seo", icon: "🏷️", description: "Optimized meta title and description", prompt: "Write an SEO meta title (under 60 chars) and meta description (under 155 chars) for a page about: [topic]. Target keyword: [keyword]." },
  { id: "instagram-caption", name: "Instagram Caption", category: "Social Media", mode: "social", icon: "📸", description: "Scroll-stopping Instagram captions with hashtags", prompt: "Write an engaging Instagram caption for: [topic/product]. Include a strong hook, body, CTA, and 15 relevant hashtags." },
  { id: "facebook-post", name: "Facebook Post", category: "Social Media", mode: "social", icon: "📘", description: "Community-focused Facebook post", prompt: "Write a Facebook post for: [topic]. Make it conversational, add value, and include a clear CTA." },
  { id: "tiktok-script", name: "TikTok / Reel Script", category: "Social Media", mode: "social", icon: "🎬", description: "Video script with strong hook", prompt: "Write a TikTok/Reel script for: [topic]. Include a 3-second hook, engaging middle, and strong CTA at the end." },
  { id: "meta-ad", name: "Meta Ad Copy", category: "Advertising", mode: "ads", icon: "📣", description: "3 ad variations with headlines and CTAs", prompt: "Write 3 Meta ad variations for: [product/service]. Target audience: [audience]. Goal: [goal]." },
  { id: "email-reply", name: "Professional Email", category: "Email", mode: "email", icon: "📧", description: "Clear, professional business email", prompt: "Write a professional email for: [purpose]. Recipient: [who]. Key points to cover: [points]." },
  { id: "blog-outline", name: "Blog Outline", category: "Content", mode: "blog", icon: "📋", description: "Full blog structure with H2/H3 headings", prompt: "Create a detailed blog post outline for: [topic]. Target keyword: [keyword]. Include intro, 5-7 sections, and conclusion." },
  { id: "full-blog", name: "Full Blog Article", category: "Content", mode: "blog", icon: "✍️", description: "Complete SEO-optimized blog article", prompt: "Write a complete blog article about: [topic]. Target keyword: [keyword]. Word count: [length]. Include meta title and description." },
  { id: "client-proposal", name: "Client Proposal", category: "Business", mode: "business", icon: "📄", description: "Professional project proposal", prompt: "Write a professional client proposal for: [project]. Client: [client name]. Services: [services]. Timeline: [timeline]. Budget range: [budget]." },
  { id: "business-intro", name: "Business Introduction", category: "Business", mode: "business", icon: "🤝", description: "Compelling business intro for any channel", prompt: "Write a professional business introduction for: [business name]. Industry: [industry]. Key services: [services]. USP: [unique value]." },
  { id: "website-analysis", name: "Website Analysis Request", category: "SEO", mode: "seo", icon: "🌐", description: "Request a website content audit", prompt: "Analyze the website content strategy for: [website URL or description]. Provide SEO gaps, content opportunities, and recommendations." },
  { id: "code-debug", name: "Code Debugging", category: "Development", mode: "coding", icon: "🐛", description: "Debug code with explanation", prompt: "Debug the following code and explain what's wrong and how to fix it:\n\n[paste your code here]\n\nError: [error message]" },
  { id: "content-calendar", name: "Content Calendar", category: "Social Media", mode: "social", icon: "📅", description: "Monthly social media content plan", prompt: "Create a 30-day social media content calendar for [business]. Platforms: [platforms]. Posting frequency: [frequency]. Content pillars: [topics]." },
];

const CATEGORIES = ["All", "E-commerce", "SEO", "Social Media", "Advertising", "Email", "Content", "Business", "Development"];

export default function Templates() {
  const { sendMessage, setExpertMode, setCurrentView, setSidebarPanel } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = selectedCategory === "All" || t.category === selectedCategory;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const useTemplate = (template) => {
    setExpertMode(template.mode);
    setCurrentView("chat");
    setSidebarPanel("chats");
    sendMessage(template.prompt, "custom", "professional");
  };

  return (
    <div className="panel-view">
      <div className="panel-header">
        <h2 className="panel-title">Template Library</h2>
        <p className="panel-subtitle">{TEMPLATES.length} ready-to-use templates</p>
      </div>

      <div className="panel-search-bar">
        <input className="panel-search" placeholder="Search templates…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="template-categories">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`template-cat-btn${selectedCategory === cat ? " template-cat-btn--active" : ""}`} onClick={() => setSelectedCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="panel-empty"><p>No templates found.</p></div>
      ) : (
        <div className="template-grid">
          {filtered.map((t) => (
            <div key={t.id} className="template-card">
              <div className="template-card-icon">{t.icon}</div>
              <div className="template-card-body">
                <span className="template-card-name">{t.name}</span>
                <span className="template-card-cat">{t.category}</span>
                <p className="template-card-desc">{t.description}</p>
              </div>
              <button className="template-use-btn" onClick={() => useTemplate(t)}>Use →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
