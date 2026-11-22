import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  ChevronDown,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  MapPin,
  Menu,
  Moon,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  Wind,
  X,
} from "lucide-react";

const STARTING_CITY = {
  name: "Lisbon",
  country: "Portugal",
  latitude: 38.7223,
  longitude: -9.1393,
  timezone: "Europe/Lisbon",
};

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

function description(code) {
  return weatherDescriptions[code] ?? "Partly cloudy";
}

function isRainCode(code) {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
}

function WeatherIcon({ code = 2, size = 25, className = "" }) {
  const props = { size, strokeWidth: 1.8, className };
  if ([0, 1].includes(code)) return <Sun {...props} />;
  if (code === 2) return <CloudSun {...props} />;
  if (code === 3) return <Cloud {...props} />;
  if ([45, 48].includes(code)) return <CloudFog {...props} />;
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle {...props} />;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain {...props} />;
  if (code >= 95) return <CloudLightning {...props} />;
  return <Cloud {...props} />;
}

function formatTime(dateString, timeZone, options = { hour: "numeric" }) {
  const safeTimeZone = timeZone && timeZone !== "auto" ? timeZone : undefined;
  return new Intl.DateTimeFormat("en", { ...options, timeZone: safeTimeZone }).format(new Date(dateString));
}

function temperature(value, unit, decimals = 0) {
  const converted = unit === "F" ? (value * 9) / 5 + 32 : value;
  return `${Number(converted).toFixed(decimals)}°`;
}

async function getWeather(city) {
  const query = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone || "auto",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`);
  if (!response.ok) throw new Error("Weather data is temporarily unavailable.");
  return response.json();
}

async function searchCity(value) {
  const query = new URLSearchParams({ name: value, count: "6", language: "en", format: "json" });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${query}`);
  if (!response.ok) throw new Error("City search is temporarily unavailable.");
  const data = await response.json();
  return (data.results ?? []).map((place) => ({
    name: place.name,
    country: place.country,
    admin1: place.admin1,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  }));
}

function HeroWeather({ isDay, showRain, temperatureC, weatherCode, windSpeed }) {
  const isSnow = weatherCode >= 71 && weatherCode <= 86;
  const isStorm = weatherCode >= 95;
  const isHot = temperatureC != null && temperatureC >= 30;
  const isCold = temperatureC != null && temperatureC <= 12;
  const isWindy = windSpeed != null && windSpeed >= 25;
  const mood = isStorm ? "storm" : showRain ? "rain" : isSnow ? "snow" : isHot ? "hot" : isCold ? "cold" : "mild";
  const moodLabel =
    mood === "storm" ? "Let’s stay cozy"
      : mood === "rain" ? "Splish, splash!"
      : mood === "snow" ? "Snow day magic!"
      : mood === "hot" ? "So warm outside!"
      : mood === "cold" ? "Bundle me up!"
      : isWindy ? "Hold onto my hat!"
      : isDay ? "A lovely day!" : "Sweet night!";
  const outfit =
    mood === "rain" ? "#78a9c5"
      : mood === "snow" ? "#91bad1"
      : mood === "storm" ? "#8787b5"
      : isHot ? "#ed9a70"
      : isCold ? "#91aac8"
      : "#dfad68";
  const motion =
    mood === "rain" ? "animate-[buddy-roam-rain_12s_ease-in-out_infinite]"
      : mood === "snow" ? "animate-[buddy-roam-snow_15s_ease-in-out_infinite]"
      : mood === "storm" ? "animate-[buddy-roam-storm_8s_ease-in-out_infinite]"
      : isHot ? "animate-[buddy-roam-hot_11s_ease-in-out_infinite]"
      : isCold ? "animate-[buddy-roam-cold_13s_ease-in-out_infinite]"
      : "animate-[buddy-roam_13s_ease-in-out_infinite]";

  return (
    <div className={`pointer-events-none absolute right-0 top-0 h-[285px] w-full overflow-hidden max-[500px]:h-[250px] ${isDay ? "" : "saturate-[.8] brightness-[.88]"}`} aria-hidden="true">
      <div className="absolute right-12 top-6 h-[132px] w-[132px] animate-[glow_4s_ease-in-out_infinite] rounded-full bg-[#edbb7622] blur-[13px]" />
      <div className="absolute right-[19px] top-[57px] h-[100px] w-[186px] animate-[orbit_20s_ease-in-out_infinite_alternate] rounded-[50%] border border-white/[.07] [transform:rotate(-24deg)]" />
      <div className="absolute right-[3px] top-12 h-[112px] w-[216px] animate-[orbit_24s_ease-in-out_infinite_alternate-reverse] rounded-[50%] border border-white/[.07] [transform:rotate(28deg)]" />
      <Sun className="absolute right-[66px] top-[37px] h-[77px] w-[77px] animate-[float_5s_ease-in-out_infinite] fill-[#f8ae55] text-[#ffe2a2] drop-shadow-[0_0_20px_#f4b65b55] max-[500px]:right-[28px] max-[500px]:top-[29px] max-[500px]:h-[53px] max-[500px]:w-[53px]" strokeWidth={1} />
      <CloudSun className="absolute right-8 top-[91px] h-[104px] w-[142px] animate-[float_4s_ease-in-out_infinite] fill-[#f2f6fa] text-[#fff] drop-shadow-[0_12px_9px_#11182755] max-[500px]:right-[5px] max-[500px]:top-[76px] max-[500px]:h-[69px] max-[500px]:w-[91px]" strokeWidth={1.4} />
      <span className="absolute left-[26px] top-[74px] animate-pulse text-xs text-[#ffdc9e]">✦</span>
      <span className="absolute right-[177px] top-[135px] animate-pulse text-[8px] text-[#ffdc9e]">✦</span>
      {showRain && <div className="absolute inset-x-[8px] top-[45px] h-[170px] overflow-hidden">{Array.from({ length: 13 }, (_, index) => <i className="absolute h-[12px] w-[2px] rotate-[14deg] animate-[raindrop_.75s_linear_infinite] rounded-full bg-[#b7def4]/80" style={{ left: `${5 + index * 7.3}%`, top: `${(index % 4) * 18}%`, animationDelay: `${-(index % 6) * .13}s` }} key={index} />)}</div>}
      {isSnow && <div className="absolute inset-x-[8px] top-[55px] h-[150px] overflow-hidden">{Array.from({ length: 12 }, (_, index) => <i className="absolute h-[5px] w-[5px] animate-[snowfall_3.2s_linear_infinite] rounded-full bg-white/90 shadow-[0_0_5px_white]" style={{ left: `${4 + index * 7.8}%`, top: `${(index % 5) * 20}%`, animationDelay: `${-(index % 7) * .38}s` }} key={index} />)}</div>}
      {isStorm && <div className="absolute right-[42px] top-[98px] animate-pulse text-[24px] text-[#ffe08a] drop-shadow-[0_0_9px_#ffd86a]">ϟ</div>}
      <div className={`absolute bottom-[7px] left-[43%] z-[4] w-[102px] ${motion} motion-reduce:animate-none max-[500px]:w-[82px] max-[500px]:bottom-[2px]`} style={{ "--roam-x": "clamp(54px, 17vw, 175px)" }}>
        <div className="animate-[buddy-bounce_1.35s_ease-in-out_infinite] motion-reduce:animate-none">
        <svg className="mx-auto h-[120px] w-[102px] drop-shadow-[0_12px_9px_#10182755] max-[500px]:h-[96px] max-[500px]:w-[82px]" viewBox="0 0 100 120" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="baby-outfit" x1="20" y1="62" x2="78" y2="104" gradientUnits="userSpaceOnUse"><stop stopColor={outfit} /><stop offset="1" stopColor={mood === "hot" ? "#d87563" : mood === "cold" || mood === "snow" || mood === "rain" ? "#547eaa" : "#b77d57"} /></linearGradient>
            <linearGradient id="baby-skin" x1="30" y1="25" x2="71" y2="76" gradientUnits="userSpaceOnUse"><stop stopColor="#FFE5CB" /><stop offset="1" stopColor="#F4B995" /></linearGradient>
            <linearGradient id="baby-hair" x1="28" y1="10" x2="71" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#65483D" /><stop offset="1" stopColor="#352B30" /></linearGradient>
          </defs>
          <ellipse cx="50" cy="113" rx="25" ry="4" fill="#111827" fillOpacity=".23" />
          {mood === "rain" && <path d="M19 38C21 19 34 8 50 8s29 11 31 30H19Z" fill="#78A9C5" stroke="#F7FBFF" strokeWidth="3" />}
          {mood === "rain" && <g className="origin-[50px_30px] animate-[umbrella-sway_2.8s_ease-in-out_infinite]"><path d="M11 45C14 23 30 11 50 11s36 12 39 34H11Z" fill="#F4C86A" stroke="#FFF9E9" strokeWidth="3" /><path d="M50 12v41c0 7 9 7 9 1" stroke="#75543C" strokeWidth="3" strokeLinecap="round" /><path d="M22 34c7-5 13-8 20-9" stroke="white" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" /></g>}
          {mood === "snow" && <path d="M26 34c0-20 10-29 24-29s24 9 24 29H26Z" fill="#80B4D3" stroke="#F7FBFF" strokeWidth="3" />}
          {mood === "snow" && <path d="M27 29c14 5 31 5 46 0" stroke="#E6F7FF" strokeWidth="4" strokeLinecap="round" />}
          {isHot && <path d="M25 34c0-21 11-30 25-30s25 9 25 30H25Z" fill="#D99657" stroke="#FFF7EA" strokeWidth="3" />}
          {isHot && <path d="M24 28c15-6 37-6 52 0" stroke="#FFE0A0" strokeWidth="5" strokeLinecap="round" />}
          {isCold && <path d="M27 32c0-19 9-27 23-27s23 8 23 27" stroke="#9AC9E1" strokeWidth="7" strokeLinecap="round" />}
          {isCold && <><circle cx="27" cy="40" r="8" fill="#739DBD" stroke="#F7FBFF" strokeWidth="3" /><circle cx="73" cy="40" r="8" fill="#739DBD" stroke="#F7FBFF" strokeWidth="3" /></>}
          {mood === "storm" && <path d="M27 40c-8-6-7-18 1-22 2-11 14-15 22-9 10-7 23 0 23 12 9 6 6 18-2 22" fill="#7580A8" stroke="#F7FBFF" strokeWidth="3" />}
          <path d="M37 84v17c0 6 4 9 9 9s8-3 8-8V85" fill="#F4C9A6" stroke="#FFF8F1" strokeWidth="4" strokeLinejoin="round" />
          <path d="M54 85v17c0 6 4 9 9 9s8-3 8-8V84" fill="#F4C9A6" stroke="#FFF8F1" strokeWidth="4" strokeLinejoin="round" />
          <path d="M35 104c-7 0-10 3-10 7 0 3 4 5 13 5 7 0 10-2 10-5 0-4-5-7-13-7Z" fill="#FFF2DC" stroke="#D6A789" strokeWidth="2" />
          <path d="M62 104c-7 0-10 3-10 7 0 3 4 5 13 5 7 0 10-2 10-5 0-4-5-7-13-7Z" fill="#FFF2DC" stroke="#D6A789" strokeWidth="2" />
          <path d="M31 61c-9 2-14 10-14 22v8c0 5 4 8 9 8h48c5 0 9-3 9-8v-8c0-12-5-20-14-22-5 5-11 7-19 7s-14-2-19-7Z" fill="url(#baby-outfit)" stroke="#FFF8F1" strokeWidth="4" strokeLinejoin="round" />
          <path d="M35 67c4 5 9 7 15 7s11-2 15-7" stroke="#FFF3DE" strokeOpacity=".75" strokeWidth="3" strokeLinecap="round" />
          <path d="M43 74h14l4 24H39l4-24Z" fill="#F4C88B" stroke="#FFF3DE" strokeWidth="2.5" strokeLinejoin="round" />
          {mood === "storm" && <path d="m51 78-6 9h6l-3 8 10-12h-6l4-5h-5Z" fill="#FFE17A" />}
          {isSnow && <g fill="#F3FBFF"><circle cx="31" cy="81" r="2.5" /><circle cx="69" cy="86" r="2.5" /><circle cx="56" cy="94" r="2" /></g>}
          <path d="M25 65c-7 1-11 7-8 12 2 4 7 5 12 2l8-8" fill="url(#baby-skin)" stroke="#FFF8F1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M75 65c7 1 11 7 8 12-2 4-7 5-12 2l-8-8" fill="url(#baby-skin)" stroke="#FFF8F1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {(isWindy || (!isHot && !isCold && mood === "mild")) && <g className="origin-[76px_69px] animate-[buddy-wave_.7s_ease-in-out_infinite_alternate]"><path d="m70 69 9-11" stroke={outfit} strokeWidth="8" strokeLinecap="round" /><circle cx="80" cy="57" r="6" fill="#F7C9A7" stroke="#FFF8F1" strokeWidth="2.5" /></g>}
          <circle cx="50" cy="49" r="28" fill="url(#baby-skin)" stroke="#FFF8F1" strokeWidth="4" />
          <path d="M22 46c-3-19 7-34 23-36 8-1 12 3 16 1 10-3 20 7 17 21l-2 10c-4-4-6-8-7-14-9 7-22 9-34 8l-9-2-4 12Z" fill="url(#baby-hair)" stroke="#FFF8F1" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M34 22c1-8 7-13 13-13 5 0 8 3 10 8" stroke="#806052" strokeWidth="4" strokeLinecap="round" />
          <path d="M45 10c0-5 4-8 8-6 4 2 3 7 0 10" fill="#5A4038" stroke="#FFF8F1" strokeWidth="2" />
          <g className="origin-[50px_48px] animate-[buddy-blink_4.8s_ease-in-out_infinite]">
            <ellipse cx="39" cy="47" rx="5.1" ry="6.3" fill="#FFFDF8" />
            <ellipse cx="61" cy="47" rx="5.1" ry="6.3" fill="#FFFDF8" />
            <ellipse cx="40" cy="48" rx="2.8" ry="4.2" fill="#3C3435" />
            <ellipse cx="60" cy="48" rx="2.8" ry="4.2" fill="#3C3435" />
            <circle cx="41" cy="46" r="1.3" fill="white" />
            <circle cx="61" cy="46" r="1.3" fill="white" />
          </g>
          <ellipse cx="32" cy="57" rx="5" ry="3.2" fill="#EB8F86" fillOpacity=".72" />
          <ellipse cx="68" cy="57" rx="5" ry="3.2" fill="#EB8F86" fillOpacity=".72" />
          {isHot ? <ellipse cx="50" cy="60" rx="4" ry="5" fill="#96534D" /> : isCold || mood === "storm" ? <ellipse cx="50" cy="60" rx="3" ry="3.5" fill="#96534D" /> : <path d="M43 59c4 6 11 6 15 0" stroke="#A85C54" strokeWidth="2.5" strokeLinecap="round" />}
          {isHot && <path d="M78 40c-5 6-5 10 0 12 5-2 5-6 0-12Z" fill="#A9E0EF" stroke="#EAFBFF" strokeWidth="1.5" />}
          {isCold && <path d="M28 52c-8-3-10 0-8 4 2 4 7 4 11 1" fill="#EFFAFF" stroke="#FFF" strokeWidth="1.5" />}
          {mood === "storm" && <path d="M72 31c-5 6-5 10 0 12 5-2 5-6 0-12Z" fill="#F5D576" />}
        </svg>
        <span className="mt-[-3px] rounded-full border border-white/10 bg-[#172235]/75 px-[9px] py-[4px] text-[9px] font-semibold tracking-[.1px] text-[#f4d8a8] shadow-sm backdrop-blur-sm max-[500px]:px-[7px] max-[500px]:text-[8px]">{moodLabel}</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [city, setCity] = useState(STARTING_CITY);
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("C");
  const [darkMode, setDarkMode] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const [savedLocationsLoaded, setSavedLocationsLoaded] = useState(false);
  const [savedLocationsOpen, setSavedLocationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("skycast-saved-locations");
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid = Array.isArray(parsed) && parsed.every((place) =>
          typeof place.name === "string"
          && typeof place.latitude === "number"
          && typeof place.longitude === "number"
        );
        if (!valid) throw new Error("Saved locations have an invalid format.");
        setSavedLocations(parsed);
      }
      setSavedLocationsLoaded(true);
    } catch {
      setError("Saved locations could not be loaded from this browser.");
    }
  }, []);

  useEffect(() => {
    if (!savedLocationsLoaded) return;
    try {
      localStorage.setItem("skycast-saved-locations", JSON.stringify(savedLocations));
    } catch {
      setError("Saved locations could not be stored in this browser.");
    }
  }, [savedLocations, savedLocationsLoaded]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getWeather(city)
      .then((data) => {
        if (active) setWeather(data);
      })
      .catch((reason) => {
        if (active) setError(reason.message || "Could not load weather.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [city]);

  useEffect(() => {
    const items = document.querySelectorAll("[data-reveal]:not([data-visible=true])");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => { item.dataset.visible = "true"; });
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.visible = "true";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [Boolean(weather), city.latitude, city.longitude]);

  useEffect(() => {
    if (!searchOpen || query.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    let active = true;
    const timer = setTimeout(() => {
      searchCity(query.trim())
        .then((places) => {
          if (active) setResults(places);
        })
        .catch(() => {
          if (active) setResults([]);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, searchOpen]);

  const current = weather?.current;
  const hourly = useMemo(() => {
    if (!weather?.hourly || !current) return [];
    const currentHour = weather.hourly.time.findIndex((time) => time >= current.time.slice(0, 13));
    const start = Math.max(0, currentHour);
    return weather.hourly.time.slice(start, start + 8).map((time, index) => {
      const i = start + index;
      return {
        time,
        temp: weather.hourly.temperature_2m[i],
        code: weather.hourly.weather_code[i],
        rain: weather.hourly.precipitation_probability[i],
      };
    });
  }, [weather, current]);

  const days = weather?.daily?.time ?? [];
  const isRainingNow = isRainCode(current?.weather_code ?? 0);
  const upcomingRainDays = days.slice(1).filter((_, index) =>
    isRainCode(weather?.daily?.weather_code?.[index + 1] ?? 0)
    || (weather?.daily?.precipitation_probability_max?.[index + 1] ?? 0) >= 50
  ).length;
  const dailyMax = weather?.daily?.temperature_2m_max ?? [];
  const dailyMin = weather?.daily?.temperature_2m_min ?? [];
  const maxTemp = Math.max(...dailyMax);
  const minTemp = Math.min(...dailyMin);
  const rainChance = weather?.daily?.precipitation_probability_max?.[0];
  const uvIndex = weather?.daily?.uv_index_max?.[0];
  const dayTips = [
    {
      icon: CloudRain,
      label: "Rain check",
      title: isRainingNow ? "It’s raining right now" : rainChance == null ? "Forecast unavailable" : rainChance >= 40 ? "Bring an umbrella" : "Mostly dry ahead",
      detail: isRainingNow ? "Take an umbrella if you’re heading out." : rainChance == null ? "We couldn’t get today’s rain outlook." : rainChance >= 40 ? `${rainChance}% chance of rain today — a little preparation goes a long way.` : `${rainChance}% chance of rain today. You can probably leave the umbrella at home.`,
      color: "text-[#75a9c5] bg-[#edf6fa] dark:bg-[#263945]",
    },
    {
      icon: Sun,
      label: "Sun check",
      title: uvIndex == null ? "UV forecast unavailable" : uvIndex >= 6 ? "Find a little shade" : uvIndex >= 3 ? "A bit of sun protection" : "Low UV today",
      detail: uvIndex == null ? "Check back when the forecast is available." : uvIndex >= 6 ? `UV index ${uvIndex}. Sunglasses, sunscreen, and shade are a good idea.` : uvIndex >= 3 ? `UV index ${uvIndex}. Consider sunscreen if you’ll be outdoors for a while.` : `UV index ${uvIndex}. Enjoy the daylight, with minimal UV exposure.`,
      color: "text-[#d59b46] bg-[#fff6e8] dark:bg-[#3b3326]",
    },
    {
      icon: Wind,
      label: "Comfort",
      title: current == null ? "Weather unavailable" : current.temperature_2m >= 29 ? "Keep it light" : current.temperature_2m <= 12 ? "Bring an extra layer" : current.wind_speed_10m >= 25 ? "A breezy day" : "Comfortable outdoors",
      detail: current == null ? "Your local conditions will appear here." : current.temperature_2m >= 29 ? `It’s ${temperature(current.temperature_2m, unit)}. Light layers and a little water can help.` : current.temperature_2m <= 12 ? `It’s ${temperature(current.temperature_2m, unit)}. A warm layer will feel welcome.` : current.wind_speed_10m >= 25 ? `${Math.round(current.wind_speed_10m)} km/h winds may make it feel cooler than expected.` : `${temperature(current.temperature_2m, unit)} and ${description(current.weather_code).toLowerCase()} — a pleasant time to get outside.`,
      color: "text-[#86a98b] bg-[#f0f7f0] dark:bg-[#29382e]",
    },
  ];

  function chooseCity(place) {
    setCity(place);
    setSearchOpen(false);
    setSavedLocationsOpen(false);
    setQuery("");
    setResults([]);
  }

  const currentCityIsSaved = savedLocations.some((place) =>
    place.latitude === city.latitude && place.longitude === city.longitude
  );

  function saveCurrentCity() {
    if (!currentCityIsSaved) {
      setSavedLocations((places) => [...places, city]);
    }
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const nearby = await searchCity(`${coords.latitude},${coords.longitude}`);
          const closest = nearby[0];
          setCity(closest ? { ...closest, latitude: coords.latitude, longitude: coords.longitude } : {
            name: "Your location",
            country: "",
            latitude: coords.latitude,
            longitude: coords.longitude,
            timezone: "auto",
          });
        } catch {
          setCity({ name: "Your location", country: "", latitude: coords.latitude, longitude: coords.longitude, timezone: "auto" });
        }
      },
      () => {
        setLoading(false);
        setError("Location access was denied. You can search for a city instead.");
      },
      { timeout: 10_000 },
    );
  }

  const safeTimeZone = city.timezone && city.timezone !== "auto" ? city.timezone : undefined;
  const dateLabel = now.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", timeZone: safeTimeZone });

  return (
    <main className={`min-h-screen bg-[#f3f7fb] px-4 py-5 font-sans text-[#242a35] transition-colors sm:px-7 lg:px-10 lg:py-8 dark:bg-[#151d29] dark:text-[#e9edf4] ${darkMode ? "theme-dark" : ""}`}>
      <div className="mx-auto w-full max-w-[1390px]">
        <header className="sticky top-[10px] z-20 flex h-[60px] items-center justify-between rounded-[16px] border border-[#e8ecf1d9] bg-[#f3f7fbef] px-4 backdrop-blur-xl transition-colors sm:px-5 dark:border-[#303946] dark:bg-[#1b2532ef]">
          <a className="inline-flex items-center gap-[10px] font-display text-[22px] font-extrabold tracking-[-1.1px] text-[#232b39] dark:text-[#e9edf4]" href="#overview" aria-label="Skycast home">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-xl bg-[#fff0dc] text-[#f8a348]"><Sun size={21} strokeWidth={2.2} /></span>
            <span>skycast<span className="text-[#edaa4b]">.</span></span>
          </a>
          <nav className={`${mobileMenuOpen ? "absolute right-3 top-[62px] z-20 flex w-40 flex-col items-stretch gap-0 rounded-xl border border-[#e9edf2] bg-white p-1.5 shadow-lg dark:border-[#303946] dark:bg-[#202630] max-[700px]:flex" : "hidden"} ml-[60px] items-center gap-9 min-[701px]:flex`}>
            <a className="relative py-2 text-[15px] font-semibold text-[#252c39] after:absolute after:inset-x-0 after:-bottom-[18px] after:h-0.5 after:rounded after:bg-[#f0ad55] dark:text-[#e8edf5] max-[700px]:after:hidden" href="#overview" onClick={() => setMobileMenuOpen(false)}>Overview</a>
            <a className="py-2 text-[15px] font-semibold text-[#9299a7] hover:text-[#252c39] dark:hover:text-[#e8edf5]" href="#forecast" onClick={() => setMobileMenuOpen(false)}>Forecast</a>
            <a className="py-2 text-[15px] font-semibold text-[#9299a7] hover:text-[#252c39] dark:hover:text-[#e8edf5]" href="#details" onClick={() => setMobileMenuOpen(false)}>Highlights</a>
          </nav>
          <div className="flex items-center gap-[10px] sm:gap-[18px]">
            <div className="flex items-center gap-[3px] rounded-[9px] border border-[#dce6ef] bg-[#e9f0f7] p-1 dark:border-[#40536a] dark:bg-[#26354a]" aria-label="Temperature units">
              <button onClick={() => setUnit("C")} className={`h-[27px] w-[30px] rounded-md border-0 p-0 text-[12px] font-bold ${unit === "C" ? "bg-[#edaa4b] text-[#27354b] shadow-sm" : "bg-transparent text-[#8290a1] dark:text-[#b7c3d1]"}`} aria-pressed={unit === "C"}>°C</button>
              <span className="h-[13px] w-px bg-[#e7eaf0]" />
              <button onClick={() => setUnit("F")} className={`h-[27px] w-[30px] rounded-md border-0 p-0 text-[12px] font-bold ${unit === "F" ? "bg-[#edaa4b] text-[#27354b] shadow-sm" : "bg-transparent text-[#8290a1] dark:text-[#b7c3d1]"}`} aria-pressed={unit === "F"}>°F</button>
            </div>
            <button className="grid h-[35px] w-[35px] place-items-center rounded-[10px] border border-[#edaa4b] bg-[#edaa4b] text-[#27354b] transition hover:-translate-y-px hover:border-[#d99538] hover:bg-[#d99538] dark:border-[#edaa4b] dark:bg-[#edaa4b] dark:text-[#27354b] dark:hover:border-[#f2b85f] dark:hover:bg-[#f2b85f]" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={darkMode} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
            <div className="relative">
              <button className="relative grid h-[35px] w-[35px] place-items-center rounded-[10px] border border-[#e9edf3] bg-white text-[#788493] transition hover:-translate-y-px hover:text-[#d2913b] dark:border-[#303946] dark:bg-[#202630] dark:text-[#dbe1ea]" onClick={() => setSavedLocationsOpen(!savedLocationsOpen)} aria-label={`Saved locations${savedLocations.length ? `, ${savedLocations.length}` : ""}`} aria-expanded={savedLocationsOpen} title="Saved locations">
                <Bookmark size={17} />
                {savedLocations.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-[#f5f7fb] bg-[#d99d4c] px-1 text-[8px] font-bold text-white dark:border-[#151a22]">{savedLocations.length}</span>}
              </button>
              {savedLocationsOpen && <div className="absolute right-0 top-[calc(100%+11px)] z-30 w-[min(310px,calc(100vw-28px))] rounded-[14px] border border-[#e9edf2] bg-white p-4 shadow-[0_14px_36px_#28364d20] dark:border-[#303946] dark:bg-[#202630]">
                <div className="mb-3 flex items-center justify-between gap-[10px]">
                  <div><p className="mb-1 text-[8px] font-bold tracking-[1.4px] text-[#a0a7b3]">YOUR PLACES</p><h2 className="m-0 font-display text-sm font-bold text-[#2c3340] dark:text-[#e4e9f0]">Saved locations</h2></div>
                  <button className="grid h-[29px] w-[29px] place-items-center rounded-lg border-0 bg-transparent text-[#929aa7] hover:bg-[#f3f5f8] dark:hover:bg-[#2b333f]" onClick={() => setSavedLocationsOpen(false)} aria-label="Close saved locations"><X size={16} /></button>
                </div>
                <button className={`flex w-full items-center gap-[9px] rounded-[9px] border p-[10px] text-left text-[11px] font-semibold ${currentCityIsSaved ? "border-[#e7eee8] bg-[#f5f8f5] text-[#89978d] dark:border-[#39483d] dark:bg-[#263129] dark:text-[#adc0ae]" : "border-[#f0e2cc] bg-[#fff9ef] text-[#996b31] dark:border-[#574a36] dark:bg-[#302a20] dark:text-[#e5bf83]"}`} onClick={saveCurrentCity} disabled={currentCityIsSaved}>
                  <MapPin size={15} /><span>{currentCityIsSaved ? "Current city is saved" : `Save ${city.name}`}</span>{!currentCityIsSaved && <span className="ml-auto text-lg font-normal">+</span>}
                </button>
                {savedLocations.length ? <div className="mt-[9px] grid max-h-60 gap-[3px] overflow-y-auto">{savedLocations.map((place) => <div className="flex items-center gap-[5px]" key={`${place.latitude}-${place.longitude}`}>
                  <button className="flex min-w-0 flex-1 items-center gap-[9px] rounded-lg border-0 bg-transparent px-[7px] py-[9px] text-left text-[#d39a4c] hover:bg-[#f5f6f8] dark:hover:bg-[#2b333f]" onClick={() => chooseCity(place)}>
                    <MapPin size={15} /><span className="grid gap-0.5"><strong className="text-[11px] font-semibold text-[#343c49] dark:text-[#e4e9f0]">{place.name}</strong><small className="text-[9px] text-[#9da5b1] dark:text-[#a6b0bd]">{place.country || "Saved place"}</small></span>
                  </button>
                  <button className="grid h-[30px] w-[30px] place-items-center rounded-lg border-0 bg-transparent text-[#a4acb7] hover:text-[#bb665b] dark:text-[#a6b0bd]" onClick={() => setSavedLocations((places) => places.filter((item) => item.latitude !== place.latitude || item.longitude !== place.longitude))} aria-label={`Remove ${place.name}`} title={`Remove ${place.name}`}><Trash2 size={15} /></button>
                </div>)}</div> : <p className="mb-0 mt-[11px] text-[10px] text-[#9ba3af]">Save a city to quickly check its weather again.</p>}
              </div>}
            </div>
            <button className="grid place-items-center border-0 bg-transparent p-1 text-[#343c49] dark:text-[#dbe1ea] min-[701px]:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation">{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </header>

        <section className="my-[42px] flex flex-col items-stretch justify-between gap-5 min-[701px]:my-[58px] min-[701px]:mb-[32px] min-[701px]:flex-row min-[701px]:items-end min-[701px]:gap-8">
          <div>
            <p className="mb-2 flex animate-[fade-up_.55s_ease-out_.12s_both] items-center gap-[9px] text-[9px] font-bold tracking-[1.55px] text-[#a0a7b3]"><span className="h-[7px] w-[7px] rounded-full bg-[#8abd9a] shadow-[0_0_0_3px_#e6f1e9]" /> YOUR DAILY WEATHER</p>
            <h1 aria-label="A little look outside." className="mb-2 font-display text-[clamp(40px,5vw,54px)] font-bold leading-[1.08] tracking-[-2.35px] text-[#263348] dark:text-[#edf1f7]">
              <span className="block overflow-hidden pb-[.07em]"><span className="block animate-[headline-rise_.8s_cubic-bezier(.2,.8,.2,1)_.12s_both] whitespace-nowrap">A little look <span className="bg-gradient-to-r from-[#edaa4b] via-[#f2a66f] to-[#e98272] bg-clip-text text-transparent">outside</span><span className="text-[#edaa4b]">.</span></span></span>
            </h1>
            <p className="m-0 max-w-[42ch] animate-[fade-up_.55s_ease-out_.42s_both] text-[16px] leading-[1.65] text-[#768395] min-[701px]:text-[18px] dark:text-[#b4bfce]">Here’s what the sky has in store for you.</p>
          </div>
          <div className="relative z-10 w-full animate-[fade-up_.55s_ease-out_.52s_both] min-[701px]:w-[min(100%,300px)]">
            <div className={`flex h-[50px] items-center gap-[11px] rounded-xl border bg-white px-4 text-[#a4acb9] shadow-[0_3px_12px_#313c4b05] transition dark:bg-[#202630] ${searchOpen ? "border-[#e8c28c] shadow-[0_4px_16px_#cf9a4e12]" : "border-[#e9edf2] dark:border-[#303946]"}`}>
              <Search size={19} />
              <input type="search" className="w-full min-w-0 border-0 bg-transparent text-[14px] text-[#343b48] outline-none placeholder:text-[#a9b0bc] dark:text-[#e4e9f0] dark:placeholder:text-[#a6b0bd]" placeholder="Search any city..." value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); if (event.key === "Enter" && results[0]) chooseCity(results[0]); }} aria-label="Search a city" />
              {query && <button className="grid place-items-center border-0 bg-transparent p-[3px] text-[#929aa7]" onClick={() => setQuery("")} aria-label="Clear search"><X size={15} /></button>}
            </div>
            {searchOpen && query.trim().length >= 2 && <div className="absolute left-0 right-0 top-[49px] overflow-hidden rounded-xl border border-[#e9edf2] bg-white p-[5px] shadow-[0_12px_30px_#28364d18] dark:border-[#303946] dark:bg-[#202630]">
              {results.length ? results.map((place, index) => <button className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent p-[9px] text-left text-[#727d8c] hover:bg-[#f6f7fa] dark:text-[#a6b0bd] dark:hover:bg-[#2b333f]" key={`${place.latitude}-${place.longitude}-${index}`} onClick={() => chooseCity(place)}>
                <span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-[#fff6e9] text-[#e5a44c]"><MapPin size={16} /></span>
                <span className="grid flex-1 gap-0.5"><strong className="text-[12px] text-[#303846] dark:text-[#e4e9f0]">{place.name}</strong><small className="text-[10px] text-[#a0a7b3]">{[place.admin1, place.country].filter(Boolean).join(", ")}</small></span>
                <ArrowUpRight size={15} />
              </button>) : <p className="m-0 px-[10px] py-3 text-[12px] text-[#8d96a3]">Looking for places...</p>}
            </div>}
          </div>
        </section>

        {error && <div className="mb-4 flex justify-between gap-3 rounded-[10px] border border-[#f8ddcf] bg-[#fff1eb] px-[13px] py-[10px] text-[12px] text-[#965744]" role="status">{error}<button className="grid place-items-center border-0 bg-transparent text-inherit" onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}

        <section className="grid grid-cols-1 gap-5 min-[901px]:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)]" id="overview">
          <article data-reveal className="relative min-h-[390px] overflow-hidden rounded-[17px] bg-[radial-gradient(ellipse_at_82%_55%,#485b79_0%,transparent_36%),linear-gradient(115deg,#27354b_0%,#303f57_58%,#34435d_100%)] px-5 pb-0 pt-5 text-white opacity-0 shadow-[0_8px_24px_#29384a20] transition duration-700 ease-out data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 translate-y-8 min-[701px]:min-h-[440px] min-[701px]:rounded-[19px] min-[701px]:px-7 min-[701px]:pt-6 motion-reduce:transform-none motion-reduce:opacity-100">
            <div className="relative z-[1] flex items-center justify-between gap-3">
              <div className="flex items-center gap-[7px] text-[12px] font-semibold"><span className="grid h-[25px] w-[25px] place-items-center rounded-lg bg-white/[.07] text-[#ffca7e]"><MapPin size={15} /></span>{city.name}{city.country ? `, ${city.country}` : ""}<ChevronDown size={15} className="text-[#9caabd]" /></div>
              <span className="whitespace-nowrap rounded-[7px] border border-white/10 bg-white/[.04] px-[7px] py-[6px] text-[8px] tracking-[.45px] text-[#bac4d1] min-[701px]:px-[10px] min-[701px]:py-[7px] min-[701px]:text-[9px]">TODAY <span className="px-[3px] text-[#d7a65e]">·</span> {dateLabel}</span>
            </div>
            <div className="relative flex min-h-[285px] items-center justify-between">
              <div className="z-[1] py-[9px] pb-3">
                <p className="mb-1 text-[18px] text-[#d2d9e3]">{current ? description(current.weather_code) : "A lovely day ahead"}</p>
                {isRainingNow ? <span className="mt-[7px] inline-flex w-fit items-center gap-[5px] rounded-full border border-[#a9d8f633] bg-[#8fcff21c] px-2 py-[6px] text-[11px] font-semibold text-[#c3e6f8]"><CloudRain size={14} /> Raining now</span> : upcomingRainDays > 0 ? <span className="mt-[7px] inline-flex w-fit items-center gap-[5px] rounded-full border border-white/10 bg-white/[.04] px-2 py-[6px] text-[11px] font-semibold text-[#d3dce8]"><CloudRain size={14} /> Rain forecast on {upcomingRainDays} upcoming {upcomingRainDays === 1 ? "day" : "days"}</span> : null}
                <div className="flex items-center gap-3 min-[701px]:gap-[17px]">
                  <span className="font-display text-[78px] font-medium leading-[1.15] tracking-[-8px] tabular-nums min-[701px]:text-[clamp(82px,8.5vw,108px)]">{current ? temperature(current.temperature_2m, unit) : "--°"}</span>
                  <span className="h-[35px] w-px bg-white/15 min-[701px]:h-[43px]" />
                  <span className="text-[10px] leading-[1.8] text-[#aeb9c8]">Feels like<br /><strong className="text-[15px] font-semibold text-white">{current ? temperature(current.apparent_temperature, unit) : "--°"}</strong></span>
                </div>
                <p className="mb-0 ml-1 mt-0.5 text-[11px] text-[#aeb9c8]">H: {dailyMax[0] != null ? temperature(dailyMax[0], unit) : "--°"} <span className="px-[5px] text-[#e4ad62]">·</span> L: {dailyMin[0] != null ? temperature(dailyMin[0], unit) : "--°"}</p>
              </div>
              <HeroWeather
                isDay={current?.is_day !== 0}
                showRain={isRainingNow}
                temperatureC={current?.temperature_2m}
                weatherCode={current?.weather_code}
                windSpeed={current?.wind_speed_10m}
              />
            </div>
            <div className="relative z-[1] flex h-[62px] items-center gap-[9px] border-t border-white/10 text-[10px] text-[#b7c1ce] min-[701px]:h-[66px] min-[701px]:gap-[17px] min-[701px]:text-[12px]">
              <span className="flex items-center gap-[5px] whitespace-nowrap min-[701px]:gap-[7px]"><Sunrise size={17} className="text-[#ffc96e]" /> Sunrise <strong className="font-semibold text-[#f4f5f7]">{weather?.daily?.sunrise?.[0] ? formatTime(weather.daily.sunrise[0], city.timezone) : "—"}</strong></span>
              <i className="h-[15px] w-px bg-white/15" />
              <span className="flex items-center gap-[5px] whitespace-nowrap min-[701px]:gap-[7px]"><Sunset size={17} className="text-[#efa776]" /> Sunset <strong className="font-semibold text-[#f4f5f7]">{weather?.daily?.sunset?.[0] ? formatTime(weather.daily.sunset[0], city.timezone) : "—"}</strong></span>
              <button className="ml-auto flex h-[31px] w-[31px] items-center justify-center gap-[6px] overflow-hidden whitespace-nowrap rounded-[7px] border border-white/10 bg-white/[.04] px-2 py-[7px] text-[0px] text-[#d9e0e8] transition-colors hover:bg-white/10 min-[701px]:h-auto min-[701px]:w-auto min-[701px]:text-[9px]" onClick={locateMe}><MapPin size={14} /> <span className="hidden min-[701px]:inline">Use my location</span></button>
            </div>
            {loading && <div className="absolute bottom-0 left-0 h-0.5 w-[35%] animate-[loading_1s_ease-in-out_infinite_alternate] bg-[#f5bd68]" />}
          </article>

          <article data-reveal id="details" className="min-h-0 rounded-[17px] border border-[#edf0f4] bg-white px-5 py-5 shadow-[0_4px_18px_#3c485708] transition duration-700 ease-out data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 translate-y-8 opacity-0 min-[701px]:rounded-[19px] min-[701px]:px-7 min-[701px]:pb-6 min-[701px]:pt-6 dark:border-[#303946] dark:bg-[#202630] dark:text-[#dbe1ea] motion-reduce:transform-none motion-reduce:opacity-100 min-[901px]:min-h-[440px]">
            <div className="flex items-center justify-between gap-3"><div><p className="mb-[6px] text-[12px] font-bold tracking-[1.5px] text-[#a0a7b3]">RIGHT NOW</p><h2 className="m-0 font-display text-[clamp(27px,3vw,38px)] font-bold leading-[1.08] tracking-[-1.25px] text-[#2c3340] dark:text-[#e9edf4]">Today’s <span className="bg-gradient-to-r from-[#edaa4b] via-[#f2a66f] to-[#e98272] bg-clip-text text-transparent">highlights</span></h2></div><span className="inline-flex items-center gap-[6px] rounded-full bg-[#f1f7f2] px-[10px] py-[7px] text-[12px] font-semibold text-[#73827a]"><i className="h-[6px] w-[6px] rounded-full bg-[#82b68f]" /> Live</span></div>
            <div className="mt-5 grid grid-cols-2 min-[901px]:mt-7">
              <div data-reveal style={{ transitionDelay: "0ms" }} className="min-h-[120px] border-b border-r border-[#eef0f4] py-4 pr-4 dark:border-[#303946] min-[901px]:min-h-[145px]">
                <div className="flex items-center gap-[7px] text-[14px] font-medium text-[#9099a7]"><Wind size={18} className="text-[#dba456]" /> Wind</div><div className="mt-3 font-display text-[36px] font-semibold leading-none tracking-[-1px] text-[#323a47] dark:text-[#e4e9f0]">{current ? Math.round(current.wind_speed_10m) : "--"}<small className="font-sans text-[15px] font-medium tracking-normal text-[#8992a0]"> km/h</small></div><div className="mt-[10px] flex items-center gap-1 text-[13px] text-[#a0a7b2]"><ArrowUpRight size={15} className="text-[#91a0b0]" /> Gentle breeze</div>
              </div>
              <div data-reveal style={{ transitionDelay: "75ms" }} className="min-h-[120px] border-b border-[#eef0f4] py-4 pl-5 dark:border-[#303946] min-[901px]:min-h-[145px]">
                <div className="flex items-center gap-[7px] text-[14px] font-medium text-[#9099a7]"><Droplets size={18} className="text-[#dba456]" /> Humidity</div><div className="mt-3 font-display text-[36px] font-semibold leading-none tracking-[-1px] text-[#323a47] dark:text-[#e4e9f0]">{current?.relative_humidity_2m ?? "--"}<small className="font-sans text-[15px] font-medium tracking-normal text-[#8992a0]">%</small></div><div className="mt-[14px] h-[5px] overflow-hidden rounded bg-[#edf0f4] dark:bg-[#343d49]"><span className="block h-full rounded bg-gradient-to-r from-[#a8c9b0] to-[#6ea783] transition-[width]" style={{ width: `${current?.relative_humidity_2m ?? 0}%` }} /></div>
              </div>
              <div data-reveal style={{ transitionDelay: "150ms" }} className="min-h-[120px] border-r border-[#eef0f4] pt-5 dark:border-[#303946] min-[901px]:min-h-[145px]">
                <div className="flex items-center gap-[7px] text-[14px] font-medium text-[#9099a7]"><Sun size={18} className="text-[#dba456]" /> UV index</div><div className="mt-3 font-display text-[36px] font-semibold leading-none tracking-[-1px] text-[#323a47] dark:text-[#e4e9f0]">{weather?.daily?.uv_index_max?.[0] ?? "--"}<small className="font-sans text-[15px] font-medium tracking-normal text-[#b1b8c2]"> / 11</small></div><div className="mt-[10px] flex items-center gap-1 text-[13px] text-[#a0a7b2]"><i className="h-[7px] w-[7px] rounded-full bg-[#edc478]" /> {Number(weather?.daily?.uv_index_max?.[0] ?? 0) > 5 ? "Moderate" : "Low"}</div>
              </div>
              <div data-reveal style={{ transitionDelay: "225ms" }} className="min-h-[120px] pt-5 pl-5 min-[901px]:min-h-[145px]">
                <div className="flex items-center gap-[7px] text-[14px] font-medium text-[#9099a7]"><CloudRain size={18} className="text-[#dba456]" /> Rain chance</div><div className="mt-3 font-display text-[36px] font-semibold leading-none tracking-[-1px] text-[#323a47] dark:text-[#e4e9f0]">{weather?.daily?.precipitation_probability_max?.[0] ?? "--"}<small className="font-sans text-[15px] font-medium tracking-normal text-[#8992a0]">%</small></div><div className="mt-3 flex gap-1">{Array.from({ length: 12 }, (_, index) => <i key={index} className={`h-1 w-[9px] rounded ${index < Math.round((weather?.daily?.precipitation_probability_max?.[0] ?? 0) / 8) ? "bg-[#8ab8d2]" : "bg-[#e9edf2]"}`} />)}</div>
              </div>
            </div>
          </article>
        </section>

        <section data-reveal id="forecast" className="mt-5 rounded-[17px] border border-[#edf0f4] bg-white px-5 py-6 shadow-[0_4px_18px_#3c485708] transition duration-700 ease-out data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 translate-y-8 opacity-0 min-[701px]:mt-6 min-[701px]:rounded-[19px] min-[701px]:px-7 min-[701px]:pb-7 min-[701px]:pt-7 dark:border-[#303946] dark:bg-[#202630] motion-reduce:transform-none motion-reduce:opacity-100">
          <div className="flex items-center justify-between gap-3"><div><p className="mb-[6px] text-[12px] font-bold tracking-[1.5px] text-[#a0a7b3]">PLAN YOUR DAY</p><h2 className="m-0 font-display text-[clamp(27px,3vw,38px)] font-bold leading-[1.08] tracking-[-1.25px] text-[#2c3340] dark:text-[#e9edf4]">Today’s <span className="bg-gradient-to-r from-[#edaa4b] via-[#f2a66f] to-[#e98272] bg-clip-text text-transparent">forecast</span></h2></div><div className="flex gap-[10px] text-[12px] text-[#a0a7b3] min-[701px]:gap-[17px] min-[701px]:text-[13px]"><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><i className="h-[7px] w-[7px] rounded-full bg-[#f1b85f]" /> Temperature</span><span className="hidden items-center gap-1.5 whitespace-nowrap min-[390px]:inline-flex"><i className="h-[7px] w-[7px] rounded-full bg-[#8abdd4]" /> Chance of rain</span></div></div>
          <div className="overflow-x-auto [scrollbar-color:#e5e9ef_transparent] [scrollbar-width:thin]">
            <div className="mt-5 grid min-w-[650px] grid-cols-8 border-t border-[#f0f1f4] pt-5 min-[701px]:min-w-[720px] dark:border-[#303946]">
              {hourly.length ? hourly.map((hour, index) => <div className={`relative flex min-h-[165px] flex-col items-center gap-3 border-r border-[#f1f2f5] dark:border-[#303946] ${index === 0 ? "text-[#d6963e]" : ""}`} key={hour.time}>
                <span className="text-[14px] text-[#9ba3af]">{index === 0 ? "Now" : formatTime(hour.time, city.timezone)}</span><WeatherIcon code={hour.code} size={28} className="mt-px text-[#e4a94f]" /><span className="font-display text-[20px] font-bold tracking-[-.4px] text-[#343c49] dark:text-[#e4e9f0]">{temperature(hour.temp, unit)}</span><span className="flex items-center gap-[3px] text-[13px] text-[#9ab8c7]"><Droplets size={13} /> {hour.rain}%</span><div className="absolute inset-x-0 bottom-0 flex h-[31px] items-end justify-center"><i className="w-1 rounded-t bg-gradient-to-b from-[#f7c36e] to-[#f3e7d2]" style={{ height: `${Math.max(14, ((hour.temp - minTemp + 5) / Math.max(maxTemp - minTemp + 10, 1)) * 30)}px` }} /></div>
              </div>) : Array.from({ length: 8 }, (_, index) => <div className="relative flex min-h-[131px] flex-col items-center gap-[10px] border-r border-[#f1f2f5] dark:border-[#303946]" key={index}><span className="text-[10px] text-[#9ba3af]">{index === 0 ? "Now" : `${index + 1} PM`}</span><CloudSun size={24} className="mt-px text-[#e4a94f]" /><span className="font-display text-[15px] font-bold text-[#343c49] dark:text-[#e4e9f0]">--°</span><span className="flex items-center gap-[3px] text-[9px] text-[#9ab8c7]"><Droplets size={11} /> --%</span><div className="absolute inset-x-0 bottom-0 flex h-[31px] items-end justify-center"><i className="w-1 rounded-t bg-gradient-to-b from-[#f7c36e] to-[#f3e7d2]" style={{ height: `${16 + (index % 4) * 5}px` }} /></div></div>)}
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 min-[901px]:mt-5 min-[901px]:grid-cols-[minmax(0,1.35fr)_minmax(0,.65fr)] min-[901px]:gap-5">
          <article data-reveal className="rounded-[17px] border border-[#edf0f4] bg-white px-4 py-6 shadow-[0_4px_18px_#3c485708] transition duration-700 ease-out data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 translate-y-8 opacity-0 min-[701px]:rounded-[19px] min-[701px]:px-7 min-[701px]:py-7 dark:border-[#303946] dark:bg-[#202630] motion-reduce:transform-none motion-reduce:opacity-100">
            <div className="flex items-center justify-between gap-3"><div><p className="mb-[6px] text-[12px] font-bold tracking-[1.5px] text-[#a0a7b3]">THE DAYS AHEAD</p><h2 className="m-0 font-display text-[clamp(27px,3vw,38px)] font-bold leading-[1.08] tracking-[-1.25px] text-[#2c3340] dark:text-[#e9edf4]"><span className="bg-gradient-to-r from-[#edaa4b] via-[#f2a66f] to-[#e98272] bg-clip-text text-transparent">7-day</span> forecast</h2></div><button className="flex items-center gap-[6px] border-0 bg-transparent p-0 text-[14px] font-semibold text-[#c28b42] dark:text-[#e3b46d]" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Full forecast <ArrowUpRight size={16} /></button></div>
            <div className="mt-5">
              {days.slice(0, 7).map((day, index) => {
                const code = weather?.daily?.weather_code[index] ?? 2;
                const low = dailyMin[index] ?? 0;
                const high = dailyMax[index] ?? 0;
                const range = Math.max(maxTemp - minTemp, 1);
                return <div data-reveal style={{ transitionDelay: `${index * 65}ms` }} className="grid min-h-[54px] grid-cols-[55px_minmax(90px,1fr)_minmax(105px,.8fr)] translate-x-3 items-center border-t border-[#f1f2f5] opacity-0 transition duration-700 data-[visible=true]:translate-x-0 data-[visible=true]:opacity-100 min-[701px]:min-h-[62px] min-[701px]:grid-cols-[80px_minmax(120px,1fr)_minmax(130px,.75fr)] dark:border-[#303946]" key={day}>
                  <span className={`text-[14px] ${index === 0 ? "font-bold text-[#39414e] dark:text-[#e4e9f0]" : "text-[#8b94a2] dark:text-[#a6b0bd]"}`}>{index === 0 ? "Today" : new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(`${day}T12:00:00`))}</span>
                  <span className="flex items-center gap-[7px] text-[13px] text-[#929baa] min-[701px]:gap-[10px] min-[701px]:text-[14px]"><WeatherIcon code={code} size={22} className="shrink-0 text-[#e0a953]" /><span className="truncate">{description(code)}</span></span>
                  <div className="flex items-center justify-end gap-1 text-[13px] text-[#9ca4b0] min-[701px]:gap-[9px] min-[701px]:text-[14px]"><span>{temperature(low, unit)}</span><div className="relative h-[5px] w-[41px] overflow-hidden rounded-[5px] bg-[#eef0f3] min-[701px]:w-[min(100%,88px)] dark:bg-[#343d49]"><i className="absolute top-0 h-full min-w-3 rounded-[5px] bg-gradient-to-r from-[#e8c17b] to-[#f2a94f]" style={{ left: `${((low - minTemp) / range) * 100}%`, width: `${Math.max(18, ((high - low) / range) * 100)}%` }} /></div><strong className="min-w-[26px] text-right font-semibold text-[#353d49] dark:text-[#e4e9f0]">{temperature(high, unit)}</strong></div>
                </div>;
              })}
              {!days.length && Array.from({ length: 7 }, (_, index) => <div data-reveal style={{ transitionDelay: `${index * 65}ms` }} className="grid min-h-[42px] grid-cols-[47px_minmax(90px,1fr)_minmax(105px,.8fr)] items-center border-t border-[#f1f2f5] text-[10px] dark:border-[#303946]" key={index}><span>{["Today", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span><span className="flex items-center gap-1.5 text-[#929baa]"><CloudSun size={20} className="text-[#e0a953]" /> Partly cloudy</span><span className="text-right">--°　☀　--°</span></div>)}
            </div>
          </article>

          <aside data-reveal className="overflow-hidden rounded-[17px] border border-[#edf0f4] bg-white px-5 py-6 shadow-[0_4px_18px_#3c485708] transition duration-700 ease-out data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 translate-y-8 opacity-0 min-[701px]:rounded-[19px] min-[701px]:px-7 min-[701px]:py-7 dark:border-[#303946] dark:bg-[#202630] motion-reduce:transform-none motion-reduce:opacity-100">
            <div className="flex items-center justify-between gap-3"><div><p className="mb-[6px] text-[12px] font-bold tracking-[1.5px] text-[#a0a7b3]">DAYLIGHT</p><h2 className="m-0 font-display text-[clamp(24px,2.7vw,34px)] font-bold leading-[1.08] tracking-[-1px] text-[#2c3340] dark:text-[#e9edf4]"><span className="bg-gradient-to-r from-[#edaa4b] via-[#f2a66f] to-[#e98272] bg-clip-text text-transparent">Sunrise</span> & sunset</h2></div><span className="grid h-[36px] w-[36px] place-items-center rounded-[10px] bg-[#fff6e7] text-[#e9ad50]"><Sun size={20} /></span></div>
            <div className="relative mt-3 h-[159px] overflow-hidden">
              <div className="absolute bottom-0 left-1/2 h-[118px] w-[198px] -translate-x-1/2 rounded-t-[110px] border border-b-0 border-dashed border-[#e6c997] after:absolute after:bottom-0 after:left-1/2 after:h-[97px] after:w-[160px] after:-translate-x-1/2 after:rounded-t-[100px] after:bg-gradient-to-b after:from-[#fff8e9] after:to-[#fffdfa] after:content-[''] dark:after:from-[#343022] dark:after:to-[#262a2e]" />
              <div className="absolute bottom-0 left-[2.5%] z-[2] h-px w-[95%] bg-[#f0e9dd] dark:bg-[#41404a]" />
              <span className="absolute bottom-12 left-1/2 z-[3] grid h-[46px] w-[46px] -translate-x-1/2 place-items-center rounded-full bg-[#fff4d9] text-[#f1ae4e] shadow-[0_4px_15px_#e3b86538]"><Sun size={28} /></span>
              <span className="absolute bottom-[7px] left-0 flex items-center gap-1 text-[8px] text-[#a5acb6]"><ArrowUpRight size={12} className="text-[#e5ad5c]" /> Sunrise</span>
              <span className="absolute bottom-[7px] right-0 flex items-center gap-1 text-[8px] text-[#a5acb6]">Sunset <ArrowDownRight size={12} className="text-[#d78f68]" /></span>
            </div>
            <div className="grid grid-cols-2 border-t border-[#f1f2f5] py-[10px] dark:border-[#303946]">
              <div className="grid grid-cols-[18px_1fr] items-center gap-x-[6px] gap-y-0.5"><Sunrise size={16} className="row-span-2 text-[#e4a855]" /><span className="text-[9px] text-[#a0a7b3]">Sunrise</span><strong className="text-[12px] font-bold text-[#39414c] dark:text-[#e4e9f0]">{weather?.daily?.sunrise?.[0] ? formatTime(weather.daily.sunrise[0], city.timezone) : "—"}</strong></div>
              <div className="grid grid-cols-[18px_1fr] items-center gap-x-[6px] gap-y-0.5 border-l border-[#f1f2f5] pl-[13px] dark:border-[#303946]"><Sunset size={16} className="row-span-2 text-[#df9b75]" /><span className="text-[9px] text-[#a0a7b3]">Sunset</span><strong className="text-[12px] font-bold text-[#39414c] dark:text-[#e4e9f0]">{weather?.daily?.sunset?.[0] ? formatTime(weather.daily.sunset[0], city.timezone) : "—"}</strong></div>
            </div>
            <div className="flex items-center justify-center gap-[7px] rounded-lg bg-[#f5f8f4] px-[5px] py-2 text-[9px] text-[#87918b] dark:bg-[#29352f] dark:text-[#b7c8b7]"><span className="h-[6px] w-[6px] rounded-full bg-[#95bd92]" /> {weather?.daily?.sunrise?.[0] && weather?.daily?.sunset?.[0] ? `${Math.max(0, (new Date(weather.daily.sunset[0]) - new Date(weather.daily.sunrise[0])) / 3_600_000).toFixed(1)} hours of daylight` : "A bright new day"}</div>
          </aside>
        </section>

        <section data-reveal className="mt-5 rounded-[17px] border border-[#edf0f4] bg-white px-5 py-6 shadow-[0_4px_18px_#3c485708] transition duration-700 ease-out data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 translate-y-8 opacity-0 min-[701px]:mt-6 min-[701px]:rounded-[19px] min-[701px]:px-7 min-[701px]:py-7 dark:border-[#303946] dark:bg-[#202630] motion-reduce:transform-none motion-reduce:opacity-100">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="mb-[6px] text-[12px] font-bold tracking-[1.5px] text-[#a0a7b3]">A LITTLE PREPARATION</p><h2 className="m-0 font-display text-[clamp(27px,3vw,38px)] font-bold leading-[1.08] tracking-[-1px] text-[#2c3340] dark:text-[#e9edf4]">Before you <span className="bg-gradient-to-r from-[#edaa4b] via-[#f2a66f] to-[#e98272] bg-clip-text text-transparent">head out</span></h2></div>
            <p className="m-0 max-w-[390px] text-[14px] leading-relaxed text-[#8d97a5] dark:text-[#a6b0bd]">A few helpful pointers, based on today’s forecast in {city.name}.</p>
          </div>
          <div className="grid gap-3 min-[701px]:grid-cols-3">
            {dayTips.map(({ icon: Icon, label, title, detail, color }) => <article className="rounded-[13px] border border-[#eef1f4] bg-[#fbfcfd] p-4 dark:border-[#303946] dark:bg-[#1b222c]" key={label}>
              <span className={`mb-3 grid h-[38px] w-[38px] place-items-center rounded-[11px] ${color}`}><Icon size={19} /></span>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[1px] text-[#9ba4b0]">{label}</p>
              <h3 className="mb-1.5 font-display text-[18px] font-bold text-[#303846] dark:text-[#e9edf4]">{title}</h3>
              <p className="m-0 text-[13px] leading-[1.65] text-[#8993a1] dark:text-[#a6b0bd]">{detail}</p>
            </article>)}
          </div>
        </section>

        <footer className="mt-5 border-t border-[#e5eaf0] pb-5 pt-5 dark:border-[#303946] min-[701px]:mt-7 min-[701px]:pt-6">
          <div className="flex flex-col gap-4 min-[600px]:flex-row min-[600px]:items-center min-[600px]:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-[#fff0dc] text-[#f0a746]"><Sun size={20} /></span>
              <div><p className="mb-0.5 font-display text-[16px] font-bold text-[#303846] dark:text-[#e9edf4]">skycast<span className="text-[#edaa4b]">.</span></p><p className="m-0 text-[12px] text-[#929baa] dark:text-[#a6b0bd]">A little more in tune with the sky.</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#929baa] dark:text-[#a6b0bd]">
              <span>Weather for <strong className="font-semibold text-[#566170] dark:text-[#d4dbe4]">{city.name}</strong></span>
              <span>Data by <a className="font-semibold text-[#71859b] underline decoration-[#d3dae2] underline-offset-2 hover:text-[#c28b42] dark:text-[#e3b46d]" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></span>
            </div>
          </div>
          <p className="mb-0 mt-5 border-t border-[#e5eaf0] pt-4 text-[11px] text-[#a2aab5] dark:border-[#303946] dark:text-[#8e9aaa]">Made for curious weather watchers <span className="pl-1 text-[#e0aa63]">✳</span></p>
        </footer>
      </div>
    </main>
  );
}

export default App;
