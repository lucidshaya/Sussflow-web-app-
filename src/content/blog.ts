// Sussflow blog. Advice here follows the brand's FAQ, size guide and social posts;
// keep new articles consistent with those (and with what a health professional would say).

export interface BlogSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, e.g. 2026-10-01 */
  published: string;
  image: string;
  imageAlt: string;
  tag: string;
  sections: BlogSection[];
  /** Where the article points readers next. */
  cta: { label: string; to: "/shop" | "/size-guide" | "/find-your-fit" | "/bundles" };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-care-for-reusable-pads",
    title: "How to care for your reusable pads so they last",
    excerpt:
      "Use, rinse, wash, air-dry, reuse. A simple routine that keeps your pads fresh for up to 100 washes.",
    published: "2026-10-01",
    image: "/images/pads.jpg",
    imageAlt: "Sussflow reusable pads in pink, orange, blue, black and white",
    tag: "Pad care",
    sections: [
      {
        paragraphs: [
          "Reusable pads are easy to manage once you have a routine. The basic routine is: use → rinse → wash → air-dry → reuse. With proper care, Sussflow reusable pads can last for up to 100 washes, or about 2 years, depending on how often you use them.",
        ],
      },
      {
        heading: "1. Change every 4–6 hours",
        paragraphs: [
          "As a general guide, change your reusable pad every 4–6 hours, or sooner if it feels saturated. On heavier days you may need to change more often.",
        ],
      },
      {
        heading: "2. Rinse with cold water",
        paragraphs: [
          "Rinse the pad with cold water soon after use, until the water runs mostly clear. Rinsing first makes washing much easier.",
        ],
      },
      {
        heading: "3. Wash with a mild detergent",
        paragraphs: [
          "Wash by hand or in the machine with a mild detergent. No special detergents or long soaking are needed.",
        ],
      },
      {
        heading: "4. Air-dry completely, ideally in sunlight",
        paragraphs: [
          "Let the pad dry completely before you store or use it again. Drying in direct sunlight is a simple, natural way to freshen your pads.",
        ],
      },
      {
        heading: "5. Store clean pads in a breathable pouch",
        paragraphs: [
          "Keep clean, dry pads together so they're ready for your next cycle. When you're out, carry a pouch for used pads and rinse them when you get home.",
        ],
      },
      {
        heading: "Quick checklist",
        list: [
          "Change every 4–6 hours, or sooner if needed",
          "Rinse with cold water",
          "Wash with a mild detergent",
          "Dry completely, ideally in the sun",
          "Store in a clean, breathable pouch",
        ],
      },
    ],
    cta: { label: "Shop reusable pads", to: "/shop" },
  },
  {
    slug: "understanding-your-flow",
    title: "Light, moderate or heavy? Understanding your flow",
    excerpt:
      "Knowing your flow helps you choose the right pad length, plan ahead and notice when something changes.",
    published: "2026-10-01",
    image: "/images/underwear.jpg",
    imageAlt: "Sussflow period underwear",
    tag: "Know your body",
    sections: [
      {
        paragraphs: [
          "Your flow can change from day to day and from cycle to cycle. Understanding it helps you pick the right products and notice what's normal for you.",
        ],
      },
      {
        heading: "Light flow",
        paragraphs: [
          'Usually seen on the first or last days of your period: light spotting or small streaks of blood. It often means your body is easing in or rounding up your cycle. A pantyliner or a 6" to 8" pad is usually enough.',
        ],
      },
      {
        heading: "Moderate flow",
        paragraphs: [
          'A steady, noticeable flow. You may need to change your pad more often, and this is the most common flow level for many people. A 10" to 12" pad works well as your usual day-time pad.',
        ],
      },
      {
        heading: "Heavy flow",
        paragraphs: [
          'You soak products faster, a cup may fill quicker, and the flow can feel warm or gushy when you stand up. It\'s common around days 2–3. For heavy days we recommend a 14" or 16" pad, or period underwear.',
        ],
      },
      {
        heading: "Very heavy flow",
        paragraphs: [
          "Needing to change products very often or passing thick clots can feel overwhelming. Pairing products, such as a cup or pad with period underwear, adds extra security.",
          "If very heavy periods happen regularly, talk to a doctor or trusted health professional.",
        ],
      },
      {
        heading: "Why reusables help you track your flow",
        paragraphs: [
          "Because you rinse and wash reusable pads and pants yourself, you see your flow more clearly from cycle to cycle. That makes changes easier to notice and explain to a health professional if you need to.",
        ],
      },
    ],
    cta: { label: "See the size guide", to: "/size-guide" },
  },
  {
    slug: "switching-to-reusable-period-care",
    title: "Thinking of switching from disposables? Start here",
    excerpt:
      "You don't have to switch everything at once. Here's how to choose your first reusable product.",
    published: "2026-10-01",
    image: "/images/kit.jpg",
    imageAlt: "A Sussflow period care kit",
    tag: "Getting started",
    sections: [
      {
        paragraphs: [
          "People switch to reusable period care for different reasons: to cut down on disposable waste, to stop buying pads every month, to try an alternative to disposable sanitary pads, or to understand their flow better.",
          "You don't have to switch everything at once. Start with the reusable product that best fits your lifestyle.",
        ],
      },
      {
        heading: "Your options",
        list: [
          "Reusable pads: the easiest switch if you're used to disposable pads. Last up to 100 washes (about 2 years).",
          "Period underwear: worn like normal underwear, for up to 8 hours depending on your flow. Lasts up to 3 years. Start with 3–4 pairs.",
          "Menstrual cup: worn internally and lasts about 5–10 years with proper care.",
          "A combination: many people mix products, such as a cup with period underwear on heavy days.",
        ],
      },
      {
        heading: "Myth: reusable pads are unhygienic",
        paragraphs: [
          "When they're rinsed, washed and dried properly, reusable pads are hygienic. The routine is simple: rinse with cold water, wash with a mild detergent and dry completely.",
        ],
      },
      {
        heading: "Myth: reusable pads are bulky",
        paragraphs: [
          'Modern reusable pads like Sussflow\'s are soft and breathable, and come in lengths from 6" to 16" so you can match them to your flow.',
        ],
      },
      {
        heading: "Not sure where to start?",
        paragraphs: [
          "Take our short quiz to find the period care that fits your body, lifestyle and cycle. The best option is the one that works safely and comfortably for you.",
        ],
      },
    ],
    cta: { label: "Find your period care", to: "/find-your-fit" },
  },
];

export const postBySlug = (slug: string) => BLOG_POSTS.find((post) => post.slug === slug);

/** Rough reading time at ~200 words a minute. */
export function readingMinutes(post: BlogPost) {
  const words = post.sections
    .flatMap((s) => [s.heading ?? "", ...(s.paragraphs ?? []), ...(s.list ?? [])])
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export const formatPostDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
