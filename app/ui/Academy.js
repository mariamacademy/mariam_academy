"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const translations = {
  ar: {
    navHome: "الرئيسية",
    navCourses: "الكورسات",
    navExams: "الامتحانات",
    navAbout: "من نحن",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    logout: "تسجيل الخروج",
    heroTitle: "اتعلم مع مريم بطريقة أسهل وأقرب ليك",
    heroText: "كورسات منظمة • فيديوهات • ملازم • امتحانات • متابعة",
    browse: "استكشف الكورسات",
    account: "حسابي",
    available: "الكورسات المتاحة",
    empty: "مفيش كورسات مضافة لسه.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    name: "الاسم",
    submitLogin: "دخول",
    submitSignup: "إنشاء الحساب",
    close: "إغلاق",
    teacher: "لوحة مريم",
    addCourse: "إضافة كورس",
    title: "اسم الكورس",
    description: "وصف مختصر",
    save: "حفظ الكورس",
    welcome: "أهلاً بيك",
    availableStudents: "الكورس متاح للطلاب",
    language: "English",
    noAccount: "لسه معندكش حساب؟",
    haveAccount: "عندك حساب بالفعل؟",
    toggleToSignup: "إنشاء حساب",
    toggleToLogin: "تسجيل الدخول",
    success: "تم بنجاح",
  },

  en: {
    navHome: "Home",
    navCourses: "Courses",
    navExams: "Exams",
    navAbout: "About",
    login: "Log in",
    signup: "Create account",
    logout: "Log out",
    heroTitle: "Learn with Mariam — easier and closer to you",
    heroText: "Organized courses • Videos • Materials • Exams • Follow-up",
    browse: "Explore courses",
    account: "My account",
    available: "Available courses",
    empty: "No courses have been added yet.",
    email: "Email",
    password: "Password",
    name: "Name",
    submitLogin: "Log in",
    submitSignup: "Create account",
    close: "Close",
    teacher: "Mariam Dashboard",
    addCourse: "Add course",
    title: "Course title",
    description: "Short description",
    save: "Save course",
    welcome: "Welcome",
    availableStudents: "Available to students",
    language: "العربية",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    toggleToSignup: "Create account",
    toggleToLogin: "Log in",
    success: "Done",
  },
};

export default function Academy() {
  const [lang, setLang] = useState("ar");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [teacherOpen, setTeacherOpen] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem("mariam-lang");

    if (saved === "ar" || saved === "en") {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function start() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session);
      setLoading(false);

      if (data.session?.user) {
        loadProfile(data.session.user);
      }

      loadCourses();
    }

    start();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          await loadProfile(newSession.user);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(user) {
    if (!supabase || !user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    setProfile(data || null);
  }

  async function loadCourses() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (!error) {
      setCourses(data || []);
    }
  }

  function changeLang(next) {
    setLang(next);
    localStorage.setItem("mariam-lang", next);
  }

  async function authSubmit(e) {
    e.preventDefault();

    if (!supabase) {
      setMessage("Supabase is not connected yet.");
      return;
    }

    const fd = new FormData(e.currentTarget);

    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || "").trim();

    setLoading(true);

    let result;

    if (authMode === "login") {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
    }

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(t.success);
    setModal(null);

    if (result.data.user) {
      await loadProfile(result.data.user);
    }
  }

  async function logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setProfile(null);
    setTeacherOpen(false);
  }

  async function addCourse(e) {
    e.preventDefault();

    if (!supabase || !session?.user) return;

    const fd = new FormData(e.currentTarget);

    const title = String(fd.get("title") || "").trim();
    const description = String(fd.get("description") || "").trim();

    const { error } = await supabase.from("courses").insert({
      title_ar: title,
      title_en: title,
      description_ar: description,
      description_en: description,
      language: "ar",
      is_published: true,
      created_by: session.user.id,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(t.success);
    e.currentTarget.reset();

    await loadCourses();
  }

  const isTeacher = profile?.role === "teacher";
  const dir = lang === "ar" ? "rtl" : "ltr";

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
          <a href="#home">{t.navHome}</a>
          <a href="#courses">{t.navCourses}</a>
          <a href="#exams">{t.navExams}</a>
          <a href="#about">{t.navAbout}</a>
        </nav>

        <div className="actions">
          <button
            className="lang"
            onClick={() =>
              changeLang(lang === "ar" ? "en" : "ar")
            }
          >
            {t.language}
          </button>

          {session ? (
            <>
              <button
                className="ghost"
                onClick={() => setTeacherOpen(!teacherOpen)}
              >
                {isTeacher ? t.teacher : t.account}
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
                setModal("auth");
              }}
            >
              {t.login}
            </button>
          )}
        </div>
      </header>

      <section id="home" className="hero">
        <div className="heroCopy">
          <div className="eyebrow">MARIAM ACADEMY</div>

          <h1>{t.heroTitle}</h1>

          <p>{t.heroText}</p>

          <div className="heroButtons">
            <button
              className="primary"
              onClick={() =>
                document
                  .getElementById("courses")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              {t.browse}
            </button>

            <button
              className="outline"
              onClick={() => {
                if (!session) {
                  setAuthMode("login");
                  setModal("auth");
                } else {
                  setTeacherOpen(!teacherOpen);
                }
              }}
            >
              {session ? t.account : t.login}
            </button>
          </div>
        </div>

        <div className="heroImage" />
      </section>

      {message && (
        <div
          className="notice"
          onClick={() => setMessage("")}
        >
          {message}
        </div>
      )}

      {teacherOpen && (
        <section className="adminPanel">
          <div>
            <span className="eyebrow">
              {isTeacher ? t.teacher : t.account}
            </span>

            <h2>
              {t.welcome}
              {session?.user?.email
                ? ` — ${session.user.email}`
                : ""}
            </h2>
          </div>

          {isTeacher && (
            <form
              className="courseForm"
              onSubmit={addCourse}
            >
              <input
                name="title"
                placeholder={t.title}
                required
              />

              <input
                name="description"
                placeholder={t.description}
              />

              <button
                className="primary"
                type="submit"
              >
                {t.save}
              </button>
            </form>
          )}
        </section>
      )}

      <section id="courses" className="section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              MARIAM ACADEMY
            </span>

            <h2>{t.available}</h2>
          </div>

          {session && (
            <span className="signed">
              {t.availableStudents}
            </span>
          )}
        </div>

        {loading ? (
          <div className="empty">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="empty">{t.empty}</div>
        ) : (
          <div className="grid">
            {courses.map((course) => {
              const courseTitle =
                lang === "ar"
                  ? course.title_ar
                  : course.title_en;

              const courseDescription =
                lang === "ar"
                  ? course.description_ar
                  : course.description_en;

              return (
                <article
                  className="card"
                  key={course.id}
                >
                  <div className="cardTop">
                    COURSE
                  </div>

                  <h3>{courseTitle}</h3>

                  <p>{courseDescription}</p>

                  <button
                    className="outline full"
                    onClick={() => {
                      if (!session) {
                        setAuthMode("login");
                        setModal("auth");
                      }
                    }}
                  >
                    {session ? t.account : t.login}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="exams" className="strip">
        <span>✦</span>

        <div>
          <b>{t.navExams}</b>

          <p>
            {lang === "ar"
              ? "الامتحانات والنتائج هتتضاف هنا بعد تفعيلها."
              : "Exams and results will appear here when enabled."}
          </p>
        </div>
      </section>

      <section id="about" className="about">
        <span className="eyebrow">
          MARIAM ACADEMY
        </span>

        <h2>
          {lang === "ar"
            ? "منصة واحدة لكل خطوات التعلم"
            : "One platform for the learning journey"}
        </h2>
      </section>

      <footer>
        MARIAM ACADEMY © 2026
      </footer>

      {modal === "auth" && (
        <div
          className="modalBackdrop"
          onMouseDown={() => setModal(null)}
        >
          <div
            className="modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="close"
              onClick={() => setModal(null)}
            >
              ×
            </button>

            <span className="eyebrow">
              MARIAM ACADEMY
            </span>

            <h2>
              {authMode === "login"
                ? t.login
                : t.signup}
            </h2>

            <form onSubmit={authSubmit}>
              {authMode === "signup" && (
                <input
                  name="name"
                  placeholder={t.name}
                  required
                />
              )}

              <input
                name="email"
                type="email"
                placeholder={t.email}
                required
              />

              <input
                name="password"
                type="password"
                placeholder={t.password}
                minLength="6"
                required
              />

              <button
                className="primary full"
                type="submit"
              >
                {authMode === "login"
                  ? t.submitLogin
                  : t.submitSignup}
              </button>
            </form>

            <div className="switch">
              {authMode === "login"
                ? t.noAccount
                : t.haveAccount}

              <button
                onClick={() =>
                  setAuthMode(
                    authMode === "login"
                      ? "signup"
                      : "login"
                  )
                }
              >
                {authMode === "login"
                  ? t.toggleToSignup
                  : t.toggleToLogin}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
