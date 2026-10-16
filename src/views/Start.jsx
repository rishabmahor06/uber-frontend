"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/lib/router";
import BookingWidget from "../components/BookingWidget";
import {
  FiShield,
  FiDollarSign,
  FiClock,
  FiZap,
  FiMapPin,
  FiNavigation,
  FiPhoneCall,
  FiStar,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const logo = "/speed-logo.png";

/* ---------- small illustrations (no external images) ---------- */
const Car = ({ body = "#0b6b2e", className = "" }) => (
  <svg viewBox="0 0 400 170" className={className} role="img" aria-label="Taxi">
    <ellipse cx="200" cy="158" rx="170" ry="9" fill="rgba(0,0,0,.25)" />
    <rect x="165" y="6" width="70" height="20" rx="5" fill="#8ae02c" />
    <text x="200" y="21" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0b1437">
      TAXI
    </text>
    <path
      d="M30 118c0-14 8-24 22-27l40-9 28-34c6-8 14-11 25-11h92c12 0 21 4 28 12l30 33 52 9c14 3 23 12 23 28v14c0 6-4 10-10 10H40c-6 0-10-4-10-10z"
      fill={body}
    />
    <path d="M118 76l22-27c4-5 9-7 16-7h86c7 0 12 2 16 7l24 28z" fill="#bfe3f5" opacity=".9" />
    <path d="M198 42v35" stroke={body} strokeWidth="5" />
    <rect x="40" y="108" width="26" height="9" rx="4" fill="#ffe27a" />
    <rect x="336" y="108" width="24" height="9" rx="4" fill="#ff6b6b" />
    <circle cx="105" cy="136" r="24" fill="#111" />
    <circle cx="105" cy="136" r="11" fill="#ccc" />
    <circle cx="298" cy="136" r="24" fill="#111" />
    <circle cx="298" cy="136" r="11" fill="#ccc" />
  </svg>
);

const Phone = ({ className = "" }) => (
  <svg viewBox="0 0 160 300" className={className} role="img" aria-label="Speed app">
    <rect x="4" y="4" width="152" height="292" rx="26" fill="#0b1437" />
    <rect x="14" y="22" width="132" height="258" rx="16" fill="#eef6ee" />
    <rect x="14" y="22" width="132" height="150" rx="16" fill="#cfe9c8" />
    <path d="M30 150c20-40 40-10 60-50s30-20 44-50" stroke="#0b1437" strokeWidth="5" fill="none" />
    <circle cx="30" cy="150" r="8" fill="#3f9d0a" />
    <rect x="124" y="48" width="14" height="14" rx="3" fill="#0b1437" />
    <rect x="26" y="184" width="108" height="14" rx="7" fill="#fff" />
    <rect x="26" y="206" width="108" height="14" rx="7" fill="#fff" />
    <rect x="26" y="234" width="108" height="30" rx="15" fill="#8ae02c" />
  </svg>
);

const Avatar = ({ emoji, bg = "bg-brand-mint", className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-3xl text-7xl ${bg} ${className}`}
    aria-hidden="true"
  >
    {emoji}
  </div>
);

const SectionTitle = ({ title, sub, light }) => (
  <div className="mx-auto mb-10 max-w-2xl text-center">
    <h2 className={`text-3xl font-semibold sm:text-4xl ${light ? "text-white" : "text-brand-navy"}`}>
      {title}
    </h2>
    {sub && (
      <p className={`mt-3 text-base ${light ? "text-white/70" : "text-gray-500"}`}>{sub}</p>
    )}
  </div>
);

const Btn = ({ children, to, onClick, variant = "lime", className = "" }) => {
  const styles =
    variant === "lime"
      ? "bg-brand-lime text-brand-navy hover:bg-brand-limeDark"
      : variant === "navy"
      ? "bg-brand-navy text-white hover:bg-black"
      : variant === "outline"
      ? "border border-gray-300 text-brand-navy hover:bg-gray-50"
      : "border border-white/40 text-white hover:bg-white/10";
  const cls = `inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-bold transition ${styles} ${className}`;
  return to ? (
    <Link to={to} className={cls}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
};

/* ---------- page ---------- */
const NAV = [
  ["Home", "#home"],
  ["Features", "#features"],
  ["Pricing", "#fares"],
  ["How it works", "#how"],
  ["Contact", "#contact"],
];

const Start = () => {
  const { data: session, status } = useSession();
  const [menu, setMenu] = useState(false);

  const isUser = status === "authenticated" && session.role === "user";
  const isCaptain = status === "authenticated" && session.role === "captain";
  // Ride booking (map UI) is only available after login.
  const bookTo = isUser ? "/home" : isCaptain ? "/captain-home" : "/userlogin";

  return (
    <div id="home" className="bg-white text-brand-navy">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#home" className="flex items-center gap-2">
            <img src={logo} alt="Speed" className="h-9 w-9 object-contain" />
            <span className="text-lg font-extrabold">
              Speed <span className="text-brand-forest">Taxi</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex">
            {NAV.map(([label, href]) => (
              <a key={label} href={href} className="hover:text-black">
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {isUser || isCaptain ? (
              <Btn to={bookTo} variant="navy" className="!py-2">
                Open app
              </Btn>
            ) : (
              <>
                <Link to="/userlogin" className="text-sm font-semibold hover:text-brand-forest">
                  Log in
                </Link>
                <Btn to="/usersignup" variant="navy" className="!py-2">
                  Sign up
                </Btn>
              </>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-2xl md:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-label="Toggle menu"
          >
            {menu ? <FiX /> : <FiMenu />}
          </button>
        </div>
        {menu && (
          <div className="space-y-1 border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
            {NAV.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenu(false)}
                className="block rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-50"
              >
                {label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              {isUser || isCaptain ? (
                <Btn to={bookTo} variant="navy" className="w-full">
                  Open app
                </Btn>
              ) : (
                <>
                  <Btn to="/userlogin" variant="outline" className="flex-1">
                    Log in
                  </Btn>
                  <Btn to="/usersignup" variant="navy" className="flex-1">
                    Sign up
                  </Btn>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===== REQUEST A RIDE (top of page) ===== */}
      <BookingWidget />

      {/* ===== WHY CHOOSE ===== */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle
          title="Why Choose Speed?"
          sub="Affordable fares, safe rides and drivers you can trust — every trip."
        />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            [FiShield, "Safety", "Verified captains and OTP-protected rides."],
            [FiDollarSign, "Affordability", "Upfront prices — no surprises."],
            [FiClock, "24/7 Support", "Help is always one tap away."],
            [FiZap, "Speed", "Nearest captain matched in seconds."],
          ].map(([Icon, title, text]) => (
            <div key={title} className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-mint text-2xl text-brand-forest">
                <Icon />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DRIVING TOWARD ===== */}
      <section className="bg-brand-mint">
        <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <div className="mb-2 flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className="fill-current" />
              ))}
            </div>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Driving You Toward Your Destination
            </h2>
            <p className="mt-3 max-w-md text-gray-600">
              See your captain arrive on a live map, share the OTP and ride with
              confidence. Track every kilometre until you reach.
            </p>
            <Btn to={bookTo} className="mt-6">
              Learn more
            </Btn>
          </div>
          <Avatar emoji="🧑‍✈️" bg="bg-white shadow-lg" className="mx-auto h-64 w-full max-w-sm" />
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle title="Our Services" sub="A ride for every budget and every trip." />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            ["🏍️", "Bike", "Quick rides through traffic", 10],
            ["🛺", "Auto", "Affordable everyday rides", 20],
            ["🚗", "Car", "Comfortable AC cabs", 40],
          ].map(([icon, name, text, from]) => (
            <div key={name} className="rounded-2xl border border-gray-200 bg-brand-mint/60 p-6 text-center">
              <div className="text-6xl">{icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{name}</h3>
              <p className="text-sm text-gray-500">{text}</p>
              <p className="mt-3 text-2xl font-extrabold">
                <span className="text-sm font-medium text-gray-500">from </span>₹{from}
              </p>
              <Btn to={bookTo} className="mt-4 w-full">
                Order now
              </Btn>
            </div>
          ))}
        </div>
      </section>

      {/* ===== APP ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-3xl bg-brand-mint p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">The Speed App</h2>
            <p className="mt-3 max-w-md text-gray-600">
              Search any place with live suggestions, see the route and prices for
              every vehicle, and follow your captain in real time.
            </p>
            <Btn to={bookTo} className="mt-6">
              Open the app
            </Btn>
          </div>
          <div className="flex justify-center gap-4">
            <Phone className="h-72 -rotate-6" />
            <Phone className="mt-8 hidden h-72 rotate-6 sm:block" />
          </div>
        </div>
      </section>

      {/* ===== NUMBERS ===== */}
      <section className="bg-brand-navy py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle light title="Numbers Speak" sub="Trusted by riders and captains across the city." />
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              ["1,300K", "Happy customers"],
              ["700K", "Rides completed"],
              ["1,000+", "Verified captains"],
              ["130+", "Cities served"],
            ].map(([n, label]) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-brand-lime sm:text-4xl">{n}</p>
                <p className="mt-1 text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== READY TO RIDE ===== */}
      <section className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">Ready to Ride?</h2>
          <p className="mt-3 max-w-md text-gray-600">
            Your next ride is a few taps away. Pick a destination and we'll do
            the rest.
          </p>
          <Btn to={bookTo} className="mt-6">
            Get started
          </Btn>
        </div>
        <Car body="#e8edf2" className="mx-auto w-full max-w-sm" />
      </section>

      {/* ===== FARES ===== */}
      <section id="fares" className="bg-brand-mint py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle
            title="Check Out Our Fares"
            sub="Fare = base + distance + time. You always see the exact price before you book."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              ["Bike", "🏍️", 10, "₹8 / km", false],
              ["Auto", "🛺", 20, "₹7 / km", true],
              ["Car", "🚗", 40, "₹12 / km", false],
            ].map(([name, icon, base, perKm, featured]) => (
              <div
                key={name}
                className={`rounded-2xl p-6 text-center shadow-sm ${
                  featured ? "bg-brand-navy text-white" : "bg-white"
                }`}
              >
                <div className="text-5xl">{icon}</div>
                <h3 className="mt-2 text-lg font-semibold">{name}</h3>
                <p className="mt-3 text-3xl font-extrabold">₹{base}</p>
                <p className={`text-sm ${featured ? "text-white/70" : "text-gray-500"}`}>
                  base fare + {perKm}
                </p>
                <Btn to={bookTo} className="mt-5 w-full">
                  Book now
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIAL ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle title="What Our Customers Say" sub="Real stories from riders who travel with Speed." />
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          {[
            ["Priya S.", "Office commuter", "Booked in seconds and the captain arrived before the ETA. The live tracking is brilliant."],
            ["Rahul M.", "Weekend traveller", "Upfront fares and a clean route on the map. No haggling, no surprises."],
          ].map(([name, role, text]) => (
            <figure key={name} className="rounded-2xl bg-brand-mint p-6">
              <div className="mb-3 flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700">“{text}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy font-bold text-white">
                  {name[0]}
                </span>
                <span>
                  <span className="block text-sm font-bold">{name}</span>
                  <span className="block text-xs text-gray-500">{role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <SectionTitle title="How It Works" sub="Four simple steps from tap to destination." />
        <ol className="space-y-5">
          {[
            [FiMapPin, "Pickup location", "Allow location access or search any address."],
            [FiNavigation, "Drop-off location", "Type your destination and pick it from the suggestions."],
            [FiDollarSign, "Choose your ride", "See the route, distance and price for bike, auto and car."],
            [FiZap, "Request & track", "A nearby captain accepts — follow them live on the map."],
          ].map(([Icon, title, text], i) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-mint text-xl text-brand-forest">
                <Icon />
              </span>
              <div>
                <h3 className="font-semibold">
                  {i + 1}. {title}
                </h3>
                <p className="text-sm text-gray-500">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== EARN ===== */}
      <section className="bg-brand-navy">
        <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <Avatar emoji="😎" bg="bg-white/10" className="mx-auto h-56 w-full max-w-xs" />
          <div className="text-white">
            <h2 className="text-3xl font-semibold sm:text-4xl">Earn More, Drive With Speed</h2>
            <p className="mt-3 max-w-md text-white/70">
              Be your own boss. Accept rides near you, keep your earnings and
              drive on your own schedule.
            </p>
            <Btn to="/captainsignup" className="mt-6">
              Register now
            </Btn>
          </div>
        </div>
      </section>

      {/* ===== NEWS ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle title="News & Updates" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            ["📱", "Live tracking, now smoother", "Follow your captain on the map with real-time updates."],
            ["🗺️", "Better address search", "Faster place suggestions with full addresses."],
            ["🌆", "Expanding to more cities", "Speed is coming to new neighbourhoods near you."],
          ].map(([icon, title, text]) => (
            <article key={title} className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="flex h-36 items-center justify-center bg-brand-mint text-6xl">{icon}</div>
              <div className="p-4">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== CALL + FOOTER ===== */}
      <section id="contact" className="bg-brand-navy text-white">
        <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-6 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">Call Now and Book Your Taxi for Next Ride</h2>
            <p className="mt-3 text-white/70">Our team is available 24/7 to help you out.</p>
            <a href="tel:+919005858789" className="mt-5 inline-flex items-center gap-3 text-xl font-bold">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-lime text-brand-navy">
                <FiPhoneCall />
              </span>
              +91 900 585 8789
            </a>
          </div>
          <Car body="#f4f6f8" className="mx-auto w-full max-w-sm" />
        </div>

        <footer className="border-t border-white/10">
          <div className="mx-auto grid grid-cols-1 max-w-6xl gap-8 px-4 py-10 text-sm sm:px-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              ["Company", ["About us", "Careers", "Press"]],
              ["Ride", ["Bike", "Auto", "Car"]],
              ["Support", ["Help centre", "Safety", "Contact us"]],
            ].map(([head, links]) => (
              <div key={head}>
                <h4 className="mb-3 font-bold">{head}</h4>
                <ul className="space-y-2 text-white/60">
                  {links.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="mb-3 font-bold">Social</h4>
              <div className="flex gap-3 text-lg">
                {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                  <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <Icon />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="border-t border-white/10 py-4 text-center text-xs text-white/50">
            © {new Date().getFullYear()} Speed Taxi. All rights reserved.
          </p>
        </footer>
      </section>
    </div>
  );
};

export default Start;
