"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Moon,
  Sun,
  Sparkles,
  Leaf,
  MessageCircle,
  Instagram,
  ShoppingBag,
  Clock,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  Send,
  Heart,
  Palette,
} from "lucide-react";

const initialForm = {
  name: "",
  whatsapp: "",
  source: "Instagram DM",
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
  return `Hi Sapna Munoth team, I shared my style preference through Vouch.

Name: ${form.name}
Interest: ${form.interest}
Occasion: ${form.occasion}
Fabric preference: ${form.fabric}
Size: ${form.size}
Budget: ${form.budget}
Timeline: ${form.timeline}
Readiness: ${form.readiness}
Help needed: ${form.helpType}

Intent: ${result.level} (${result.score}/100)
Suggested action: ${result.action}

Notes: ${form.notes || "No extra notes"}`;
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
      alert("Please fill name, WhatsApp number, interest and consent.");
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
    const message = encodeURIComponent(submitted.whatsappMessage);
    const cleanNumber = submitted.whatsapp.replace(/\D/g, "");
    const whatsappLink = `https://wa.me/91${cleanNumber.slice(-10)}?text=${message}`;

    return (
      <main className="sapna-page">
        <ThemeButton theme={theme} setTheme={setTheme} />

        <section className="success-shell">
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle2 size={34} />
            </div>

            <p className="eyebrow">Vouch Style Finder</p>

            <h1>Your style preference is captured.</h1>

            <p className="success-copy">
              Sapna Munoth’s team can now see what this buyer wants, how urgent
              the purchase is, and what action should happen next.
            </p>

            <div className="intent-panel">
              <div>
                <span>Intent Level</span>
                <strong>{submitted.intentLevel}</strong>
              </div>

              <div>
                <span>Intent Score</span>
                <strong>{submitted.intentScore}/100</strong>
              </div>

              <div>
                <span>Suggested Action</span>
                <strong>{submitted.suggestedAction}</strong>
              </div>
            </div>

            <a className="primary-link" href={whatsappLink} target="_blank">
              Continue on WhatsApp <MessageCircle size={18} />
            </a>

            <button
              className="ghost-button"
              onClick={() => {
                setForm(initialForm);
                setSubmitted(null);
                setStatus("idle");
              }}
            >
              Submit another demo lead
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
          <span>Sapna Munoth × Vouch Demo</span>
          <span>Instagram DM Filter</span>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="brand-mark">
              <Sparkles size={18} />
              Signature block prints • Sustainable fabrics • Buyer intent
            </div>

            <h1>
              Turn “price please?” DMs into{" "}
              <span>serious buyer signals.</span>
            </h1>

            <p>
              A premium style-intent flow for Sapna Munoth that captures what a
              buyer wants, their size, budget, timeline and readiness — before
              the team spends time replying manually.
            </p>

            <div className="hero-actions">
              <a href="#style-finder" className="primary-link">
                Try the style finder <ArrowRight size={18} />
              </a>

              <a href="#how-it-helps" className="secondary-link">
                See how it helps DMs
              </a>
            </div>

            <div className="proof-row">
              <div>
                <strong>50 DMs</strong>
                <span>become sorted leads</span>
              </div>

              <div>
                <strong>High / Medium / Low</strong>
                <span>buyer intent</span>
              </div>

              <div>
                <strong>Google Sheet</strong>
                <span>ready dashboard</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="fabric-card top-card">
              <Leaf size={20} />
              <span>Sustainable fabric preference</span>
            </div>

            <div className="phone-frame">
              <div className="phone-top">
                <Instagram size={18} />
                <span>Instagram DM</span>
              </div>

              <div className="dm-bubble incoming">Price?</div>
              <div className="dm-bubble incoming">Available in M?</div>
              <div className="dm-bubble incoming">Can you send more designs?</div>

              <div className="dm-bubble outgoing">
                Please share your size, occasion, budget and timeline here.
                We’ll send curated options.
              </div>

              <div className="mini-dashboard">
                <div>
                  <span>Buyer</span>
                  <strong>Ritu</strong>
                </div>

                <div>
                  <span>Intent</span>
                  <strong>High</strong>
                </div>

                <div>
                  <span>Next</span>
                  <strong>Send 3 looks</strong>
                </div>
              </div>
            </div>

            <div className="fabric-card bottom-card">
              <Palette size={20} />
              <span>Festive edit • Size M • This week</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-helps" className="section">
        <div className="section-heading">
          <p className="eyebrow">Why this fits fashion</p>
          <h2>Fashion selling is personal. Vouch makes the first signal clear.</h2>
        </div>

        <div className="benefit-grid">
          <FeatureCard
            icon={<MessageCircle />}
            title="Filters Instagram DMs"
            text="Instead of replying manually to every price query, the team sends one smart link and receives structured buyer context."
          />

          <FeatureCard
            icon={<ShoppingBag />}
            title="Finds serious buyers"
            text="Budget, timeline, size and readiness reveal who is likely to buy now versus who is only browsing."
          />

          <FeatureCard
            icon={<Clock />}
            title="Improves follow-up"
            text="Each lead gets a suggested action: send curated options now, follow up later, or add to lookbook list."
          />

          <FeatureCard
            icon={<IndianRupee />}
            title="Protects ad spend"
            text="Meta ad clicks can be routed to this flow to see which audience actually becomes a qualified fashion lead."
          />
        </div>
      </section>

      <section className="section split-section">
        <div>
          <p className="eyebrow">Before Vouch</p>
          <h2>Lots of interest. Very little clarity.</h2>

          <ul className="pain-list">
            <li>“Price?” messages without size, budget or occasion.</li>
            <li>Manual replies to people who may never buy.</li>
            <li>Exhibition visitors leave without structured follow-up data.</li>
            <li>Meta ads create clicks, but buyer quality stays unclear.</li>
          </ul>
        </div>

        <div className="after-card">
          <p className="eyebrow">After Vouch</p>
          <h3>Every inquiry becomes a clean buyer card.</h3>

          <div className="lead-card">
            <div>
              <span>Name</span>
              <strong>Priya</strong>
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
          </div>
        </div>
      </section>

      <section id="style-finder" className="form-section">
        <div className="form-intro">
          <p className="eyebrow">Live demo form</p>
          <h2>Find your Sapna Munoth look.</h2>

          <p>
            This is the customer-facing flow Sapna can share in Instagram DMs,
            Meta ads, WhatsApp, exhibitions, or her website.
          </p>
        </div>

        <form className="style-form" onSubmit={handleSubmit}>
          <div className="field-grid two">
            <Input
              label="Name"
              value={form.name}
              onChange={(v) => updateField("name", v)}
              placeholder="Your name"
            />

            <Input
              label="WhatsApp number"
              value={form.whatsapp}
              onChange={(v) => updateField("whatsapp", v)}
              placeholder="10-digit mobile number"
            />
          </div>

          <Select
            label="Where did this inquiry come from?"
            value={form.source}
            onChange={(v) => updateField("source", v)}
            options={[
              "Instagram DM",
              "Meta ad",
              "Website",
              "Exhibition",
              "WhatsApp referral",
              "Store visit",
            ]}
          />

          <div className="field-grid two">
            <Select
              label="What are you interested in?"
              value={form.interest}
              onChange={(v) => updateField("interest", v)}
              options={options.interest}
            />

            <Select
              label="Occasion"
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
              label="Size"
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
              label="How should the team help?"
              value={form.helpType}
              onChange={(v) => updateField("helpType", v)}
              options={options.helpType}
            />
          </div>

          <label className="textarea-label">
            Extra note
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Example: Need something elegant for a family lunch next weekend."
            />
          </label>

          <div className="live-score">
            <div>
              <span>Live buyer intent</span>
              <strong>{result.level}</strong>
            </div>

            <div>
              <span>Score</span>
              <strong>{result.score}/100</strong>
            </div>

            <div>
              <span>Suggested action</span>
              <strong>{result.action}</strong>
            </div>
          </div>

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
            {status === "submitting" ? "Saving..." : "Submit style preference"}
            <Send size={18} />
          </button>

          {status === "error" && (
            <p className="error-text">
              Submission failed. Check Google Script URL in Netlify environment
              variables.
            </p>
          )}
        </form>
      </section>

      <section className="section closing-section">
        <div>
          <p className="eyebrow">For Sapna’s team</p>
          <h2>One link for DMs. One sheet for serious buyers.</h2>

          <p>
            This demo can be connected to Google Sheets so Sapna sees every
            inquiry as a sorted buyer-intent row — not just another Instagram
            message.
          </p>
        </div>

        <div className="closing-card">
          <Heart size={24} />

          <h3>Best pilot promise</h3>

          <p>
            “Out of 50 Instagram DMs, Vouch helps identify the 5–10 people who
            are actually worth immediate follow-up.”
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