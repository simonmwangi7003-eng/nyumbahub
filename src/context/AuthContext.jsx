import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Instant placeholder built from signup details so the UI never waits on the database
const tempProfile = (u) => ({
  id: u.id,
  email: u.email,
  full_name: u.user_metadata?.full_name || "",
  phone: u.user_metadata?.phone || "",
  role: u.user_metadata?.role === "agent" ? "agent" : "user",
  is_active: true,
  _temp: true,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u) => {
    if (!u) return setProfile(null);
    setProfile((prev) => (prev?.id === u.id ? prev : tempProfile(u)));

    const get = () =>
      supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    let { data, error } = await get();
    if (!data && !error) {
      // Self-heal: create the profile row if the signup trigger didn't
      await supabase.from("profiles").insert({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || null,
        phone: u.user_metadata?.phone || null,
      });
      ({ data } = await get());
    }
    if (!data) return;
    if (data.is_active === false) {
      await supabase.auth.signOut();
      setProfile(null);
      return toast.error(
        "Your account has been suspended. Please contact support.",
      );
    }
    setProfile(data);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        loadProfile(data.session?.user); // not awaited: don't block the app
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evt, s) => {
      if (evt === "INITIAL_SESSION" || evt === "TOKEN_REFRESHED") return;
      setSession(s);
      setTimeout(() => loadProfile(s?.user), 0);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

    // Re-check the profile when the tab regains focus, so role changes show up without re-login
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible' && session?.user) loadProfile(session.user)
    }
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [session, loadProfile])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isAdmin: profile?.role === "admin" && !profile?._temp,
      refreshProfile: () => loadProfile(session?.user),
      signIn: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),
      signUp: ({ email, password, full_name, phone, role }) =>
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name, phone, role } },
        }),
      resetPassword: (email) =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        }),
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
      },
    }),
    [session, profile, loading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
