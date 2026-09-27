"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const text = {
  ar: {
    home: "الرئيسية", courses: "الكورسات", exams: "الامتحانات", about: "من نحن",
    login: "تسجيل الدخول", signup: "إنشاء حساب", logout: "تسجيل الخروج",
    hero: "اتعلم مع مريم بطريقة أسهل وأقرب ليك",
    heroText: "كورسات تعليمية منظمة • فيديوهات • ملازم • امتحانات • متابعة",
    explore: "استكشف الكورسات", available: "الكورسات المتاحة",
    empty: "مفيش كورسات مضافة لسه.",
    email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم",
    enter: "دخول", create: "إنشاء الحساب", close: "إغلاق",
    dashboard: "لوحة مريم", account: "حسابي",
    add: "إضافة كورس", title: "اسم الكورس", desc: "وصف مختصر",
    save: "حفظ الكورس", welcome: "أهلاً بيك",
    done: "تم بنجاح", error: "حصل خطأ، جرّب تاني.",
    switchSignup: "إنشاء حساب", switchLogin: "تسجيل الدخول",
    lang: "English"
  },
  en: {
    home: "Home", courses: "Courses", exams: "Exams", about: "About",
    login: "Log in", signup: "Create account", logout: "Log out",
    hero: "Learn with Mariam — easier and closer to you",
    heroText: "Organized courses • Videos • Materials • Exams • Follow-up",
    explore: "Explore courses", available: "Available courses",
    empty: "No courses have been added yet.",
    email: "Email", password: "Password", name: "Name",
    enter: "Log in", create: "Create account", close: "Close",
    dashboard: "Mariam Dashboard", account: "My account",
    add: "Add course", title: "Course title", desc: "Short description",
    save: "Save course", welcome: "Welcome",
    done: "Done", error: "Something went wrong.",
    switchSignup: "Create account", switchLogin: "Log in",
    lang: "العربية"
  }
};

export default function Academy() {
  const [lang, setLang] = useState("ar");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [dashboard, setDashboard] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const t = text[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const saved = localStorage.getItem("mariam-lang");
    if (saved === "ar" || saved === "en") setLang(saved);

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);

      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }

      await loadCourses();
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    setProfile(data || null);
  }

  async function loadCourses() {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (data) setCourses(data);
  }

  function changeLanguage() {
    const next = lang === "ar" ? "en" : "ar";
    setLang(next);
    localStorage.setItem("mariam-lang", next);
  }

  async function authSubmit(e) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const name = String(form.get("name") || "").trim();

    setLoading(true);

    let result;

    if (authMode === "login") {
      result = await supabase.auth.signInWithPassword({
        email,
        password
      });
    } else {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
    }

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(t.done);
    setModal(false);

    if (result.data.user) {
      await loadProfile(result.data.user.id);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setDashboard(false);
  }

  async function addCourse(e) {
    e.preventDefault();

    if (!session?.user || profile?.role !== "teacher") return;

    const form = new FormData(e.currentTarget);

    const titleAr = String(form.get("title_ar") || "").trim();
    const titleEn = String(form.get("title_en") || "").trim();
    const descAr = String(form.get("description_ar") || "").trim();
    const descEn = String(form.get("description_en") || "").trim();

    const { error } = await supabase.from("courses").insert({
      title_ar: titleAr,
      title_en: titleEn,
      description_ar: descAr,
      description_en: descEn,
      is_published: true,
      created_by: session.user.id
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(t.done);
    e.currentTarget.reset();
    await loadCourses();
  }

  const isTeacher = profile?.role === "teacher";

  return (
    <main dir={dir}>

      <header className="topbar">

        <div className="brand">
          <div className="brandMark">M</div>
          <div>
            <b>MARIAM</b>
            <span>ACADEMY</span>
          </div>
        </div>

        <nav>
          <a href="#home">{t.home}</a>
          <a href="#courses">{t.courses}</a>
          <a href="#exams">{t.exams}</a>
          <a href="#about">{t.about}</a>
        </nav>

        <div className="actions">

          <button className="lang" onClick={changeLanguage}>
            {t.lang}
          </button>

          {session ? (
            <>
              <button
                className="ghost"
                onClick={() => setDashboard(!dashboard)}
              >
                {isTeacher ? t.dashboard : t.account}
              </button>

              <button
                className="primary small"
                onClick={logout}
              >
                {t.logout}
              </button>
            </>
          ) : (
            <button
              className="primary small"
              onClick={() => {
                setAuthMode("login");
                setModal(true);
              }}
            >
              {t.login}
            </button>
