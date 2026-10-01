// Marketing copy from the Sussflow landing-page brief and FAQ document.

export interface Persona {
  id: string;
  quote: string;
  body: string;
  name: string;
  cta: string;
  link:
    | { to: "/products/$slug"; slug: string }
    | { to: "/shop"; category?: string }
    | { to: "/bundles" | "/education" | "/find-your-fit" };
}

export const PERSONAS: Persona[] = [
  {
    id: "pad-girl",
    quote: "I'm ready to stop buying disposable pads every month.",
    body: "You want period care that feels familiar, but you're ready for a reusable sanitary pad that is practical, comfortable and designed to be used again and again.",
    name: "Pad Girl",
    cta: "Explore Reusable Pads",
    link: { to: "/products/$slug", slug: "reusable-menstrual-pads" },
  },
  {
    id: "curious-switcher",
    quote: "I want to try reusable menstrual products, but I'm not sure where to start.",
    body: "You've heard about reusable pads, menstrual cups and period underwear—but you want someone to make the options simple.",
    name: "Curious Switcher",
    cta: "Find Your Starting Point",
    link: { to: "/find-your-fit" },
  },
  {
    id: "cup-convert",
    quote: "I'm a cup girl—or I think I want to become one.",
    body: "You're ready to explore a menstrual cup and discover a reusable period-care option that can stay with you for years.",
    name: "Cup Convert",
    cta: "Explore Menstrual Cups",
    link: { to: "/shop", category: "menstrual-cups" },
  },
  {
    id: "first-period-parent",
    quote: "My daughter is approaching her first period.",
    body: "You want to prepare her with age-appropriate menstrual health information, practical period products and confidence—not fear or shame.",
    name: "First-Period Parent",
    cta: "Explore First Period Care",
    link: { to: "/shop", category: "preparedness" },
  },
  {
    id: "period-pro",
    quote: "I already know what works for me. I just need to stock up.",
    body: "You know your routine. You need reliable menstrual products that fit seamlessly into your everyday life.",
    name: "Period Pro",
    cta: "Shop Your Essentials",
    link: { to: "/shop" },
  },
  {
    id: "impact-partner",
    quote: "I want to provide menstrual care for girls and women at scale.",
    body: "You're a school, NGO, CSR team, organisation or institution looking for sustainable menstrual health solutions—not a one-time donation.",
    name: "Impact Partner",
    cta: "Work With Sussflow",
    link: { to: "/education" },
  },
];

export const STATS = [
  {
    value: "700+",
    label: "Customers served",
    body: "More than 700 customers have chosen Sussflow for their menstrual care needs.",
  },
  {
    value: "3,500+",
    label: "Reusable products sold",
    body: "Helping customers make the transition to reusable period care.",
  },
  {
    value: "2,000+",
    label: "Girls impacted",
    body: "Our menstrual health education programmes have reached more than 2,000 girls.",
  },
  {
    value: "10+",
    label: "NGO partnerships",
    body: "Delivering menstrual health education and sustainable period-care interventions.",
  },
];

export const EDUCATION_TOPICS = [
  "Menstrual health and hygiene",
  "Understanding the menstrual cycle",
  "Reusable menstrual care",
  "Menstrual product selection and correct use",
  "Menstrual myths and misconceptions",
  "Sustainable period care",
  "Healthy menstrual habits",
];

export interface FaqItem {
  q: string;
  a: string[];
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "about",
    title: "About Sussflow & our products",
    items: [
      {
        q: "What are reusable menstrual pads?",
        a: [
          "Reusable menstrual pads work much like disposable sanitary pads, except they are designed to be used multiple times. You wear them, rinse them, wash them, air-dry them and reuse them.",
          "They are available in different lengths and absorbency options to suit different flow levels.",
        ],
      },
      {
        q: "Are reusable menstrual pads easy to manage?",
        a: [
          "Yes. Once you get used to your routine, reusable pads are simple to manage. They can also help you become more aware of your menstrual flow and cycle patterns.",
          "Your basic routine is: use → rinse → wash → air-dry → reuse.",
        ],
      },
      {
        q: "How long do Sussflow reusable pads last?",
        a: [
          "With proper care and maintenance, our reusable pads can last for up to 100 washes or approximately 2 years, depending on frequency of use and how they are maintained.",
        ],
      },
      {
        q: "How long does Sussflow period underwear last?",
        a: [
          "With proper care and maintenance, our period underwear can last for up to 3 years, depending on frequency of use and care.",
        ],
      },
      {
        q: "How long does a Sussflow menstrual cup last?",
        a: [
          "Our menstrual cups can last approximately 5–10 years when properly maintained, depending on how the cup is cared for and its condition over time.",
        ],
      },
      {
        q: "Are Sussflow products certified?",
        a: [
          "Sussflow products have undergone relevant testing, and our reusable sanitary pad line is SON certified. We are also currently progressing with NAFDAC registration for applicable products.",
          "We are committed to product quality, safety and responsible menstrual care.",
        ],
      },
      {
        q: "Do Sussflow products contain PFAS, fragrance or added chemicals?",
        a: [
          "Our products are made with your health and comfort in mind. We do not intentionally add fragrance or PFAS to our menstrual care products.",
          "For specific material or product questions, please contact our team before purchasing.",
        ],
      },
    ],
  },
  {
    id: "pads",
    title: "Reusable pads",
    items: [
      {
        q: "How many hours can I wear a reusable pad?",
        a: [
          "It depends on your menstrual flow. As a general guide, we recommend changing your reusable pad every 4–6 hours, or sooner if it becomes saturated.",
          "Your individual flow may require more frequent changes.",
        ],
      },
      {
        q: "Which reusable pad is best for heavy flow?",
        a: [
          "Our reusable pads are available in options suitable for different flow levels and lengths.",
          "For heavy flow, we generally recommend choosing a 14-inch or 16-inch pad, especially if you prefer longer coverage.",
        ],
      },
      {
        q: "Do you have reusable pads for postpartum mums?",
        a: [
          "Yes. For new mums who have just given birth, we recommend our longest 16-inch reusable pad for greater coverage.",
          "However, postpartum bleeding can vary significantly. If you have recently given birth, follow your healthcare provider's guidance, particularly if your bleeding is unusually heavy or you have other concerning symptoms.",
        ],
      },
      {
        q: "Can I choose the colour of my reusable pads?",
        a: [
          "Our pad packs are pre-packaged and come in a variety of mixed colours.",
          "At the moment, individual colour selection is not available.",
        ],
      },
      {
        q: "Can I choose the size of my reusable pad?",
        a: [
          "Yes. We have different pad lengths and absorbency options so you can choose according to your flow, coverage preference and comfort.",
        ],
      },
    ],
  },
  {
    id: "underwear",
    title: "Period underwear",
    items: [
      {
        q: "How long can I wear period underwear?",
        a: [
          "You can wear period underwear for up to 8 hours, depending on your flow and the absorbency of the underwear.",
          "If your flow is heavy, you may need to change sooner.",
        ],
      },
      {
        q: "What colour does the Sussflow period underwear come in?",
        a: [
          "Our period underwear is currently available in black.",
          "We're working towards introducing more colour options.",
        ],
      },
      {
        q: "Is period underwear suitable for heavy flow?",
        a: [
          "Yes. Our period underwear can be used for menstrual flow, but if you have extra-heavy flow, you may prefer to pair it with a reusable pad for additional protection.",
        ],
      },
      {
        q: "How many pairs of period underwear do I need?",
        a: [
          "It depends on the number of days you menstruate and how frequently you plan to wash and reuse them.",
          "We generally recommend starting with 3–4 pairs and adding more based on your cycle and personal routine.",
        ],
      },
    ],
  },
  {
    id: "cups",
    title: "Menstrual cups",
    items: [
      {
        q: "How does a menstrual cup work?",
        a: [
          "A menstrual cup is inserted into the vagina, where it collects menstrual blood rather than absorbing it.",
          "Before first use, sterilize the cup according to the care instructions. When you're ready to insert it, wash your hands, fold the cup, gently insert it into the vagina, and check that it has fully opened and formed a seal.",
          "A menstrual cup can generally be worn for up to 12 hours, depending on your flow and the manufacturer's guidance. You may need to empty it sooner if your flow is heavy.",
        ],
      },
      {
        q: "How do I insert a menstrual cup?",
        a: [
          "Wash your hands first. Fold the cup using a comfortable fold, relax your pelvic muscles and gently insert it into the vagina.",
          "Once inserted, check that the cup has opened fully and is positioned comfortably.",
          "If you're new to menstrual cups, it may take a few cycles to become comfortable with insertion and removal.",
        ],
      },
      {
        q: "Can I use my hand to insert the menstrual cup?",
        a: [
          "Yes. You can insert and remove your menstrual cup using your hands.",
          "Always wash your hands thoroughly before handling the cup.",
        ],
      },
      {
        q: "How will I know when my menstrual cup is full?",
        a: [
          "You may notice leakage or a sensation that the cup needs to be emptied. However, you don't always feel when the cup is full.",
          "If you're new to using a cup, pay attention to your flow and empty it regularly until you understand how long it lasts for you.",
        ],
      },
      {
        q: "Will menstrual blood spill everywhere when I remove the cup?",
        a: [
          "Not necessarily. When removed correctly, the cup holds the collected menstrual blood.",
          "To minimise spills, remove it slowly and carefully while keeping the cup upright.",
        ],
      },
      {
        q: "Can menstrual blood leak while I'm lying down with a menstrual cup?",
        a: [
          "A menstrual cup is designed to collect menstrual blood regardless of your position, including when you're lying down.",
          "However, leakage can happen if the cup is full, has not opened properly, is incorrectly positioned, or does not provide the right fit for you.",
        ],
      },
      {
        q: "Can I pee while wearing a menstrual cup?",
        a: [
          "Yes. You can urinate while wearing a menstrual cup.",
          "The menstrual cup sits inside the vagina, while urine leaves the body through the urethra. They are separate openings.",
        ],
      },
      {
        q: "Can someone who has never had penetrative sex use a menstrual cup?",
        a: [
          "A person who has never had penetrative sex may be able to use a menstrual cup.",
          "Using a menstrual cup does not inherently “break” the hymen. The hymen is elastic tissue and varies naturally from person to person. However, inserting any menstrual product into the vagina can stretch the hymenal tissue, and some people may find insertion uncomfortable.",
          "If you're unsure, especially because of personal, cultural or medical concerns, speak with a qualified healthcare professional.",
        ],
      },
      {
        q: "Will a menstrual cup make my vagina wider?",
        a: [
          "No. The vagina is an elastic muscular canal and does not become permanently wider from using a menstrual cup.",
        ],
      },
      {
        q: "Do menstrual cup accessories come with the cup?",
        a: [
          "Our cup accessories, such as the Cup Sister, Cup Mate and menstrual cup sterilizer, are purchased separately unless specifically stated as part of a bundle.",
        ],
      },
    ],
  },
  {
    id: "first-period",
    title: "First period & girls' menstrual health",
    items: [
      {
        q: "What is the difference between the My First Period Box and the Back-to-School Kit?",
        a: [
          "They are designed for different needs.",
          "The Back-to-School Kit is a compact period-emergency kit containing one period underwear, one carry-on pouch and mini wipes. It is ideal for girls who want to be prepared for unexpected period days at school or away from home.",
          "The My First Period Box is a more comprehensive first-period package containing essential menstrual care products and additional resources designed to support a girl's menstrual health journey for up to 3 years, depending on usage.",
        ],
      },
      {
        q: "Can I customise the My First Period Box?",
        a: [
          "Yes. You can add additional menstrual products to the My First Period Box based on your needs.",
          "However, the standard items included in the box cannot be removed.",
        ],
      },
      {
        q: "What age is the My Period Record Book for?",
        a: [
          "The My Period Record Book is designed primarily for girls and teenagers who are learning to understand and track their menstrual cycle.",
          "It can help users record their periods, notice patterns and develop healthy cycle-awareness habits.",
        ],
      },
    ],
  },
  {
    id: "orders",
    title: "Orders, payment & delivery",
    items: [
      {
        q: "Do you have a physical store or pickup location in Lagos?",
        a: [
          "Yes. Sussflow has a physical pickup location in the Iju axis of Lagos, Nigeria.",
          "If you'd prefer to pick up your order, select the pickup option when placing your order.",
        ],
      },
      {
        q: "Do you deliver outside Lagos?",
        a: [
          "Yes. We deliver nationwide across Nigeria.",
          "Depending on your location, we use courier services, dispatch or waybill delivery.",
        ],
      },
      {
        q: "Do I pay the rider for delivery?",
        a: [
          "No. Your delivery fee is shown at checkout under your subtotal and is paid online together with your products.",
          "There's nothing extra to pay the rider when your order arrives.",
        ],
      },
      {
        q: "How long does nationwide delivery take?",
        a: [
          "Delivery time depends on your location, the delivery method and the courier/waybill service used.",
          "Lagos deliveries are generally handled through dispatch, while orders outside Lagos may be sent through courier or waybill services.",
          "Our team will provide your delivery details after your order is confirmed.",
        ],
      },
      {
        q: "Can I order online and pick up in Lagos?",
        a: [
          "Yes. You can place your order online and arrange pickup from our Iju-area Lagos location.",
        ],
      },
    ],
  },
  {
    id: "care",
    title: "Product safety & care",
    items: [
      {
        q: "How do I care for my reusable pads?",
        a: [
          "After use, rinse the pad, wash it appropriately and allow it to air-dry completely before storing or using it again.",
          "Following the recommended care instructions helps maintain the product and extend its useful life.",
        ],
      },
      {
        q: "How do I care for my menstrual cup?",
        a: [
          "Wash your hands before handling your cup. Clean the cup according to the care instructions and sterilize it appropriately between cycles.",
          "Store it in a clean, breathable storage bag when not in use.",
        ],
      },
      {
        q: "Can I use reusable menstrual products if I have a heavy flow?",
        a: [
          "Yes. We have reusable period-care options designed for different flow levels.",
          "For heavier flow, you may choose a longer reusable pad, use period underwear with additional protection, or combine products according to your personal needs.",
        ],
      },
    ],
  },
  {
    id: "why-reusable",
    title: "Why choose reusable period care?",
    items: [
      {
        q: "Is reusable period care better than disposable pads?",
        a: [
          "Reusable and disposable products have different advantages and considerations.",
          "Reusable period care can reduce the number of disposable menstrual products you throw away, and because the same product can be washed and reused, it can also reduce the number of products you need to purchase over time.",
          "At Sussflow, we see reusable menstrual care as part of preventive and sustainable menstrual health—supporting your personal care, environmental responsibility and long-term period-care needs.",
          "The best option is ultimately the one that works safely and comfortably for you.",
        ],
      },
      {
        q: "Why should I switch to reusable menstrual products?",
        a: [
          "People choose reusable period care for different reasons: to reduce disposable menstrual waste, to reduce repeated monthly purchases, to explore alternatives to disposable sanitary pads, to better understand their menstrual flow, and to have period-care products that can be reused over a long period.",
          "You don't have to switch everything at once. You can start with the reusable product that best fits your lifestyle.",
        ],
      },
    ],
  },
  {
    id: "company",
    title: "About Sussflow",
    items: [
      {
        q: "Is Sussflow a Nigerian menstrual health company?",
        a: [
          "Yes. Sussflow Reusable Nigeria Limited is a Nigerian menstrual health company based in Lagos, Nigeria.",
          "We provide reusable menstrual products, menstrual health education and sustainable period-care solutions for women and girls.",
        ],
      },
      {
        q: "How many people has Sussflow served?",
        a: [
          "Sussflow has served 700+ customers and sold more than 3,500 reusable period products.",
          "Through our menstrual health education programmes, we have also impacted 2,000+ girls and partnered with 10+ NGOs.",
        ],
      },
      {
        q: "Does Sussflow work with schools and NGOs?",
        a: [
          "Yes. We partner with schools, NGOs, CSR programmes, organisations and other institutions to provide menstrual health education, menstrual products and menstrual health interventions.",
        ],
      },
      {
        q: "Where can I buy Sussflow products?",
        a: [
          "You can order Sussflow menstrual products online for delivery across Nigeria or visit our physical pickup location in Lagos.",
          "We are also working towards making Sussflow products available in more physical retail stores closer to our customers.",
        ],
      },
    ],
  },
];

/** FAQ groups relevant to each product slug, shown on the product page. */
export const PRODUCT_FAQ_GROUP: Record<string, string> = {
  "reusable-menstrual-pads": "pads",
  "reusable-pantyliners": "pads",
  "interlabial-pads": "pads",
  "period-underwear": "underwear",
  "menstrual-cup": "cups",
  "cup-sister": "cups",
  "cup-mate": "cups",
  "menstrual-cup-sterilizer": "cups",
  "my-period-record-book": "first-period",
  "back-to-school-kit": "first-period",
  "the-first-period-box": "first-period",
};

// Photos and facts from Sussflow's 2025 impact report and outreach posts (Google Drive).
export interface ImpactPhoto {
  src: string;
  alt: string;
  caption: string;
}

export const IMPACT_PHOTOS: ImpactPhoto[] = [
  {
    src: "/images/impact/girl-child-day-group.jpg",
    alt: "Smiling teenage girls holding period-positive signs such as “Periods are powerful”",
    caption: "International Day of the Girl Child: we visited schools to educate girls",
  },
  {
    src: "/images/impact/school-pad-distribution.jpg",
    alt: "A schoolgirl in uniform holding up a pack of Sussflow reusable pads",
    caption: "Reusable pads and menstrual education for Lagos secondary schools, with SACSAN",
  },
  {
    src: "/images/impact/girl-child-day-school.jpg",
    alt: "A classroom full of schoolgirls in blue uniforms cheering",
    caption: "A school session for International Day of the Girl Child",
  },
  {
    src: "/images/impact/stakeholder-workshop.jpg",
    alt: "Workshop participants posing together in a conference room",
    caption: "Stakeholder workshop on hygiene financing and inclusion",
  },
  {
    src: "/images/impact/student-period-pant.jpg",
    alt: "A young student giving a thumbs up while holding a Sussflow period pant",
    caption: "A student with her Sussflow period pant",
  },
  {
    src: "/images/impact/community-project-talk.jpg",
    alt: "A Sussflow speaker addressing young people at a community project",
    caption: "Speaking at “Beyond the Classroom”, an SDSN Lagos community project",
  },
  {
    src: "/images/impact/pachipanda-award.jpg",
    alt: "Sussflow's founder receiving a prize cheque at the Africa PachiPanda Finale",
    caption: "2nd place at the Africa PachiPanda Finale",
  },
  {
    src: "/images/impact/i-love-my-sussflow-pad.jpg",
    alt: "A woman at the Sussflow stand holding an “I love my Sussflow pad” sign",
    caption: "Meeting customers at a Sussflow product stand",
  },
  {
    src: "/images/impact/sussflow-team.jpg",
    alt: "Four women from the Sussflow team in branded T-shirts",
    caption: "The Sussflow team",
  },
];

export const IMPACT_HIGHLIGHTS = [
  "2,000+ women and girls educated on menstrual and climate health",
  "Partnerships with schools, NGOs and women's groups in Lagos and Ogun States",
  "350 packs of reusable pads distributed with SACSAN, alongside menstrual education for 6 secondary schools in Lagos Zone 2",
  "Pottersville School and Pink Up for Girls: about 150 girls reached",
  "Stakeholder workshop with the Development Bank of Nigeria, UNICEF and WaterAid on hygiene financing and inclusion",
  "SON-certified reusable pads, menstrual cups and period pants (June 2025)",
  "Featured on MTN Nigeria, TVC and Unilag FM, and a speaker at the Girl Pad Summit 2025",
];

// Customer reviews as Sussflow published them on social media.
export interface Review {
  name: string;
  product: string;
  quote: string;
}

export const REVIEWS: Review[] = [
  {
    name: "DSQ Titilope Alao",
    product: "Reusable pads",
    quote:
      "It's exactly one year I switched to your reusable pads and I have felt NO itchiness. There is no sanitary brand I have not bought o. I just said let me try your 5-in-1 pack, then as my Snapchat reminded me now, I said let me give you guys your flowers.",
  },
  {
    name: "Sarah Olagoke",
    product: "Period pant",
    quote:
      "I am in love with this period pant oh. My period flow has increased and it held the flow well, even under white attire yesterday ooh… Na to buy two more once I get money.",
  },
  {
    name: "DSQ Olabisi",
    product: "Menstrual cup",
    quote:
      "Since I started using the cup, I have not cancelled my weekend swimming classes because period or no period, I'm good to go. The applicator is always in my bag, so changing on the go is easy pizzy.",
  },
  {
    name: "Mummy Ife",
    product: "Pads + period pants",
    quote:
      "Thank you for telling me I can pair the Sussflow pads with my period pants. As a heavy bleeder I'm always conscious during my period, but now that extra security is the bomb.",
  },
  {
    name: "Mrs Afolashade",
    product: "Reusable pads",
    quote:
      "Truth be told, I just bought it to support a friend, but I'm glad I did. I'm never going back to disposables, because what do you mean I have been using plastic all the while? Thank you Sussflow.",
  },
  {
    name: "DSQ Damilola",
    product: "Reusable pads",
    quote:
      "I was skeptical at first to try a new product after being used to disposables all my life, but I'm glad I did. These did not give me any rash and I felt comfortable all through my cycle.",
  },
  {
    name: "Mrs Calista",
    product: "Period pant + cup",
    quote:
      "I can't believe you had to convince me this long to make the switch, because this is really good. And I like that I have options, so I use them interchangeably depending on my lifestyle.",
  },
  {
    name: "DSQ Rukayat",
    product: "Menstrual cup",
    quote:
      "It's been awesome honestly. I can wear white without worries of getting stained! I love it.",
  },
  {
    name: "DSQ Rukayat",
    product: "Menstrual cup",
    quote:
      "I used to feel pain removing it until you explained these steps to me. I've been enjoying it. Been saving pad money too.",
  },
  {
    name: "Regina Oluwayemisi",
    product: "Menstrual cup",
    quote:
      "Thank God I chose these cups over pads… I love it. It's still strange, being the second day of use… but it's so convenient.",
  },
  {
    name: "DSQ Omotolani",
    product: "Period pant",
    quote:
      "Using the Sussflow pant has actually been a game changer. It feels so comfortable and absorbs so well.",
  },
  {
    name: "DSQ Blessing",
    product: "Reusable pads",
    quote:
      "I will rate Sussflow 8/10. For a first-time user, the switch to reusable pads is the best decision ever.",
  },
];
