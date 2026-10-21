/* ==========================================================================
   GYM BADGE — website catalog data (single source of truth)
   Gyms, coaches, reviews & FAQs that power the find / coach / detail /
   reviews surfaces. Money is stored in base NGN and formatted + converted
   through GBPricing, so the currency selector works everywhere.

   Photo pipeline: every `photo` value is a people.js id. Real photos dropped
   into /web/assets/img/people/<id>.jpg replace the generated portrait.
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---- Gyms: a real, browsable catalog ---- */
  var GYMS = [
    {
      id: "iron-house", name: "Iron House Gym", city: "Lagos", country: "Nigeria",
      area: "Victoria Island", dist: 0.4, open: true, rating: 4.9, reviews: 214,
      dayPassNgn: 2500, photo: "gym-floor", verified: true,
      hours: "Open 24/7", tags: ["Weights", "Cardio", "24/7", "Sauna"],
      blurb: "Serious iron in the heart of the island. Platforms, calibrated plates and a 24/7 door that never judges your 3am deadlift.",
      equipment: ["Calibrated bumper plates", "8 lifting platforms", "Assault bikes", "Infrared sauna"],
      plans: [["Day pass", 2500], ["Monthly", 18000], ["Annual", 180000]]
    },
    {
      id: "fitzone-central", name: "FitZone Central", city: "Lagos", country: "Nigeria",
      area: "Ikeja", dist: 1.1, open: true, rating: 4.7, reviews: 168,
      dayPassNgn: 2000, photo: "member-lift", verified: true,
      hours: "06:00 – 22:00", tags: ["Classes", "Pool", "Cardio"],
      blurb: "A full service club with a 25m pool, 40+ classes a week and a cardio mezzanine that overlooks the city.",
      equipment: ["25m pool", "40+ weekly classes", "Technogym cardio line", "Childcare"],
      plans: [["Day pass", 2000], ["Monthly", 15000], ["Annual", 150000]]
    },
    {
      id: "powerhouse-fitness", name: "PowerHouse Fitness", city: "Abuja", country: "Nigeria",
      area: "Maitama", dist: 1.8, open: false, rating: 4.8, reviews: 132,
      dayPassNgn: 3000, photo: "member-yoga", verified: true,
      hours: "05:30 – 23:00", tags: ["Weights", "Sauna", "Classes"],
      blurb: "Strength first facility with strongman kit, a recovery suite and coaches who compete. Quiet before 7am.",
      equipment: ["Strongman lane", "Cryotherapy", "Competition racks", "Recovery suite"],
      plans: [["Day pass", 3000], ["Monthly", 22000], ["Annual", 240000]]
    },
    {
      id: "pulse-studio", name: "Pulse Studio", city: "Nairobi", country: "Kenya",
      area: "Westlands", dist: 2.3, open: true, rating: 4.6, reviews: 97,
      dayPassNgn: 1800, photo: "member-run", verified: false,
      hours: "06:00 – 21:00", tags: ["HIIT", "Yoga", "Classes"],
      blurb: "Boutique HIIT and yoga in equal measure. Small classes, loud music, and a leaderboard that keeps you honest.",
      equipment: ["Rower fleet", "Heated yoga studio", "Kettlebell zone", "Showers"],
      plans: [["Day pass", 1800], ["Monthly", 12000], ["Annual", 120000]]
    },
    {
      id: "apex-athletic", name: "Apex Athletic Club", city: "Accra", country: "Ghana",
      area: "Airport Residential", dist: 3.1, open: true, rating: 4.9, reviews: 188,
      dayPassNgn: 2200, photo: "coach-hero", verified: true,
      hours: "Open 24/7", tags: ["Performance", "24/7", "Track"],
      blurb: "A performance club with an indoor sprint track, altitude room and sports science testing for members.",
      equipment: ["30m sprint track", "Altitude room", "Force plates", "Physio on call"],
      plans: [["Day pass", 2200], ["Monthly", 20000], ["Annual", 210000]]
    },
    {
      id: "vertex-fitness", name: "Vertex Fitness", city: "Cape Town", country: "South Africa",
      area: "Sea Point", dist: 0.9, open: true, rating: 4.8, reviews: 156,
      dayPassNgn: 2600, photo: "member-rest", verified: true,
      hours: "05:00 – 22:00", tags: ["Ocean view", "Weights", "Classes"],
      blurb: "Ocean facing floor with a full free weight hall, reformer Pilates and a recovery deck that catches the sunset.",
      equipment: ["Reformer Pilates", "Ocean view cardio", "Contrast pools", "Recovery deck"],
      plans: [["Day pass", 2600], ["Monthly", 21000], ["Annual", 220000]]
    },
    {
      id: "quarteiron-gym", name: "Quarteiron Gym", city: "Lagos", country: "Nigeria",
      area: "Lekki", dist: 1.4, open: true, rating: 4.5, reviews: 88,
      dayPassNgn: 1500, photo: "member-4", verified: false,
      hours: "24/7 (members)", tags: ["Budget", "24/7", "Cardio"],
      blurb: "No frills, no fuss — clean kit, open all hours, and the cheapest honest workout on the peninsula.",
      equipment: ["Plate loaded machines", "Treadmill bank", "Stretch zone", "Lockers"],
      plans: [["Day pass", 1500], ["Monthly", 10000], ["Annual", 96000]]
    },
    {
      id: "elevate-wellness", name: "Elevate Wellness Hub", city: "Nairobi", country: "Kenya",
      area: "Kilimani", dist: 2.7, open: true, rating: 4.7, reviews: 121,
      dayPassNgn: 2400, photo: "member-2", verified: true,
      hours: "06:00 – 21:30", tags: ["Yoga", "Spa", "Classes"],
      blurb: "Wellness first: mobility, breathwork and strength under one roof, with a spa you'll actually use after.",
      equipment: ["Mobility studio", "Steam & spa", "Breathwork classes", "Nutrition bar"],
      plans: [["Day pass", 2400], ["Monthly", 19000], ["Annual", 195000]]
    }
  ];

  /* ---- Coaches: trainer directory (foreshadows v2.0 matching) ---- */
  var COACHES = [
    {
      id: "ada-okafor", name: "Ada Okafor", specialty: "Strength & Power", city: "Lagos", country: "Nigeria",
      rating: 4.9, reviews: 87, rateNgn: 12000, years: 9, verified: true, photo: "trainer-2",
      certs: ["NSCA-CSCS", "UK Strength & Conditioning Assoc."],
      langs: ["English", "Igbo"], avail: "Weekday mornings",
      blurb: "Ex collegiate thrower turned S&C coach. I build strength that shows up in life, not just on a mirror.",
      results: ["+42kg average squat in 12 weeks", "Rehabbed 30+ return to lift clients"]
    },
    {
      id: "tunde-bakare", name: "Tunde Bakare", specialty: "Fat Loss & Conditioning", city: "Lagos", country: "Nigeria",
      rating: 4.8, reviews: 143, rateNgn: 9000, years: 7, verified: true, photo: "trainer-1",
      certs: ["NASM-CPT", "Precision Nutrition L1"],
      langs: ["English", "Yoruba"], avail: "Evenings & weekends",
      blurb: "Sustainable fat loss without crash diets. Habits first, aesthetics follow.",
      results: ["120+ clients coached", "Avg 8kg fat loss in 16 weeks"]
    },
    {
      id: "zainab-musa", name: "Zainab Musa", specialty: "Pre & Post Natal", city: "Abuja", country: "Nigeria",
      rating: 5.0, reviews: 64, rateNgn: 11000, years: 6, verified: true, photo: "trainer-4",
      certs: ["Girls Gone Strong CPS", "NASM-CPT"],
      langs: ["English", "Hausa"], avail: "Flexible",
      blurb: "Safe, strong pregnancy and postpartum training. Every plan is built around your stage.",
      results: ["180+ pre/post natal clients", "Zero injury record across 6 years"]
    },
    {
      id: "kwame-asante", name: "Kwame Asante", specialty: "Hypertrophy", city: "Accra", country: "Ghana",
      rating: 4.9, reviews: 112, rateNgn: 10000, years: 8, verified: true, photo: "trainer-3",
      certs: ["ISSA Bodybuilding Specialist", "NASM-CPT"],
      langs: ["English", "Twi"], avail: "Weekday afternoons",
      blurb: "Evidence based muscle building. Progressive overload, tracked to the rep.",
      results: ["3 national physique podiums", "Avg +5kg lean mass in 20 weeks"]
    },
    {
      id: "naledi-dlamini", name: "Naledi Dlamini", specialty: "Mobility & Rehab", city: "Cape Town", country: "South Africa",
      rating: 4.9, reviews: 76, rateNgn: 13000, years: 11, verified: true, photo: "member-7",
      certs: ["BSc Physiotherapy", "FRC Mobility Specialist"],
      langs: ["English", "Zulu"], avail: "Mornings",
      blurb: "Movement that lasts a lifetime. I get you out of pain and back under the bar.",
      results: ["500+ rehab clients", "Specialist in return to sport"]
    },
    {
      id: "james-otieno", name: "James Otieno", specialty: "Endurance", city: "Nairobi", country: "Kenya",
      rating: 4.8, reviews: 91, rateNgn: 8500, years: 10, verified: false, photo: "member-8",
      certs: ["IAAF Endurance Coach", "NASM-CPT"],
      langs: ["English", "Swahili"], avail: "Early mornings",
      blurb: "Marathon and half marathon coaching from a former national team runner.",
      results: ["Coached 40+ marathon PRs", "Sub-3 club record holders"]
    }
  ];

  /* ---- Reviews (star ratings, shown across the site) ---- */
  var REVIEWS = [
    { name: "Chidi E.", avatar: "member-1", rating: 5, where: "Lagos · Premium member", date: "Oct 2026",
      title: "My Workout Log is unfairly effective",
      text: "I've quit four fitness apps. This one just quietly shows me the number to beat and I actually show up. 62-day streak and counting." },
    { name: "Aisha B.", avatar: "member-2", rating: 5, where: "Nairobi · Found 3 gyms", date: "Sep 2026",
      title: "Found my gym in 20 seconds",
      text: "Moved cities and found a clean, open gym near me before my行李 landed. The live equipment status meant no queues on my first visit." },
    { name: "Marcus O.", avatar: "trainer-1", rating: 5, where: "Trainer · Lagos", date: "Oct 2026",
      title: "Booked out my mornings",
      text: "Since listing on Gym Badge my mornings are full. Clients find me by specialty, and the verified badge does the trust building for me." },
    { name: "Priya N.", avatar: "member-3", rating: 4, where: "London · Premium member", date: "Aug 2026",
      title: "My Plate Truth stopped my 9pm slips",
      text: "Seeing the calories before I eat is the only thing that's ever worked. Would love a barcode scanner next." },
    { name: "Tolu A.", avatar: "member-4", rating: 5, where: "Abuja · Elite member", date: "Sep 2026",
      title: "Body Goals got me through the doubt",
      text: "The projection isn't a promise, but seeing week-10 made week-1 feel worth it. Down 11kg and stronger than pre baby." },
    { name: "Sam K.", avatar: "member-5", rating: 5, where: "Accra · Gym partner", date: "Oct 2026",
      title: "Cut our no shows by a third",
      text: "We run 3 branches on the Business seats. Bookings plus live floor status genuinely filled our off peak slots." }
  ];

  /* ---- FAQ (grouped) ---- */
  var FAQS = [
    { group: "Getting started", items: [
      ["What is Gym Badge?", "Gym Badge is a health and fitness product: a marketing website plus an installable web app for logging workouts, scanning meals, checking equipment status and finding gyms near you."],
      ["Is Gym Badge free?", "Yes — the Starter plan is free forever: generous daily logging, food scans and body projections while we test, and the gym locator with bookings at no cost."],
      ["Do I need to download it from an app store?", "There's no store app. Gym Badge runs in your browser and installs to your home screen from there, on iOS and Android alike."],
      ["What is in the app?", "My Profile for your details, My Routine for your training week, The Guides for every movement explained, My Workout Log for logging what you finish, Gym Equipment for live machine status, My Plate Truth for food explained, Body Goals for your goal physique, Find a Gym and My Trainer for booking."],
      ["Does Gym Badge work on iPhone and Android?", "Yes — the same app runs on both through your browser, and your account syncs across them once you sign in."],
      ["Is Gym Badge a medical device?", "No. Gym Badge is a wellness product and doesn't give medical advice — talk to a qualified professional before starting any new program."]
    ]},
    { group: "Accounts, sign in & security", items: [
      ["How do I create an account?", "Sign up with your full name, email and a password of at least 8 characters that mixes letters and numbers, then confirm your email."],
      ["My verification email hasn't arrived", "The verification link is sent as soon as you sign up and expires 24 hours later — check your spam folder first, then ask gymbadgesupport@gmail.com for a fresh one."],
      ["I forgot my password", "Use the forgot password link to get a reset link by email. It expires 1 hour after it's sent, so open it right away."],
      ["Can I sign in with Google or Yahoo?", "Yes — social sign in with Google and Yahoo is built in, and switches on once the OAuth client IDs are configured."],
      ["What is identity verification?", "An optional step on your account page: you can add a NIN, SSN, passport or driving licence. Only the last 4 digits are stored, masked and hashed."],
      ["Do I have to verify my identity to log in?", "No. The verification document is never used as a login credential — you always sign in with your email and password."],
      ["Can I log in with a demo account?", "Demo and instant accounts have been removed. Every account now uses real credentials that you create yourself."]
    ]},
    { group: "Using the app", items: [
      ["My Profile", "My Profile is the onboarding step where you pick who you are — an individual member, a gym company or a trainer — so the app sets up the right profile for you. It is also where you change your picture, your plan and your preferences. A photo is always optional."],
      ["My Plate Truth", "My Plate Truth is our food education tool. Photograph your plate and it estimates what is on it, then explains it in plain language — what the food is, what it does for you, how it fits your goal, portion sizes, swaps and allergens. Starter includes unlimited scans while we test."],
      ["What is Body Goals?", "Body Goals projects how your body could look toward a goal you set. Every projection is watermarked 'not a guarantee', and Starter includes unlimited projections while we test."],
      ["What is Find a Gym?", "Find a Gym is the gym locator and booking tool — search gyms around you and reserve a slot. It's free on every plan."],
      ["Does the app work offline?", "Yes — Gym Badge is offline first, so logging keeps working without a connection, and your data syncs once you're back online and signed in."],
      ["Can I use it on more than one device?", "Yes. Sign in on your phone, tablet or laptop and your logs and photos sync across all of them."]
    ]},
    { group: "Training & tracking", items: [
      ["How does My Workout Log work?", "Log any exercise — push ups, a treadmill run, a lift. Next session Gym Badge shows your last number and nudges you to beat it by one."],
      ["What is Gym Equipment?", "Tap your phone to the NFC tag on a piece of equipment and Gym Equipment shows its live status before you walk over to it, along with a full written report if the machine is not available."],
      ["What do the equipment statuses mean?", "A machine can show as usable, in maintenance, faulty, overused or free, so you know what's ready before you queue."],
      ["How many workouts can I log a day for free?", "Starter includes unlimited workout logs while we test. Premium keeps it that way, forever."],
      ["What counts as a workout log?", "Any session you record — a strength set, a run, a class. Each entry saves the exercise and your numbers so My Workout Log can compare next time."],
      ["Is this a medical device?", "No. Gym Badge is a wellness product, not a medical device, and it doesn't provide medical advice."]
    ]},
    { group: "Premium plan", items: [
      ["How much does Premium cost?", "₦5,000 a month, displayed in your local currency — 16 currencies are supported, including USD, GBP, EUR, GHS, KES, ZAR, EGP, INR and AED, at indicative FX rates."],
      ["What's included in Premium?", "Unlimited workout logging and history, live Gym Equipment status, unlimited My Plate Truth scans and Body Goals projections, wearable sync, smart reminders and live chat support."],
      ["What's free and what's paid?", "Starter stays free forever with generous logging, food scans and body projections while we test, plus the gym locator and bookings. Premium removes every limit permanently."],
      ["How can I pay?", "Stripe is the main route — credit or debit card, Apple Pay, Google Pay and bank transfer — with Pi Network and USDT/USDC stablecoins as alternatives."],
      ["Are card payments safe?", "Yes. Payments run through Stripe, so your card details never touch Gym Badge's servers. The payment flow is still in test mode until the merchant's live keys are added."],
      ["Why does my price differ from ₦5,000?", "Local prices are converted at indicative exchange rates, so the figure in your currency can move slightly with the market. The amount shown to you is the amount you pay."],
      ["Can I cancel anytime?", "Yes. Monthly plans cancel anytime and simply stop renewing, and the free Starter plan stays free forever."],
      ["Do you have refunds?", "Monthly plans won't renew once cancelled. Annual plans are pro rated within 30 days — contact gymbadgesupport@gmail.com and we'll sort it out."]
    ]},
    { group: "Gyms, trainers & corporate", items: [
      ["Can I run Gym Badge for my gym or company?", "Yes. Corporate seat packages come in 5, 10 and 20+ seats, and scale up as your team grows."],
      ["What's in a corporate package?", "Equipment backend access, NFC kits for Gym Equipment, member bookings, and an admin dashboard for your team."],
      ["I'm a trainer — can I join?", "Yes. Choose Trainer during My Profile and you will need a photograph, your location, the services you offer, whether you train in person, online or both, your qualifications and a booking contact number. Applications are reviewed by our team, so you carry a pending status until you are approved, and only approved trainers show as verified."],
      ["How do I find a gym near me?", "Find a Gym lists gyms around you and is free on every plan — search, compare and pick one. My Trainer does the same for coaches, with a verified badge once their qualifications have been checked."],
      ["Can I book a gym or a trainer from the app?", "Yes. Gym and trainer bookings are free on Starter and Premium alike, and everything you have booked shows up in your profile under My Trainer."]
    ]},
    { group: "Photos, data & privacy", items: [
      ["Can I add progress photos?", "Yes — members can add weekly fitness and progress images from the app profile. They appear right away, and you can delete them whenever you like."],
      ["Do I have to upload a photo?", "No. Photos are optional and consent gated; adding one simply makes your Body Goals projection richer. You can upload, replace or remove your picture at any time."],
      ["What happens to my photos?", "They're encrypted, used only to generate your projection, and never sold. You can remove them from your profile at any time."],
      ["What happens to my training data?", "Your logs are yours. We don't sell your data, and you can delete your content whenever you want."],
      ["Are the body projections real results?", "They illustrate a goal rather than a promise — every projection is watermarked 'not a guarantee'. Real results depend on your own training and consistency."]
    ]},
    { group: "Support & troubleshooting", items: [
      ["How do I contact support?", "Email gymbadgesupport@gmail.com and we'll reply within 1 business day. There is also a live assistant in the app that can answer most questions straight away."],
      ["Is there live chat?", "Live chat is available to Premium members, and everyone else can reach us by email at gymbadgesupport@gmail.com. The in app assistant answers account, workout, nutrition, trainer and plan questions for every member."],
      ["How do I put Gym Badge on my home screen?", "Open the site in your browser, tap the share menu and choose Add to Home Screen. It works the same on iOS and Android."],
      ["Why aren't my logs showing on my other device?", "Gym Badge syncs once you're signed in — check that both devices use the same account and are back online. Offline entries upload as soon as you reconnect."],
      ["Which browsers work with Gym Badge?", "Any modern browser on iOS, Android or desktop. Nothing needs to be installed from a store."]
    ]}
  ];

  /* ---- Trust / compliance badges ---- */
  var TRUST = [
    ["lock", "Encrypted & private", "Logs and photos are encrypted. We never sell your data."],
    ["shield", "Verified coaches", "Certifications checked once, trusted by every member."],
    ["card", "Secure card payments", "Card data never touches our servers."],
    ["globe", "Works worldwide", "35 languages, offline first, usable in any market."]
  ];

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  global.GBCatalog = {
    GYMS: GYMS, COACHES: COACHES, REVIEWS: REVIEWS, FAQS: FAQS, TRUST: TRUST,
    gym: function (id) { return byId(GYMS, id); },
    coach: function (id) { return byId(COACHES, id); }
  };
})(typeof window !== "undefined" ? window : this);
