"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Moon,
  Sun,
  Sparkles,
  Leaf,
  MessageCircle,
  Camera,
  ShoppingBag,
  Clock,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  Send,
  Heart,
  Palette,
  Shirt,
  ClipboardList,
  Filter,
  Store,
} from "lucide-react";

const initialForm = {
  name: "",
  whatsapp: "",
  source: "Website",
  interest: "",
  occasion: "",
  fabric: "",
  size: "",
  budget: "",
  timeline: "",
  readiness: "",
  helpType: "",
  notes: "",
  consent: false,
};

const options = {
  source: [
    "Website",
    "Instagram",
    "WhatsApp Channel",
    "Meta Ad",
    "Exhibition Stall",
    "Friend / Referral",
    "Store Visit",
  ],
  interest: [
    "Festive wear",
    "Block print dress",
    "Kurta set",
    "Co-ord set",
    "Everyday premium wear",
    "Gifting",
    "Custom styling help",
    "Not sure yet",
  ],
  occasion: [
    "Casual outing",
    "Family function",
    "Festive event",
    "Office / workwear",
    "Travel / resort wear",
    "Wedding-related occasion",
    "Gift for someone",
    "Just browsing",
  ],
  fabric: [
    "Cotton",
    "Mulmul",
    "Linen",
    "Hand block print",
    "Sustainable fabrics",
    "Embroidery details",
    "Open to suggestions",
  ],
  size: ["XS", "S", "M", "L", "XL", "XXL", "Custom / need help"],
  budget: [
    "Below ₹3,000",
    "₹3,000 - ₹5,000",
    "₹5,000 - ₹8,000",
    "₹8,000 - ₹12,000",
    "₹12,000+",
    "Not sure yet",
  ],
  timeline: [
    "Today",
    "This week",
    "This month",
    "For a future occasion",
    "Just browsing",
  ],
  readiness: [
    "Ready to buy if I like the options",
    "Interested but want to see more",
    "Comparing styles",
    "Just browsing",
  ],
  helpType: [
    "Send curated options on WhatsApp",
    "Share price and availability",
    "Help me choose the right size",
    "Show festive / new collection pieces",
    "Invite me to store / exhibition",
  ],
};

function calculateIntent(form) {
  let score = 0;

  if (["Today", "This week"].includes(form.timeline)) score += 30;
  else if (form.timeline === "This month") score += 20;
  else if (form.timeline === "For a future occasion") score += 10;

  if (
    [
      "₹3,000 - ₹5,000",
      "₹5,000 - ₹8,000",
      "₹8,000 - ₹12,000",
      "₹12,000+",
    ].includes(form.budget)
  ) {
    score += 25;
  } else if (form.budget === "Below ₹3,000") {
    score += 10;
  }

  if (form.readiness === "Ready to buy if I like the options") score += 30;
  else if (form.readiness === "Interested but want to see more") score += 20;
  else if (form.readiness === "Comparing styles") score += 10;

  if (form.whatsapp && form.whatsapp.replace(/\D/g, "").length >= 10) score += 10;
  if (form.helpType) score += 5;

  let level = "Low";
  let action = "Add to lookbook / future collection list";

  if (score >= 75) {
    level = "High";
    action = "Send 3 curated options on WhatsApp immediately";
  } else if (score >= 45) {
    level = "Medium";
    action = "Send collection edit and follow up within 24 hours";
  }

  return { score, level, action };
}

function buildWhatsappMessage(form, result) {
  return `Hi Sapna Munoth team, I just shared my style preferences.

Name: ${form.name}
WhatsApp: ${form.whatsapp}
I found you through: ${form.source}

I am looking for: ${form.interest}
Occasion: ${form.occasion}
Fabric / style preference: ${form.fabric}
Size: ${form.size}
Budget: ${form.budget}
Timeline: ${form.timeline}
Buying readiness: ${form.readiness}
Help needed: ${form.helpType}

Note: ${form.notes || "No extra note"}

Please send me curated options based on the above.`;
}

export default function Home() {
  const [theme, setTheme] = useState("dark");
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [submitted, setSubmitted] = useState(null);

  const result = useMemo(() => calculateIntent(form), [form]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("sapna-theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sapna-theme", theme);
    document.documentElement.setAttribute("data-sapna-theme", theme);
  }, [theme]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.whatsapp || !form.interest || !form.consent) {
      alert("Please fill name, WhatsApp number, what you are looking for, and consent.");
      return;
    }

    setStatus("submitting");

    const payload = {
      ...form,
      submittedAt: new Date().toISOString(),
      formType: "sapna_munoth_style_finder",
      brand: "Sapna Munoth",
      intentScore: result.score,
      intentLevel: result.level,
      suggestedAction: result.action,
      whatsappMessage: buildWhatsappMessage(form, result),
    };

    try {
      const res = await fetch("/api/sapnamunoth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      setSubmitted(payload);
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setStatus("error");
      alert("Something went wrong. Please check Google Apps Script setup.");
    }
  }

  if (submitted) {
    const sapnaNumber =
      process.env.NEXT_PUBLIC_SAPNA_WHATSAPP_NUMBER || "91XXXXXXXXXX";

    const whatsappLink = `https://wa.me/${sapnaNumber}?text=${encodeURIComponent(
      submitted.whatsappMessage
    )}`;

    return (
      <main className="sapna-page">
        <ThemeButton theme={theme} setTheme={setTheme} />

        <section className="success-shell">
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle2 size={34} />
            </div>

            <p className="eyebrow">Sapna Munoth Style Finder</p>

            <h1>Your style preferences have been shared.</h1>

            <p className="success-copy">
              Thank you, {submitted.name}. The Sapna Munoth team now has your
              size, occasion, budget, timeline and style preference, so they can
              send you more relevant options instead of a random catalogue.
            </p>

            <div className="customer-summary">
              <div>
                <span>Looking for</span>
                <strong>{submitted.interest}</strong>
              </div>

              <div>
                <span>Occasion</span>
                <strong>{submitted.occasion || "Not specified"}</strong>
              </div>

              <div>
                <span>Size</span>
                <strong>{submitted.size || "Not specified"}</strong>
              </div>

              <div>
                <span>Budget</span>
                <strong>{submitted.budget || "Not specified"}</strong>
              </div>

              <div>
                <span>Timeline</span>
                <strong>{submitted.timeline || "Not specified"}</strong>
              </div>
            </div>

            <a className="primary-link" href={whatsappLink} target="_blank">
              Send this summary on WhatsApp <MessageCircle size={18} />
            </a>

            <p className="tiny-note">
              This opens WhatsApp with your style summary pre-filled. You can
              review and send it to the Sapna Munoth team.
            </p>

            <button
              className="ghost-button"
              onClick={() => {
                setForm(initialForm);
                setSubmitted(null);
                setStatus("idle");
              }}
            >
              Submit another demo entry
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="sapna-page">
      <ThemeButton theme={theme} setTheme={setTheme} />

      <section className="hero">
        <div className="nav-pill">
          <span>Sapna Munoth Style Finder</span>
          <span>Powered by Vouch</span>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="brand-mark">
              <Sparkles size={18} />
              A private style-assist experience for Sapna Munoth customers
            </div>

            <h1>
              Find your <span>Sapna Munoth</span> look.
            </h1>

            <p>
              Share your size, occasion, fabric preference, budget and timeline.
              The Sapna Munoth team will send you curated options that match
              what you are looking for.
            </p>

            <div className="hero-actions">
              <a href="#style-finder" className="primary-link">
                Start Style Finder <ArrowRight size={18} />
              </a>

              <a href="#sapna-view" className="secondary-link">
                What Sapna’s team sees
              </a>
            </div>

            <div className="proof-row">
              <div>
                <strong>Personalized</strong>
                <span>style suggestions</span>
              </div>

              <div>
                <strong>WhatsApp</strong>
                <span>curated follow-up</span>
              </div>

              <div>
                <strong>Simple</strong>
                <span>preference capture</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="fabric-card top-card">
              <Leaf size={20} />
              <span>Sustainable fabrics • Block prints</span>
            </div>

            <div className="phone-frame">
              <div className="phone-top">
                <Camera size={18} />
                <span>Customer view</span>
              </div>

              <div className="dm-bubble incoming">I liked your festive collection.</div>
              <div className="dm-bubble incoming">Do you have something in size M?</div>
              <div className="dm-bubble incoming">Need it this week.</div>

              <div className="dm-bubble outgoing">
                Share your size, occasion and budget. We’ll send you curated
                Sapna Munoth options on WhatsApp.
              </div>

              <div className="mini-dashboard">
                <div>
                  <span>Preference</span>
                  <strong>Festive wear</strong>
                </div>

                <div>
                  <span>Size</span>
                  <strong>M</strong>
                </div>

                <div>
                  <span>Timeline</span>
                  <strong>This week</strong>
                </div>
              </div>
            </div>

            <div className="fabric-card bottom-card">
              <Palette size={20} />
              <span>Occasion • Size • Budget • Timeline</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">For customers</p>
          <h2>A calmer way to discover the right outfit.</h2>
          <p>
            Instead of sending multiple messages about price, size, availability
            and more designs, customers can share what they want in one simple
            style finder.
          </p>
        </div>

        <div className="benefit-grid">
          <FeatureCard
            icon={<Shirt />}
            title="Tell us your style"
            text="Share what you are looking for — festive wear, block prints, kurta sets, co-ords, gifting or custom styling."
          />

          <FeatureCard
            icon={<ShoppingBag />}
            title="Share size and occasion"
            text="The team understands your size, event, fabric preference and budget before suggesting options."
          />

          <FeatureCard
            icon={<MessageCircle />}
            title="Get options on WhatsApp"
            text="Receive a more relevant edit instead of a random catalogue or repeated back-and-forth messages."
          />

          <FeatureCard
            icon={<Heart />}
            title="Feel personally guided"
            text="The experience feels like a private styling assistant, while staying simple and quick."
          />
        </div>
      </section>

      <section id="style-finder" className="form-section">
        <div className="form-intro">
          <p className="eyebrow">Customer experience</p>
          <h2>Find your Sapna Munoth look.</h2>

          <p>
            Answer a few quick questions so the team can understand your style,
            size, budget and occasion before sending options.
          </p>

          <div className="side-note-card">
            <Sparkles size={22} />
            <h3>What happens next?</h3>
            <p>
              After you submit, you can send the same style summary to Sapna
              Munoth on WhatsApp with one tap.
            </p>
          </div>
        </div>

        <form className="style-form" onSubmit={handleSubmit}>
          <div className="field-grid two">
            <Input
              label="Your name"
              value={form.name}
              onChange={(v) => updateField("name", v)}
              placeholder="Enter your name"
            />

            <Input
              label="WhatsApp number"
              value={form.whatsapp}
              onChange={(v) => updateField("whatsapp", v)}
              placeholder="10-digit mobile number"
            />
          </div>

          <Select
            label="Where did you discover Sapna Munoth?"
            value={form.source}
            onChange={(v) => updateField("source", v)}
            options={options.source}
          />

          <div className="field-grid two">
            <Select
              label="What are you looking for?"
              value={form.interest}
              onChange={(v) => updateField("interest", v)}
              options={options.interest}
            />

            <Select
              label="What is the occasion?"
              value={form.occasion}
              onChange={(v) => updateField("occasion", v)}
              options={options.occasion}
            />
          </div>

          <div className="field-grid two">
            <Select
              label="Fabric / style preference"
              value={form.fabric}
              onChange={(v) => updateField("fabric", v)}
              options={options.fabric}
            />

            <Select
              label="Preferred size"
              value={form.size}
              onChange={(v) => updateField("size", v)}
              options={options.size}
            />
          </div>

          <div className="field-grid two">
            <Select
              label="Budget comfort"
              value={form.budget}
              onChange={(v) => updateField("budget", v)}
              options={options.budget}
            />

            <Select
              label="When are you planning to buy?"
              value={form.timeline}
              onChange={(v) => updateField("timeline", v)}
              options={options.timeline}
            />
          </div>

          <div className="field-grid two">
            <Select
              label="How ready are you?"
              value={form.readiness}
              onChange={(v) => updateField("readiness", v)}
              options={options.readiness}
            />

            <Select
              label="How should the team help you?"
              value={form.helpType}
              onChange={(v) => updateField("helpType", v)}
              options={options.helpType}
            />
          </div>

          <label className="textarea-label">
            Anything specific you want us to know?
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Example: Need something elegant for a family lunch next weekend."
            />
          </label>

          <label className="consent">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => updateField("consent", e.target.checked)}
            />

            <span>
              I agree to share my style preferences and WhatsApp number so the
              Sapna Munoth team can send relevant options.
            </span>
          </label>

          <button
            className="submit-button"
            type="submit"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Saving..." : "Share my style preference"}
            <Send size={18} />
          </button>

          {status === "error" && (
            <p className="error-text">
              Submission failed. Please try again.
            </p>
          )}
        </form>
      </section>

      <section id="sapna-view" className="section split-section">
        <div>
          <p className="eyebrow">For Sapna and team</p>
          <h2>Every customer submission becomes a buyer-intent row.</h2>

          <p>
            While the customer sees a beautiful style finder, Sapna’s team sees
            structured data in Google Sheets — source, size, budget, timeline,
            readiness, intent level and suggested follow-up action.
          </p>

          <ul className="pain-list">
            <li>Website, Instagram, WhatsApp, Meta ads and exhibition inquiries in one format.</li>
            <li>High / Medium / Low buyer intent for faster follow-up.</li>
            <li>Suggested next action for each customer.</li>
            <li>WhatsApp-ready summary for curated product suggestions.</li>
          </ul>
        </div>

        <div className="after-card owner-card">
          <p className="eyebrow">Sample Google Sheet view</p>
          <h3>What Sapna’s team can act on</h3>

          <div className="lead-card">
            <div>
              <span>Name</span>
              <strong>Priya</strong>
            </div>

            <div>
              <span>Source</span>
              <strong>WhatsApp Channel</strong>
            </div>

            <div>
              <span>Looking for</span>
              <strong>Festive kurta set</strong>
            </div>

            <div>
              <span>Budget</span>
              <strong>₹5,000 - ₹8,000</strong>
            </div>

            <div>
              <span>Timeline</span>
              <strong>This week</strong>
            </div>

            <div>
              <span>Intent</span>
              <strong className="intent-high">High</strong>
            </div>

            <div>
              <span>Action</span>
              <strong>Send 3 curated options</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">How Sapna can use this</p>
          <h2>One style finder across all touchpoints.</h2>
        </div>

        <div className="benefit-grid">
          <FeatureCard
            icon={<Store />}
            title="Website"
            text="Add a Find Your Look button for visitors who are interested but not ready to browse everything."
          />

          <FeatureCard
            icon={<Camera />}
            title="Instagram"
            text="Use the link in bio, stories, DMs and replies to price or size questions."
          />

          <FeatureCard
            icon={<MessageCircle />}
            title="WhatsApp"
            text="Share the style finder after posting collections, new arrivals or festive edits."
          />

          <FeatureCard
            icon={<ClipboardList />}
            title="Exhibitions"
            text="Use a QR code at the stall to collect serious buyer preferences for follow-up after the event."
          />
        </div>
      </section>

      <section className="section closing-section">
        <div>
          <p className="eyebrow">Powered by Vouch</p>
          <h2>The customer feels guided. The business gets clarity.</h2>

          <p>
            Vouch quietly turns fashion interest into structured buyer signals
            so Sapna’s team knows who is serious, what they want, and what to do
            next.
          </p>
        </div>

        <div className="closing-card">
          <Filter size={24} />

          <h3>Best pilot promise</h3>

          <p>
            “Out of 50 fashion inquiries, identify the 5–10 buyers worth
            immediate follow-up.”
          </p>
        </div>
      </section>
    </main>
  );
}

function ThemeButton({ theme, setTheme }) {
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="input-label">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="input-label">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}