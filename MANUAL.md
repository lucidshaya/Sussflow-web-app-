# Sussflow platform manual

This manual explains how to run the Sussflow online store: what the website does for customers, and how to manage everything from the admin dashboard.

- **Website:** https://www.sussflow.com
- **Dashboard:** https://www.sussflow.com/admin
- **Questions about the code or hosting:** see [Part 4](#part-4-technical-reference-for-whoever-maintains-the-site) and the [README](README.md).

## Contents

1. [Quick start](#part-1-quick-start)
2. [The website (what customers see)](#part-2-the-website-what-customers-see)
3. [The dashboard (running the store)](#part-3-the-dashboard-running-the-store)
4. [Technical reference](#part-4-technical-reference-for-whoever-maintains-the-site)
5. [Troubleshooting](#troubleshooting)

---

## Part 1: Quick start

**Signing in**

1. Go to **www.sussflow.com/admin**.
2. Sign in with your admin email and password.
3. If you forget the password, use **Forgot your password?** on the sign-in page.

Only accounts with admin access can open the dashboard. To give a teammate access, see [Settings → Admin access](#settings).

**Everyday jobs at a glance**

| I want to… | Go to |
|---|---|
| See today's sales and new orders | **Overview** |
| Change a price or update stock | **Price list** |
| Add or edit a product or kit | **Products** |
| Pack and ship orders, update their status | **Orders** |
| Approve customer reviews | **Reviews** |
| Write or email a blog post | **Blog** |
| Reply to session, partnership or stockist requests | **Enquiries** |
| Change delivery fees, the top banner or rewards | **Settings** |

> Changes you save in the dashboard appear on the website straight away. You never need to redeploy the site to change prices, products, fees, the banner or blog posts.

---

## Part 2: The website (what customers see)

### Shopping

- **Home page:**
  - photo hero;
  - the editable **top banner**;
  - featured products and website-only deals;
  - **Pair Up** (product pairs for heavy flow);
  - Find Your Fit personas;
  - education highlights;
  - trust badges;
  - the latest blog posts.
- **Shop** (`/shop`): every product, with category filters.
- **Product pages:**
  - **Photos:** a photo gallery.
  - **Choosing:**
    - a **size** or **length** picker and pack sizes, each with its own price;
    - **choices** such as *Flow type* and *Colour* (on pads).
  - **Prices:** deal prices show the old price crossed out and the % saved.
  - **Stock:** messages like "Only 3 left" and "Sold out".
  - **Extras:**
    - a **Watch video** button, if a video link is set;
    - **star ratings and reviews**, plus a form to leave one;
    - "Earn N points" when rewards are on;
    - kit contents, add-ons and related FAQs.
- **Deals** (`/deals`), **Bundles / kits** (`/bundles`), **Find Your Fit quiz** (`/find-your-fit`) and **Size guide** (`/size-guide`).
- **Bag:**
  - a slide-out bag and a full bag page (`/cart`);
  - change quantities or remove items;
  - shows the current delivery fees.

> Sizes and choices must be picked before an item can go in the bag. Customers see a message such as "Choose a size" or "Choose a flow type" if they forget.

### Checkout and payment

1. **Customer details:** the customer enters their name, email and phone.
2. **Delivery or pickup:**
   - **Delivery:** the customer gives their address and state.
   - **Lagos pickup:** no address needed.
3. **Delivery fee:** worked out from the customer's state:
   - **Lagos:** the customer also chooses **where in Lagos** (e.g. Mainland, Victoria Island to Lekki), and that area's fee is used.
   - **Elsewhere:** the waybill fee for that state's region.
4. **Summary:** Subtotal, then Points discount (if used), then Delivery fee, then **Total to pay**.
5. **Payment:** the customer pays on Paystack by card, bank transfer or USSD.
6. **Confirmation:** they return to a confirmation page with their order number and totals.

Behind the scenes:
- **Prices are checked again on the server**, so customers can't change them.
- **Checkout stays up to date:** an open checkout page refreshes prices and delivery fees every 30 seconds. If something changed just before the customer clicks Pay, they see "your total is now ₦X, please review" instead of paying an amount they didn't see.
- **Payment confirmation:** Paystack confirms every payment directly to the site (the webhook), even if the customer closes the page.
- **Stock goes down automatically** when an order is paid.

### Customer accounts, tracking and points

- **Accounts:** customers can sign up, sign in and reset a forgotten password by email (`/auth`).
- **My account** (`/account`):
  - saved delivery details, which pre-fill checkout;
  - order history and order details;
  - **My points** (balance and history) when rewards are on.
- **Track your order** (`/track`): enter the order number and email. No account is needed. It shows a progress timeline and the totals.

### Learning and content

- **Blog** (`/blog`): articles written in the dashboard.
- **Education** (`/education`):
  - outreach photos and impact highlights;
  - customer reviews;
  - a form to **book a session or start a partnership**.
- **Other pages:** FAQ, About, and Store & delivery (pickup address, delivery fees, store waitlist).
- **Partner forms:** Become a stockist and Become a distributor.
- **Legal:** Terms & conditions and Privacy policy.

### On every page

- **WhatsApp "Message us"** button.
- **Footer:** email-list sign-up, social links and all page links.
- **Phones:** works throughout, with swipeable rows for products, deals, photos and reviews.
- **Security:** HTTPS, with every address redirecting to https://www.sussflow.com, plus spam traps on forms.
- **Search engines and sharing:**
  - share images for WhatsApp, Facebook and X;
  - Google product data (price, stock, ratings);
  - an automatic sitemap.

---

## Part 3: The dashboard (running the store)

### Overview
- **Totals:** revenue (all time), paid orders, number of products and new enquiries.
- **Orders by status:** a chart.
- **Recent orders:** a list.
- **Low stock:** options with 5 or fewer left.

### Price list
All price options for every product on one page, grouped by category.

| Column | What it means |
|---|---|
| **Size** | e.g. `M`, `2XL`, `Size 1 (Small)` |
| **Length** | e.g. `16"` |
| **Pack** | how many in one pack (e.g. 5 for a 5-in-1 pack, 3 for 3 pairs) |
| **Price (₦)** | what the customer pays |
| **Was (₦)** | optional old price. Fill it in to show a deal (crossed out, with the % saved); leave it empty for no deal |
| **Stock** | how many you have. At 0 the option shows "Sold out" |
| **SKU** | your own product code (optional) |
| **Active** | switch off to hide just this option |

- **Edit a row:** change any value and click **Save** on that row.
- **New option:** use **Add price option**.
- **Delete:** use the bin icon.

> **Keep stock accurate.** The site won't sell more than the stock number, and stock goes down automatically when orders are paid. For period underwear and cups, each **size** has its own stock.

### Products

**Products list**
- **Find:** search, and filter by category.
- **Visible in shop:** switch off to hide a product without deleting it.
- **Featured:** switch on to show it on the home page.
- **"No price":** flags products that can't be bought yet, because they have no active price option.

**Add or edit a product:** go to **Products → New product** or click a product.

- **Basics:**
  - name and web address (filled in from the name);
  - category and sort order (lower numbers come first).
- **Words:**
  - **Tagline:** for kits, the quote shown on the Bundles page.
  - **Short detail:** shown on product cards.
  - **Description:** leave a blank line between paragraphs.
  - **Perfect for.**
- **Images:** the main image and gallery images. Upload them, up to 5 MB each.
- **Options & choices:**
  - **Show size:** switch on to show sizes (XS–4XL, Size 1/2…). Customers must pick a size.
  - **Show length:** switch on to show inches (e.g. 16"). Turning one off **hides** it but keeps the information.
  - **Customer choices:** extra picks that don't change the price, such as *Flow type: Normal flow, Heavy flow* or *Colour: Plain colour, Mixed colour*. Type the name, then the options separated by commas. The customer's choice is saved on the order.
- **Product video link** (optional): paste a full `https://` link (YouTube, Instagram, TikTok…) and a **Watch video** button appears on the product page.
- **Price options:** the same table as the Price list, for this product only.

**Kits and bundles**
1. Create a product in the **Bundles** category. **Products → New kit** sets this for you.
2. Give it a price option.
3. Fill in **Kit contents**:
   - **What's inside:** pick products, or type your own item (e.g. "Carry-on pouch").
   - **Add-on:** extras customers can buy with the kit.
   - **Related:** buttons that link to other products.

Kits in the Bundles category appear on the **Bundles** page automatically.

### Categories
Create, rename, describe, reorder and delete the categories used for the shop filters.

### Orders

**Orders list**
- **Search** by order number, name, email or phone.
- **Filter** by status.
- **Export CSV** to download the list into a spreadsheet.

**Order page**
- **Items:** each item with its size and choices, e.g. "M · 5-in-1 pack · Heavy flow · Mixed colour".
- **Customer and fulfilment:** delivery address, or Lagos pickup.
- **Payment and points:** the Paystack payment details, and any points used or earned.
- **Internal notes:** put the waybill number, rider details and so on here.

**Moving an order along:** each order goes through these steps. Use the button for the next step, and the customer sees each change on order tracking.

| Status | Delivery wording | Pickup wording | When to use it |
|---|---|---|---|
| Pending | Order placed | Order placed | Automatic at checkout (not yet paid) |
| Paid | Payment confirmed | Payment confirmed | Automatic when Paystack confirms |
| Processing | Packing your order | Packing your order | When you start packing |
| Shipped | **Out for delivery** | **Ready for pickup** | Handed to rider or courier, or ready at the pickup point |
| Delivered | Delivered | Picked up | When the customer has it |
| Cancelled | | | Order won't go ahead (refund in Paystack if paid) |
| Failed | | | Payment didn't succeed |

- **Edit an order:** change the customer details or the delivery fee. The total updates and keeps any points discount.
- **Delete an order:** only do this for tests or mistakes.

> **Refunds** are done in the **Paystack dashboard**. Afterwards, set the order to **Cancelled**. If points were used or earned, click **Reverse points** on the order.

### Customers
- **The list:** everyone who has ordered or made an account, with their number of orders, total spent, last order and location.
- **Edit customer:** change an account's saved details.
- **Points:** each account shows its balance. Click it to **add or remove points** with a reason (e.g. "Birthday bonus"), which the customer sees in their history.

### Enquiries
- **What arrives here:** session bookings, partnership requests, stockist and distributor applications, contact messages and email-list sign-ups.
- **Status:** set it to *New*, *In progress* or *Closed* to track replies.
- **Delete:** removes spam or old messages.

### Reviews
Customers can rate any product from 1 to 5 stars and add a comment. **Nothing appears on the website until you approve it.**

- **Find reviews:** the **Waiting for approval** tab shows new reviews, with a count.
- **Approve:** switch **Approved** on to publish a review; switch it off to hide it again.
- **Delete:** removes spam or abusive reviews.

Approved ratings show as stars on product pages and product cards, and in Google search results.

### Blog
**Write a post:** go to **Blog → New article**.
- **Title:** the web address fills in automatically.
- **Tag:** e.g. "Pad care".
- **Summary:** 1–2 sentences, shown on the article card and in Google.
- **Cover image.**
- **Article text:**
  - leave a **blank line** between paragraphs;
  - start a line with `## ` for a **heading**;
  - start lines with `- ` for **bullet points**.
- **Published:** switch on to show the post on the website, or leave it off to save a draft.

Published posts appear on the **Blog** page, the **home page** (the latest 3) and Google's sitemap.

**Email a post to your list**

On a published post, click **Email to list**:
1. The box shows how many people are on your list and how many haven't received this post yet.
2. Click **Send now**. A progress count shows while it sends.

- **Gmail limit:** emails go out through Gmail, which allows about **500 per day**. If the limit is reached, click **Email to list** again the next day. It continues where it stopped and never emails anyone twice.
- **Unsubscribe:** every email has an unsubscribe link. People who unsubscribe are skipped; if they sign up again in the footer, they're back on the list.
- **Who's on the list:** everyone who joined through the footer or the store waitlist. They appear in **Enquiries** as waitlist sign-ups.

### Settings

> Settings only change on the website after you **save**. While you have unsaved changes, a bar at the bottom says **"You have unsaved changes · Save settings"**, and your browser warns you if you try to leave the page.

**Rewards (points)**
- **Turn on rewards:** switch rewards on or off for the whole site.
- **Spend (₦) to earn 1 point:** e.g. `100` means a ₦15,500 order earns 155 points.
- **1 point is worth (₦):** e.g. `2` means 155 points = ₦310 off.
- **Calculator:** pick any product option, or type an amount, to see the points earned, their value and the % given back.

How points work for customers:
- **Who earns:** only customers with an account.
- **When:** when an order is paid.
- **How much:** based on what they paid for products. Delivery doesn't count.
- **Spending:** at checkout, "Use my points" takes the discount off. Points can pay for products down to ₦100, the minimum Paystack can charge.
- **Cancelled orders:** cancelling doesn't change points. Use **Reverse points** on the order.

**Top banner:** the strip at the very top of the home page.
- **Show the banner:** the on/off switch.
- **Banner text:** up to 140 characters.
- **Banner link** (optional): a page on the site like `/deals`, or a full `https://` link. Leave it empty if the banner shouldn't be clickable.

**Store & delivery**
- **Lagos delivery areas (₦):** each area has its own name and fee. When a customer chooses delivery to Lagos, checkout asks **"Where in Lagos?"** and uses that area's fee. Pickup and other states don't ask. You can edit names and fees, **Add an area** or remove one with ✕, then click **Save Lagos areas** (right under the list). Until you save, it says "Unsaved — click Save Lagos areas", and checkout keeps using the old fees.

  | Starting area | Fee |
  |---|---|
  | Victoria Island to Lekki | ₦5,000 |
  | Badore to Awoyaya | ₦7,000 |
  | Mainland | ₦4,000 |
  | Ikorodu (except Caleb University) | ₦5,000 |
  | Mile 2 to Festac | ₦5,000 |
  | Satellite Town | ₦6,000 |
  | Alakuko to part of Sango Ota | ₦6,000 |

- **Lagos fee if no areas are listed (₦):** only used when the area list is empty.
- **Waybill fees by region (₦):** one fee per region. Checkout picks the right one from the customer's state.

  | Region | States |
  |---|---|
  | South-West | Ogun, Oyo, Osun, Ondo, Ekiti |
  | South-South | Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Rivers |
  | South-East | Abia, Anambra, Ebonyi, Enugu, Imo |
  | North-Central & Abuja | FCT – Abuja, Benue, Kogi, Kwara, Nasarawa, Niger, Plateau |
  | North-East | Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe |
  | North-West | Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto, Zamfara |

- **Fee preview:** the "Customers see" box shows exactly what appears in the bag, at checkout and on the Store & delivery page.
- **Pickup address and instructions:** shown at checkout and on the Store & delivery page.
- **Contact phone, contact email and WhatsApp link:** used by the WhatsApp button, the footer and order pages.

**Social links:** Instagram, TikTok, Facebook, LinkedIn, X and Google Business. These links appear in the footer.

**Admin access**
- **Add an admin:** enter a teammate's email. They must already have a Sussflow account.
- **Remove an admin:** they keep their customer account but lose dashboard access.

---

## Part 4: Technical reference (for whoever maintains the site)

### How it's built

| Piece | What it is |
|---|---|
| Website & dashboard | TanStack Start (React), styled with Tailwind |
| Database, logins, image storage | Supabase (project `setdvhbntqplqqigcxlr`) |
| Payments | Paystack (live keys in production, test keys locally) |
| Hosting | Vercel project `sussflow`. Every push to the `main` branch on GitHub (`lucidshaya/Sussflow-web-app-`) deploys automatically |
| Domain & DNS | `sussflow.com`, registered at QServers, with nameservers pointing to Vercel (DNS records are managed in Vercel) |
| Password-reset emails | Supabase Auth, sent through Gmail SMTP (Supabase → Authentication → SMTP) |
| Blog emails | Gmail SMTP from the site (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) |

### Settings stored in Vercel (Project → Settings → Environment Variables)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Public connection to Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin key (**secret**) |
| `VITE_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY` | Paystack keys (the secret key is **secret**) |
| `SITE_URL` | `https://www.sussflow.com`; used for links, the sitemap and Paystack return links |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Gmail account and **app password** for blog emails (**secret**) |

After changing any variable, **redeploy**: Vercel → Deployments → ⋯ → Redeploy.

### Accounts that must stay connected

- **Paystack (Live) webhook:** `https://www.sussflow.com/api/paystack/webhook`. This makes orders turn "Paid" even if the customer closes the page.
- **Supabase → Authentication → URL Configuration:**
  - **Site URL:** `https://www.sussflow.com`.
  - **Redirect URLs:** include `https://www.sussflow.com/**`.
- **Supabase → Authentication → SMTP:** Gmail (`smtp.gmail.com`, port 587) with an app password.

### Database changes (migrations)
The files are in `supabase/migrations`, applied in order from `0001` to `0010`:
- **0001–0002:** shop, orders, settings and seed products.
- **0003:** order timeline.
- **0004:** deals and social links.
- **0005:** kits and security.
- **0006:** customer choices and the blog.
- **0007:** sizes, reviews, delivery zones, the banner and blog emails.
- **0008:** rewards.
- **0009:** security hardening (who can call database functions).
- **0010:** Lagos delivery areas.

A new database needs all ten run in the Supabase SQL editor.

### Changing the domain
See the [README → Custom domain](README.md#6-custom-domain) section. In short:
1. Add the domain in Vercel.
2. Update `SITE_URL` and redeploy.
3. Update the Supabase URL Configuration.
4. Update the Paystack webhook.
5. Submit the new sitemap in Google Search Console.

### Security notes
- Never share secret keys or passwords in chat or email. If one leaks, create a new one and update it in Vercel or Supabase.
- Prices and points are always re-checked on the server, and the browser never sees secret keys.
- The dashboard is hidden from search engines and only works for admin accounts.

---

## Troubleshooting

| Problem | What to check |
|---|---|
| **An order stays "Pending" after the customer paid** | Check the payment in Paystack. Make sure the **Live webhook URL** is set (see Part 4). You can set the order to Paid by hand once you've confirmed the payment |
| **A product shows "Sold out"** | The stock for that option or size is 0 in the **Price list** |
| **A product can't be bought or isn't showing** | **Visible in shop** is off, or it has no active price option ("No price" in Products) |
| **Password-reset emails don't arrive** | The customer needs an account with that email; also check their spam folder. Check Supabase SMTP settings, and that the Gmail app password hasn't been changed |
| **"Email to list" says sending isn't set up** | `GMAIL_USER` or `GMAIL_APP_PASSWORD` is missing in Vercel; add them and redeploy |
| **"Gmail's daily sending limit was reached"** | Normal for big lists. Try again the next day; it continues where it stopped |
| **A review isn't on the website** | It needs approving in **Reviews** |
| **The delivery fee looks wrong** | Check **Settings → Store & delivery**: for Lagos, the area the customer chose (shown on the order page); for other states, which region the state belongs to (table above) |
| **Points didn't appear for a customer** | Rewards must be **on**, the customer must have checked out **signed in**, and the order must be **Paid**. You can add points by hand in **Customers** |
| **A change isn't showing on the website** | Refresh the page. Dashboard changes appear straight away; code changes appear about a minute after they're pushed to GitHub |
