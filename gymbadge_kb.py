"""GYM BADGE — support knowledge base and retrieval

Everything the assistant is allowed to say lives here. The AI model is given
retrieved passages as its only source of truth, so it answers from Gym
Badge's real behaviour instead of inventing policies, prices or features.

If no AI key is configured the assistant still works: it answers directly
from this knowledge base, and says clearly when it does not know.
"""

from __future__ import annotations

import re
from typing import Iterable

# --------------------------------------------------------------------------
# Knowledge base
# Each entry: (topic, keywords, answer)
# --------------------------------------------------------------------------

KNOWLEDGE: list[tuple[str, list[str], str]] = [
    ("Account creation", ["sign up", "signup", "register", "create account", "join", "new account"],
     "Creating an account takes about a minute. Enter your full name, your email address and a password of at "
     "least 8 characters that mixes letters and numbers, then choose whether you are joining as an individual, "
     "a gym or a trainer. We email you a confirmation link straight away, and your badge activates when you "
     "open it. The link works once and expires after 24 hours."),

    ("Signing in", ["sign in", "log in", "login", "cannot sign in", "can't sign in"],
     "Sign in on the website with the Sign in button in the top right, or inside the app with the account "
     "screen. You can also use Google or Yahoo if those are enabled on your deployment. If you are signed in on "
     "one device, signing in on another with the same account syncs your logs, plans and photos across both."),

    ("Password reset", ["forgot password", "reset password", "password reset", "lost password", "change password"],
     "On the sign in page, tap Forgot password and enter the email on your account. We send a reset link that "
     "works once and expires after one hour, so open it straight away. From inside the app, go to the You tab, "
     "then Settings, then Security, where you can also change your password while you are signed in. For your "
     "protection we never say whether an email address is registered, and changing or resetting your password "
     "signs out every other device."),

    ("Email confirmation", ["verify email", "confirmation", "verification email", "did not get email", "resend"],
     "If the confirmation email has not arrived, check your spam folder first, then use the Resend verification "
     "email button on the sign up page or in Settings. The link expires 24 hours after it is sent, and a fresh "
     "one can be requested at any time."),

    ("My Plan", ["my plan", "plan", "workout plan", "schedule", "training week", "add day", "add exercise"],
     "My Plan is your own training week. Use the Day, Week, Month and 12 weeks buttons to move between ranges, "
     "then use Add Exercise to put movements from the Workout Library into a day. You can set sets, reps, rest "
     "and your own notes, edit or remove anything, and mark a session done when you finish it. If you create a "
     "brand new exercise it stays private to you. You can send it to the shared library for review, and it only "
     "appears for everyone once the Gym Badge team has approved it."),

    ("Workout Library", ["library", "exercise library", "how to do", "exercise instructions", "form", "technique"],
     "The Workout Library holds every movement with a full guide: what the exercise is for, which muscles it "
     "works, the equipment you need, your starting position, step by step instructions, sets, reps and rest, how "
     "to breathe, the mistakes people usually make, safety notes and easier versions. Every exercise also has a "
     "photo gallery you can swipe through. It is written for beginners, because most people training with Gym "
     "Badge have never had a coach. Progress depends on your own circumstances, your consistency, your recovery "
     "and your nutrition, so start at the level that lets you keep good form."),

    ("Exercise Tracker", ["log", "log a set", "record", "tracker", "beat your best"],
     "The Exercise Tracker records what you actually did. Open any exercise, enter the number you managed, and "
     "Gym Badge remembers it. Next session it shows your last number and sets a target to beat, so you always "
     "know exactly what you are aiming for."),

    ("Gym Equipment", ["equipment", "tap in", "nfc", "machine status", "under maintenance", "faulty", "is it broken"],
     "Gym Equipment shows the live status of every machine before you walk over to it: usable, under maintenance, "
     "not usable, faulty or overused. If a machine is not available, open it and you get the full written status "
     "report, which says why it is out of service, what was reported, when it was reported, when it is expected "
     "back if that is known, any safety notice, the last update and who is handling it. When the gym has not "
     "given a reason or a return date, we say that rather than making one up."),

    ("Nutrition Guide", ["nutrition", "food", "meal", "calories", "protein", "carbs", "eat"],
     "The Nutrition Guide explains food in plain language rather than just numbers. For each food you get the "
     "photograph, the usual ingredients, a portion size, what it is and how it is cooked, what it actually does "
     "for your body, how it fits common goals, practical serving sizes, swaps, allergens, cultural variations and "
     "meal combinations. It is general nutrition education, not a personalised diet plan, and it never claims a "
     "single food causes weight loss or muscle gain. For medical or dietary advice, speak to a qualified "
     "professional."),

    ("Find a Trainer", ["find a trainer", "trainer", "coach", "booking", "book a session", "personal trainer"],
     "Find a Trainer lists coaches you can book with. Search by name or specialty, filter by in person or online, "
     "and open a profile to see their qualifications, where they work, how they deliver sessions and what a "
     "session costs. Verified trainers have had their qualifications checked. To book, open a profile, tap Book a "
     "session and pick a time. Your booked trainer, upcoming sessions and earlier sessions all appear in the You "
     "tab under Your Trainer."),

    ("Becoming a trainer", ["apply as trainer", "join as trainer", "trainer application", "become a coach"],
     "Trainer sign up asks for more than a member account, because members need to trust the person they are "
     "booking. You need a profile photograph, your name and professional headline, where you work, the services "
     "you offer, whether you train in person, online or both, your qualifications and certifications, your years "
     "of experience and a contact number for bookings. Your contact number is only shared with a member once they "
     "book you, never publicly. Applications are reviewed by the team, so you will carry a pending status until "
     "an administrator approves it. Only approved trainers are shown as verified."),

    ("Body Goals", ["body goals", "tomorrow you", "projection", "physique", "goal body", "weight goal"],
     "Body Goals shows you an illustration of what you are working towards. You pick a goal physique and Gym "
     "Badge shows the plan and an image to aim at. Every projection is watermarked as an illustration and not a "
     "guarantee, because real results depend on your own training, consistency, recovery and nutrition."),

    ("Find a Gym", ["find a gym", "gym", "gyms near me", "book a slot", "your floor"],
     "Find a Gym shows gyms around you with their live open status, amenities and reviews, and lets you reserve "
     "a slot. It is free on every plan."),

    ("Plans and pricing", ["price", "pricing", "cost", "how much", "premium", "plan", "subscription", "cancel", "refund"],
     "Gym Badge has a free Starter plan that stays free forever, and a Premium plan that unlocks unlimited "
     "logging and history, the equipment status, unlimited Nutrition Guide scans, unlimited Body Goals "
     "projections, smart reminders and live chat support. You can change or cancel your plan at any time from "
     "your account, and cancelling stops the renewal straight away. The exact amount depends on your country and "
     "the currency you select, so the pricing page is the only place that shows a current figure."),

    ("Language and country", ["language", "translate", "translation", "arabic", "rtl", "country", "dial code"],
     "The language selector is in the footer of the website and in Settings in the app. Every language is listed "
     "with its flag and its name in that language, and you can search for it. The whole app switches immediately, "
     "and right to left languages such as Arabic flip the layout. Your country is a separate setting, because a "
     "country can have several languages, and it is used for your phone number and your local currency."),

    ("Offline use", ["offline", "no internet", "airplane", "sync"],
     "Gym Badge is offline first, so logging a workout keeps working without a connection and syncs when you "
     "are back online. Your images and the app shell are cached on your device."),

    ("Photos and privacy", ["photo", "upload", "avatar", "picture", "privacy", "delete my data", "export"],
     "Photos are always optional for members. You can upload, replace or remove your profile picture whenever "
     "you like, and you can export everything we hold about you as a JSON file or delete it in one tap from "
     "Settings. Photos are encrypted, used only for your own profile, and never sold."),

    ("Troubleshooting", ["error", "not working", "bug", "problem", "issue", "blank screen", "slow"],
     "A few things worth trying: check you are online, force close and reopen the app, and update to the latest "
     "version. If the service worker has cached an old build, clear the site data for Gym Badge and reload. If a "
     "log or photo is missing, check that you are signed in with the same account you used before. If it is "
     "still not right, the assistant can pass it to a human."),

    ("Your Gym Badge Journey", ["journey", "tenure", "how long", "member for", "member since"],
     "Your Gym Badge Journey in the You tab shows how long you have been a member, measured from the day you "
     "created your account. It counts your days, your completed weeks, months and years, and it recalculates every "
     "time you open the app, so it is always accurate."),
]

# Topics that need a human being rather than an answer.
ESCALATION_HINTS = [
    "human", "person", "agent", "complaint", "refund my money", "chargeback",
    "data breach", "hacked", "account taken", "delete everything permanently",
    "sue", "legal", "press", "journalist", "cancel and refund",
]

# Topics where we must not give medical or unsafe exercise advice.
SAFETY_HINTS = [
    "pain", "injury", "injured", "hurt", "aching", "ache", "sharp pain", "bleeding",
    "chest pain", "dizzy", "faint", "numb", "seizure", "hernia", "torn", "fracture",
    "pregnant", "postnatal", "post partum", "back pain", "knee pain", "shoulder pain",
    "unable to move", "cramp", "swelling", "weight loss extreme", "starving",
]

STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "do", "does", "did", "how", "what",
    "where", "when", "why", "can", "could", "i", "my", "me", "you", "your", "to", "of",
    "in", "on", "for", "and", "or", "it", "that", "this", "with", "about", "need",
    "help", "please", "am", "get", "have", "want", "but", "so", "if", "at", "be",
}


def _tokens(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9']+", (text or "").lower())
    return {w for w in words if w not in STOP_WORDS and len(w) > 2}


def retrieve(query: str, limit: int = 3) -> list[dict]:
    """Return the knowledge entries that best match a question."""
    q = _tokens(query)
    if not q:
        return []
    scored = []
    for topic, keywords, body in KNOWLEDGE:
        score = 0.0
        kw = " ".join(keywords).lower()
        for word in q:
            if word in kw:
                score += 2.0
            elif any(word in k for k in keywords):
                score += 1.2
            elif word in body.lower():
                score += 0.4
        if score > 0:
            scored.append({"topic": topic, "body": body, "score": score})
    scored.sort(key=lambda x: -x["score"])
    return scored[:limit]


def context_for(query: str, limit: int = 3) -> str:
    """Build the grounding context handed to the AI model."""
    hits = retrieve(query, limit)
    if not hits:
        return ""
    parts = []
    for i, hit in enumerate(hits, 1):
        parts.append(f"[{i}] {hit['topic']}\n{hit['body']}")
    return "\n\n".join(parts)


def best_answer(query: str) -> dict | None:
    """A direct answer from the knowledge base, with no model involved."""
    hits = retrieve(query, 1)
    if not hits or hits[0]["score"] < 1.2:
        return None
    return hits[0]


def wants_human(query: str) -> bool:
    q = (query or "").lower()
    return any(hint in q for hint in ESCALATION_HINTS)


def mentions_safety(query: str) -> bool:
    q = (query or "").lower()
    return any(hint in q for hint in SAFETY_HINTS)


SAFETY_REPLY = (
    "Thank you for telling me. I am not able to assess an injury or give a diagnosis, and I do not want to "
    "guess with something that matters. Please stop the exercise that is causing it, and speak to a doctor, "
    "physiotherapist or a qualified trainer before you train through it. If the pain is severe, sudden, or comes "
    "with swelling, numbness or dizziness, please get medical attention rather than waiting. You can also email "
    "Gym Badge Support and a human will pick it up."
)

ESCALATION_REPLY = (
    "That one is better handled by a person than by me. Email Gym Badge Support and a member of the team will "
    "reply within one business day."
)

NO_ANSWER_REPLY = (
    "I do not have a confident answer for that one, and I would rather say so than guess. You can email Gym Badge "
    "Support at gymbadgesupport@gmail.com and a human will reply within one business day, or ask me something "
    "else about your account, workouts, exercise technique, nutrition, trainers or plans."
)
