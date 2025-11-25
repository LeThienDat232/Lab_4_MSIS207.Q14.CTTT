import { Link, Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef, useContext, createContext } from "react";
import axios from "axios";
import { useFetch } from "./hooks/useFetch";
import { useLocalStorage } from "./hooks/useLocalStorage";

const ThemeContext = createContext("light");
const AuthContext = createContext({ isAuthed: false, login: () => {}, logout: () => {} });

export default function AppLayout() {
  const [theme, setTheme] = useLocalStorage("lab4-theme", "light");
  const [isAuthed, setAuthed] = useLocalStorage("lab4-authed", false);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const login = () => setAuthed(true);
  const logout = () => setAuthed(false);

  const bg = theme === "light" ? "#f5f5f5" : "#222";
  const color = theme === "light" ? "#222" : "#f5f5f5";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ isAuthed, login, logout }}>
        <div
          style={{
            minHeight: "100vh",
            background: bg,
            color,
            padding: "16px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <header style={{ marginBottom: 16 }}>
            <h1>Lab 4 – React Intermediate</h1>
            <nav style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <Link to="/">Home</Link>
              <Link to="/effects">Effects</Link>
              <Link to="/refs">Refs</Link>
              <Link to="/forms">Forms</Link>
              <Link to="/fetch">Fetch</Link>
              <Link to="/axios">Axios</Link>
              <Link to="/users">Users</Link>
              <Link to="/dashboard">Dashboard</Link>
              <ThemeToggleButton />
              <AuthStatus />
            </nav>
          </header>

          <Outlet />
        </div>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button onClick={toggleTheme}>
      Theme: {theme === "light" ? "Light" : "Dark"}
    </button>
  );
}

function AuthStatus() {
  const { isAuthed, logout } = useContext(AuthContext);
  return isAuthed ? <button onClick={logout}>Logout</button> : <Link to="/login">Login</Link>;
}

export function Home() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>This mini app mirrors the theory guide for effects, refs, forms, fetching, routing, and context.</p>
      <ul>
        <li>Compare fetch and axios data flows</li>
        <li>Practice controlled and uncontrolled form patterns</li>
        <li>Navigate with dynamic routes, search params, and loaders</li>
        <li>Test custom hooks for fetch logic and local storage</li>
      </ul>
    </div>
  );
}

export function EffectsDemo() {
  return (
    <div>
      <h2>Effects: useEffect</h2>
      <WindowSize />
      <hr />
      <TickingClock />
    </div>
  );
}

function WindowSize() {
  const [size, setSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setSize({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section>
      <h3>Window size listener</h3>
      <p>Width: {size.w}px, Height: {size.h}px</p>
    </section>
  );
}

function TickingClock() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <section>
      <h3>Interval timer with cleanup</h3>
      <p>Seconds since mount: {seconds}</p>
    </section>
  );
}

export function RefsDemo() {
  return (
    <div>
      <h2>Refs: useRef</h2>
      <FocusInput />
      <hr />
      <Stopwatch />
    </div>
  );
}

function FocusInput() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <section>
      <h3>DOM ref: focus input</h3>
      <input ref={inputRef} placeholder="Click the button to focus me" />
      <button onClick={handleFocus}>Focus</button>
    </section>
  );
}

function Stopwatch() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setTime((t) => t + 0.1);
    }, 100);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const reset = () => {
    stop();
    setTime(0);
  };

  return (
    <section>
      <h3>Mutable ref for interval ID</h3>
      <p>Time: {time.toFixed(1)}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </section>
  );
}

export function FormsDemo() {
  return (
    <div>
      <h2>Forms: controlled vs uncontrolled</h2>
      <ControlledLoginForm />
      <hr />
      <UncontrolledContactForm />
    </div>
  );
}

function ControlledLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Email is invalid");
      return;
    }
    setError("");
    alert(`Logging in as ${email} with password length ${password.length}`);
  };

  return (
    <section>
      <h3>Controlled login form</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email:
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </label>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </section>
  );
}

function UncontrolledContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    alert("Uncontrolled form data:\n" + JSON.stringify(data, null, 2));
  };

  return (
    <section>
      <h3>Uncontrolled contact form</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name: <input name="name" defaultValue="Alice" />
          </label>
        </div>
        <div>
          <label>
            Email: <input name="email" type="email" required />
          </label>
        </div>
        <div>
          <label>
            Message: <textarea name="message" required />
          </label>
        </div>
        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export function FetchDemo() {
  const { data, loading, error } = useFetch("https://jsonplaceholder.typicode.com/users");

  return (
    <div>
      <h2>Data fetching with custom useFetch hook</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      {data && (
        <ul>
          {data.map((u) => (
            <li key={u.id}>
              {u.name} – {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AxiosDemo() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/users", {
          signal: controller.signal,
        });
        setUsers(response.data.slice(0, 5));
        setError(null);
      } catch (err) {
        if (err.code !== "ERR_CANCELED") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <h2>Axios convenience features</h2>
      <p>Axios exposes parsed data as response.data and rejects on HTTP errors, so the UI only checks a single error branch.</p>
      {loading && <p>Loading with axios…</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      <ol>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ol>
    </div>
  );
}

export function UsersLayout() {
  const { data, loading, error } = useFetch("https://jsonplaceholder.typicode.com/users");
  const [searchParams, setSearchParams] = useSearchParams();
  const term = searchParams.get("q") ?? "";

  const handleSearch = (event) => {
    const value = event.target.value;
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const filtered = data?.filter((user) =>
    user.name.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
      <section>
        <h2>User directory</h2>
        <input
          value={term}
          onChange={handleSearch}
          placeholder="Filter by name"
          style={{ padding: 8, width: "100%" }}
        />
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
        <ul>
          {filtered?.map((user) => (
            <li key={user.id}>
              <Link to={term ? `${user.id}?q=${term}` : `${user.id}`}>{user.name}</Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <Outlet />
      </section>
    </div>
  );
}

export function UserDetail() {
  const { userId } = useParams();
  const { data, loading, error } = useFetch(`https://jsonplaceholder.typicode.com/users/${userId}`);

  return (
    <div>
      <h3>User detail</h3>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      {data && (
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 8 }}>
          <dt>Name</dt>
          <dd>{data.name}</dd>
          <dt>Email</dt>
          <dd>{data.email}</dd>
          <dt>Company</dt>
          <dd>{data.company?.name}</dd>
          <dt>City</dt>
          <dd>{data.address?.city}</dd>
        </dl>
      )}
    </div>
  );
}

export function LoginPage() {
  const { isAuthed, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    login();
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Login</h2>
      {isAuthed ? (
        <p>You are already signed in.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 320 }}>
          <label>
            Email
            <input type="email" required />
          </label>
          <label>
            Password
            <input type="password" required minLength={6} />
          </label>
          <button type="submit">Sign in</button>
        </form>
      )}
    </div>
  );
}

export function Dashboard() {
  const { logout } = useContext(AuthContext);
  return (
    <div>
      <h2>Dashboard</h2>
      <p>This route is protected by a loader that verifies authentication before rendering.</p>
      <button onClick={logout}>Sign out</button>
    </div>
  );
}
