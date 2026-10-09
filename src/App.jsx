import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import JSZip from "jszip";
import { nanoid } from "nanoid";
import {
  Activity, AlignLeft, ArrowDownToLine, ArrowLeft, ArrowRight, Box, Braces, Check,
  ChevronDown, ChevronLeft, ChevronRight, Circle, Code2, Copy, Eye, FileCode2,
  FileImage, FileText, Globe, Grip, Heading, Image as ImageIcon, Layers, Layout,
  Link as LinkIcon, LoaderCircle, Menu, Monitor, MoreHorizontal, MousePointer2,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Plus, Redo2,
  RotateCcw, Save, Search, Smartphone, Sparkles, Square, Tablet, Trash2, Type,
  Undo2, X, Zap
} from "lucide-react";

const STORE_KEY = "syrix-code-editor-project-v1";
const INITIAL_ITEMS = [
  { id: "hero-title", type: "heading", text: "Build something brilliant.", styles: { color: "#172033", fontSize: 42, background: "transparent", radius: 0, padding: 0, width: "100%" } },
  { id: "hero-copy", type: "text", text: "A clean, responsive website starts here. Add elements, style them, and export the real code.", styles: { color: "#657086", fontSize: 16, background: "transparent", radius: 0, padding: 0, width: "100%" } },
  { id: "hero-button", type: "button", text: "Get started", styles: { color: "#ffffff", background: "#5b5ce2", fontSize: 15, radius: 10, padding: 14, width: "fit-content" } },
  { id: "feature-card", type: "card", text: "Your next big idea", styles: { color: "#273149", background: "#f2f4ff", fontSize: 18, radius: 18, padding: 24, width: "100%" } }
];

const BLOCKS = [
  { type: "heading", label: "Heading", description: "Large page title", icon: Heading, group: "Basics" },
  { type: "text", label: "Text", description: "Paragraph copy", icon: Type, group: "Basics" },
  { type: "button", label: "Button", description: "Clickable action", icon: MousePointer2, group: "Basics" },
  { type: "link", label: "Link", description: "Text navigation link", icon: LinkIcon, group: "Basics" },
  { type: "card", label: "Card", description: "Content surface", icon: Square, group: "Layout" },
  { type: "container", label: "Container", description: "Content wrapper", icon: Box, group: "Layout" },
  { type: "image", label: "Image", description: "Image or illustration", icon: ImageIcon, group: "Media" },
  { type: "input", label: "Input", description: "Form field", icon: AlignLeft, group: "Forms" },
  { type: "divider", label: "Divider", description: "Horizontal separator", icon: MinusIcon, group: "Basics" },
  { type: "icon", label: "Icon", description: "Lucide icon", icon: Sparkles, group: "Media" }
];
function MinusIcon(props) { return <span className="minus-glyph" aria-hidden="true" {...props}>—</span>; }

const ICONS = [
  "Zap", "Sparkles", "Heart", "Star", "Check", "ArrowRight", "ArrowUpRight", "Globe",
  "ShieldCheck", "Code2", "Rocket", "Mail", "Phone", "Calendar", "Search", "Settings",
  "User", "Users", "House", "Menu", "Play", "CircleCheck", "Cloud", "LockKeyhole",
  "BookOpen", "ChartNoAxesColumn", "BriefcaseBusiness", "ShoppingBag", "MessageCircle",
  "Github", "Instagram", "Youtube", "Linkedin", "Coffee", "Lightbulb", "Target", "Gem"
];

const IconMap = {
  Zap, Sparkles, Heart: Circle, Star: Sparkles, Check, ArrowRight, ArrowUpRight: ArrowRight,
  Globe, ShieldCheck: Check, Code2, Rocket: Zap, Mail: LinkIcon, Phone: LinkIcon,
  Calendar: FileText, Search, Settings: MoreHorizontal, User: Circle, Users: Circle,
  House: Layout, Menu, Play: Eye, CircleCheck: Check, Cloud: Globe, LockKeyhole: Check,
  BookOpen: FileText, ChartNoAxesColumn: Activity, BriefcaseBusiness: Box, ShoppingBag: Box,
  MessageCircle: LinkIcon, Github: Code2, Instagram: Circle, Youtube: Eye, Linkedin: LinkIcon,
  Coffee: Circle, Lightbulb: Sparkles, Target: Circle, Gem: Sparkles
};

const DEFAULTS = {
  heading: { text: "Your heading", styles: { color: "#172033", fontSize: 36, background: "transparent", radius: 0, padding: 0, width: "100%" } },
  text: { text: "Write a short paragraph that explains your idea.", styles: { color: "#657086", fontSize: 16, background: "transparent", radius: 0, padding: 0, width: "100%" } },
  button: { text: "Click me", styles: { color: "#ffffff", background: "#5b5ce2", fontSize: 15, radius: 10, padding: 13, width: "fit-content" } },
  link: { text: "Learn more", href: "#", styles: { color: "#5b5ce2", fontSize: 15, background: "transparent", radius: 0, padding: 0, width: "fit-content" } },
  card: { text: "Card title\\nAdd your supporting text here.", styles: { color: "#273149", background: "#f4f6fb", fontSize: 18, radius: 16, padding: 24, width: "100%" } },
  container: { text: "Container — add content here", styles: { color: "#273149", background: "#ffffff", fontSize: 16, radius: 12, padding: 24, width: "100%" } },
  image: { text: "Image", src: "", styles: { color: "#657086", background: "#eef1f7", fontSize: 14, radius: 12, padding: 20, width: "100%" } },
  input: { text: "Your email address", styles: { color: "#657086", background: "#ffffff", fontSize: 15, radius: 9, padding: 12, width: "100%" } },
  divider: { text: "", styles: { color: "#e3e7ef", background: "#e3e7ef", fontSize: 1, radius: 0, padding: 1, width: "100%" } },
  icon: { text: "Sparkles", styles: { color: "#5b5ce2", background: "transparent", fontSize: 28, radius: 0, padding: 4, width: "fit-content" } }
};

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function safeCss(value) {
  return String(value ?? "").replace(/[;{}]/g, "");
}
function cssForItem(item) {
  const s = item.styles || {};
  const base = [
    `color:${safeCss(s.color || "#172033")}`,
    `background:${safeCss(s.background || "transparent")}`,
    `font-size:${Number(s.fontSize || 16)}px`,
    `border-radius:${Number(s.radius || 0)}px`,
    `padding:${Number(s.padding || 0)}px`,
    `width:${safeCss(s.width || "100%")}`,
    "box-sizing:border-box"
  ];
  if (item.type === "button") base.push("border:0;cursor:pointer;font-weight:600");
  if (item.type === "card") base.push("border:1px solid #e9edf5;box-shadow:0 8px 26px rgba(26,39,73,.05)");
  if (item.type === "input") base.push("border:1px solid #dce2ec;outline:none");
  if (item.type === "divider") base.push("height:1px;padding:0;border:0");
  if (item.type === "heading") base.push("line-height:1.15;letter-spacing:-.035em;font-weight:750;margin:0");
  if (item.type === "text") base.push("line-height:1.75;margin:0");
  if (item.type === "link") base.push("text-decoration:none;display:inline-block");
  if (item.type === "container") base.push("border:1px dashed #d8deeb;min-height:80px");
  if (item.type === "image") base.push("min-height:150px;display:flex;align-items:center;justify-content:center;overflow:hidden");
  if (item.type === "icon") base.push("display:inline-flex;align-items:center;justify-content:center");
  return base.join(";");
}
function itemMarkup(item, forCanvas = false) {
  const text = escapeHtml(item.text || "");
  const style = cssForItem(item);
  const common = `data-id="${escapeHtml(item.id)}" style="${style}"`;
  switch (item.type) {
    case "heading": return `<h1 ${common}>${text}</h1>`;
    case "text": return `<p ${common}>${text.replaceAll("\\n", "<br>")}</p>`;
    case "button": return `<button ${common} type="button">${text}</button>`;
    case "link": return `<a ${common} href="${escapeHtml(item.href || "#")}">${text}</a>`;
    case "card": return `<article ${common}>${text.replaceAll("\\n", "<br>")}</article>`;
    case "container": return `<section ${common}>${text}</section>`;
    case "image": return item.src ? `<img ${common} src="${escapeHtml(item.src)}" alt="${text || "Image"}" style="${style};height:auto;object-fit:cover" />` : `<div ${common} class="image-placeholder"><span class="image-placeholder-inner">▧ &nbsp; Add an image URL in Properties</span></div>`;
    case "input": return `<input ${common} placeholder="${text}" aria-label="${text}" />`;
    case "divider": return `<hr ${common} />`;
    case "icon": return `<span ${common} aria-label="${text}">${escapeHtml(item.text || "✦")}</span>`;
    default: return `<div ${common}>${text}</div>`;
  }
}
function generateProject(items) {
  const html = items.map(i => itemMarkup(i)).join("\n      ");
  const css = `*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172033}.site-shell{max-width:1040px;margin:0 auto;padding:64px 28px;display:flex;flex-direction:column;align-items:flex-start;gap:24px}.image-placeholder{color:#657086;background:#eef1f7;min-height:150px;border-radius:12px;display:flex;align-items:center;justify-content:center}.image-placeholder-inner{font-size:14px}@media(max-width:600px){.site-shell{padding:36px 18px;gap:18px}h1{font-size:34px!important}}`;
  const js = `document.querySelectorAll('button').forEach((button)=>button.addEventListener('click',()=>{const original=button.textContent;button.textContent='Clicked!';setTimeout(()=>button.textContent=original,900)}));`;
  return {
    html: `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>My SYRIX Website</title>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <main class="site-shell">\n      ${html}\n  </main>\n  <script src="script.js"></script>\n</body>\n</html>`,
    css,
    js
  };
}
function Spinner({ small = false, label = "Loading" }) {
  return <span className={`spinner-wrap ${small ? "spinner-small" : ""}`} role="status" aria-label={label}><LoaderCircle className="spinner" size={small ? 15 : 22} /><span className="sr-only">{label}</span></span>;
}
function LoadingOverlay({ message = "Preparing your workspace…" }) {
  return <div className="loading-overlay"><div className="loading-card"><div className="loading-mark"><Code2 size={24} /></div><Spinner /><strong>{message}</strong><span>Just a moment</span></div></div>;
}

function App() {
  const [items, setItems] = useState(() => {
    try { const saved = localStorage.getItem(STORE_KEY); return saved ? JSON.parse(saved).items || INITIAL_ITEMS : INITIAL_ITEMS; }
    catch { return INITIAL_ITEMS; }
  });
  const [selectedId, setSelectedId] = useState("hero-title");
  const [panel, setPanel] = useState("elements");
  const [mode, setMode] = useState("design");
  const [device, setDevice] = useState("desktop");
  const [showCode, setShowCode] = useState(true);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [codeTab, setCodeTab] = useState("html");
  const [search, setSearch] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [savedStatus, setSavedStatus] = useState("Saved locally");
  const [history, setHistory] = useState([items]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [projectName, setProjectName] = useState("Untitled website");

  const selected = items.find(i => i.id === selectedId) || null;
  const generated = useMemo(() => generateProject(items), [items]);
  const filteredBlocks = BLOCKS.filter(b => `${b.label} ${b.description} ${b.group}`.toLowerCase().includes(search.toLowerCase()));
  const filteredIcons = ICONS.filter(n => n.toLowerCase().includes(iconSearch.toLowerCase()));
  const codeValue = generated[codeTab] || generated.html;

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ items, projectName, updatedAt: Date.now() }));
        setSavedStatus("Saved locally");
      } catch { setSavedStatus("Local save unavailable"); }
    }, 350);
    return () => clearTimeout(timer);
  }, [items, projectName]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const commitItems = useCallback((nextItems) => {
    setItems(nextItems);
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextItems);
    setHistory(nextHistory.slice(-60));
    setHistoryIndex(Math.min(nextHistory.length - 1, 59));
    setSavedStatus("Saving…");
  }, [history, historyIndex]);

  const addItem = (type, textOverride) => {
    const base = DEFAULTS[type] || DEFAULTS.text;
    const item = { id: nanoid(8), type, text: textOverride || base.text, ...(base.href ? { href: base.href } : {}), ...(base.src ? { src: base.src } : {}), styles: { ...base.styles } };
    commitItems([...items, item]);
    setSelectedId(item.id);
    setMode("design");
    setToast(`${BLOCKS.find(b => b.type === type)?.label || type} added`);
  };
  const updateSelected = (patch) => {
    if (!selected) return;
    commitItems(items.map(i => i.id === selected.id ? { ...i, ...patch, styles: patch.styles ? { ...i.styles, ...patch.styles } : i.styles } : i));
  };
  const deleteSelected = () => {
    if (!selected) return;
    const next = items.filter(i => i.id !== selected.id);
    commitItems(next);
    setSelectedId(next[0]?.id || null);
    setToast("Element removed");
  };
  const duplicateSelected = () => {
    if (!selected) return;
    const copy = { ...selected, id: nanoid(8), styles: { ...selected.styles }, text: selected.text };
    const idx = items.findIndex(i => i.id === selected.id);
    const next = [...items]; next.splice(idx + 1, 0, copy);
    commitItems(next); setSelectedId(copy.id); setToast("Element duplicated");
  };
  const moveHistory = (direction) => {
    const idx = historyIndex + direction;
    if (idx < 0 || idx >= history.length) return;
    setHistoryIndex(idx); setItems(history[idx]); setToast(direction < 0 ? "Undo complete" : "Redo complete");
  };
  const saveNow = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ items, projectName, updatedAt: Date.now() })); setSavedStatus("Saved locally"); setToast("Project saved on this device"); }
    catch { setToast("Could not save in this browser"); }
  };
  const exportProject = async () => {
    setBusy(true);
    try {
      const zip = new JSZip();
      zip.file("index.html", generated.html);
      zip.file("styles.css", generated.css);
      zip.file("script.js", generated.js);
      zip.file("README.txt", `Website exported from CODE EDITOR BY SYRIX\\n\\nOpen index.html in a browser. Edit styles.css and script.js to customize further.\\nProject: ${projectName}\\n`);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "syrix-website"}.zip`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setToast("Website ZIP exported");
    } catch (err) { setToast("Export failed. Please try again."); }
    finally { setBusy(false); }
  };
  const resetProject = () => {
    if (!window.confirm("Start a new website? Your current design will be replaced.")) return;
    const next = INITIAL_ITEMS.map(i => ({ ...i, id: nanoid(8), styles: { ...i.styles } }));
    commitItems(next); setSelectedId(next[0]?.id || null); setProjectName("Untitled website"); setToast("New project created");
  };
  const exportProjectJson = () => {
    const blob = new Blob([JSON.stringify({ projectName, items }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "syrix-project.json"; a.click(); URL.revokeObjectURL(url);
  };
  const importProject = (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data.items)) throw new Error("Invalid project");
        commitItems(data.items); setProjectName(data.projectName || "Imported website"); setSelectedId(data.items[0]?.id || null); setToast("Project imported");
      } catch { setToast("That project file could not be opened"); }
      finally { setBusy(false); event.target.value = ""; }
    };
    reader.onerror = () => { setBusy(false); setToast("File could not be read"); };
    reader.readAsText(file);
  };

  const onDragStart = (event, type) => {
    event.dataTransfer.setData("application/syrix-element", type);
    event.dataTransfer.effectAllowed = "copy";
  };
  const onCanvasDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/syrix-element");
    const iconName = event.dataTransfer.getData("application/syrix-icon");
    if (iconName) addItem("icon", iconName);
    else if (DEFAULTS[type]) addItem(type);
  };

  const renderIcon = (name, size = 20) => {
    const Component = IconMap[name] || Sparkles;
    return <Component size={size} strokeWidth={1.8} />;
  };

  const renderCanvasItem = (item) => {
    const s = item.styles || {};
    const style = {
      color: s.color || "#172033",
      background: s.background || "transparent",
      fontSize: `${Number(s.fontSize || 16)}px`,
      borderRadius: `${Number(s.radius || 0)}px`,
      padding: `${Number(s.padding || 0)}px`,
      width: s.width || "100%",
      boxSizing: "border-box"
    };
    let child;
    if (item.type === "heading") child = <h1 style={{ ...style, margin: 0, lineHeight: 1.15, letterSpacing: "-.035em", fontWeight: 750 }}>{item.text}</h1>;
    else if (item.type === "text") child = <p style={{ ...style, margin: 0, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{item.text}</p>;
    else if (item.type === "button") child = <button style={{ ...style, border: 0, cursor: "pointer", fontWeight: 650 }} onClick={e => { e.stopPropagation(); setToast("Button interaction preview"); }}>{item.text}</button>;
    else if (item.type === "link") child = <a style={{ ...style, textDecoration: "none", display: "inline-block" }} href={item.href || "#"} onClick={e => e.preventDefault()}>{item.text}</a>;
    else if (item.type === "card") child = <article style={{ ...style, border: "1px solid #e9edf5", boxShadow: "0 8px 26px rgba(26,39,73,.05)", whiteSpace: "pre-wrap" }}>{item.text}</article>;
    else if (item.type === "container") child = <section style={{ ...style, border: "1px dashed #d8deeb", minHeight: 80, whiteSpace: "pre-wrap" }}>{item.text}</section>;
    else if (item.type === "image") child = item.src ? <img src={item.src} alt={item.text || "Image"} style={{ ...style, height: "auto", objectFit: "cover" }} /> : <div className="canvas-image-placeholder" style={{ ...style, minHeight: 150, display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon size={22} /> <span> Add an image URL in Properties</span></div>;
    else if (item.type === "input") child = <input placeholder={item.text} style={{ ...style, border: "1px solid #dce2ec", outline: "none" }} onClick={e => e.stopPropagation()} />;
    else if (item.type === "divider") child = <hr style={{ ...style, height: 1, padding: 0, border: 0, background: s.background || "#e3e7ef" }} />;
    else if (item.type === "icon") child = <span style={{ ...style, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{renderIcon(item.text, Number(s.fontSize || 28))}</span>;
    return <div key={item.id} className={`canvas-element ${selectedId === item.id ? "is-selected" : ""}`} onClick={() => setSelectedId(item.id)}>{child}{selectedId === item.id && <span className="selection-tag">{item.type}</span>}</div>;
  };

  const renderCode = () => (
    <div className="code-pane">
      <div className="pane-head code-pane-head">
        <div className="code-file-tabs">
          {[["html", "HTML", FileCode2], ["css", "CSS", Braces], ["js", "JS", Zap]].map(([key, label, Icon]) => <button key={key} className={`code-tab ${codeTab === key ? "active" : ""}`} onClick={() => setCodeTab(key)}><Icon size={14} /> {label}</button>)}
        </div>
        <span className="generated-pill"><span /> Live generated</span>
      </div>
      <div className="editor-wrap">
        <Editor
          height="100%"
          language={codeTab === "html" ? "html" : codeTab === "css" ? "css" : "javascript"}
          theme="vs"
          value={codeValue}
          options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, lineNumbers: "on", scrollBeyondLastLine: false, wordWrap: "on", automaticLayout: true, padding: { top: 16 }, renderLineHighlight: "none", overviewRulerLanes: 0, folding: true }}
          loading={<div className="editor-loading"><Spinner /><span>Loading code editor…</span></div>}
        />
      </div>
      <div className="code-foot"><span><Check size={13} /> Generated from your design</span><button onClick={() => { navigator.clipboard?.writeText(codeValue); setToast(`${codeTab.toUpperCase()} copied to clipboard`); }}><Copy size={13} /> Copy code</button></div>
    </div>
  );

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand-area">
          <button className="brand-mark" title="Change logo at public/assets/app-logo.svg" onClick={() => setToast("Logo file: public/assets/app-logo.svg")}><Code2 size={23} /></button>
          <div className="brand-copy"><strong>CODE EDITOR <span>BY SYRIX</span></strong><small>Visual website builder</small></div>
        </div>
        <div className="project-name-wrap"><FileText size={15} /><input value={projectName} aria-label="Project name" onChange={e => setProjectName(e.target.value)} /></div>
        <div className="top-actions">
          <span className="save-status"><span className="status-dot" />{savedStatus}</span>
          <button className="icon-button" title="Undo" disabled={historyIndex <= 0} onClick={() => moveHistory(-1)}><Undo2 size={17} /></button>
          <button className="icon-button" title="Redo" disabled={historyIndex >= history.length - 1} onClick={() => moveHistory(1)}><Redo2 size={17} /></button>
          <button className="secondary-button save-button" onClick={saveNow}><Save size={15} /> Save</button>
          <button className="primary-button" onClick={exportProject} disabled={busy}>{busy ? <Spinner small /> : <ArrowDownToLine size={16} />} Export ZIP</button>
          <button className="mobile-menu icon-button" onClick={() => setMobileDrawer(!mobileDrawer)} title="Open panels"><Menu size={19} /></button>
        </div>
      </header>

      <main className="workspace">
        <aside className={`left-panel ${showLeft ? "" : "panel-hidden"} ${mobileDrawer ? "mobile-open" : ""}`}>
          <div className="panel-switch">
            <button className={panel === "elements" ? "active" : ""} onClick={() => setPanel("elements")}><Plus size={15} /> Elements</button>
            <button className={panel === "icons" ? "active" : ""} onClick={() => setPanel("icons")}><Sparkles size={15} /> Icons</button>
          </div>
          {panel === "elements" ? <>
            <div className="panel-title-row"><div><h2>Elements</h2><p>Build your page block by block</p></div><button className="tiny-icon" onClick={() => setShowLeft(false)} title="Collapse panel"><PanelLeftClose size={16} /></button></div>
            <label className="search-field"><Search size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search elements..." /></label>
            <div className="library-list">
              {filteredBlocks.length === 0 && <div className="empty-state">No matching elements.</div>}
              {["Basics", "Layout", "Media", "Forms"].map(group => {
                const groupItems = filteredBlocks.filter(b => b.group === group);
                if (!groupItems.length) return null;
                return <div className="element-group" key={group}><div className="group-label">{group}</div><div className="element-grid">{groupItems.map(block => <button key={block.type} className="element-tile" draggable onDragStart={e => onDragStart(e, block.type)} onClick={() => addItem(block.type)}><span className="element-icon"><block.icon size={19} /></span><strong>{block.label}</strong><small>{block.description}</small></button>)}</div></div>;
              })}
            </div>
            <div className="panel-bottom-note"><Zap size={14} /><span>Click an element to add it, or drag it onto the canvas.</span></div>
          </> : <>
            <div className="panel-title-row"><div><h2>Icon library</h2><p>Search and add an icon to your page</p></div><button className="tiny-icon" onClick={() => setShowLeft(false)} title="Collapse panel"><PanelLeftClose size={16} /></button></div>
            <label className="search-field"><Search size={15} /><input value={iconSearch} onChange={e => setIconSearch(e.target.value)} placeholder="Search icons..." /></label>
            <div className="icon-grid">{filteredIcons.map(name => <button key={name} className="icon-tile" title={`Add ${name}`} draggable onDragStart={e => { e.dataTransfer.setData("application/syrix-icon", name); e.dataTransfer.effectAllowed = "copy"; }} onClick={() => addItem("icon", name)}>{renderIcon(name, 20)}<span>{name}</span></button>)}</div>
            <div className="panel-bottom-note"><Sparkles size={14} /><span>Built-in icon library. Drag or click an icon to add it.</span></div>
          </>}
        </aside>

        {!showLeft && <button className="reopen-tab reopen-left" onClick={() => setShowLeft(true)} title="Show elements"><PanelLeftOpen size={17} /></button>}

        <section className="center-stage">
          <div className="stage-toolbar">
            <div className="view-switch">
              <button className={mode === "design" ? "active" : ""} onClick={() => setMode("design")}><MousePointer2 size={15} /> Design</button>
              <button className={mode === "code" ? "active" : ""} onClick={() => setMode("code")}><Code2 size={15} /> Code</button>
              <button className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}><Eye size={15} /> Preview</button>
            </div>
            <div className="stage-tools">
              {mode === "design" && <div className="device-switch">
                <button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")} title="Desktop"><Monitor size={16} /></button>
                <button className={device === "tablet" ? "active" : ""} onClick={() => setDevice("tablet")} title="Tablet"><Tablet size={16} /></button>
                <button className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")} title="Mobile"><Smartphone size={16} /></button>
              </div>}
              {mode === "design" && <button className={`tiny-icon ${showCode ? "selected-toggle" : ""}`} title={showCode ? "Hide code panel" : "Show code panel"} onClick={() => setShowCode(!showCode)}>{showCode ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}</button>}
              <button className="tiny-icon" title="New project" onClick={resetProject}><Plus size={17} /></button>
              <button className="tiny-icon" title="Export project file" onClick={exportProjectJson}><ArrowDownToLine size={16} /></button>
              <button className="tiny-icon" title="Import project file" onClick={() => fileInputRef.current?.click()}><ArrowLeft size={16} /></button>
              <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={importProject} />
            </div>
          </div>

          {mode === "design" && <div className={`design-workspace ${showCode ? "with-code" : "canvas-only"}`}>
            <div className="canvas-zone">
              <div className="canvas-meta"><span><span className="live-dot" /> {device === "desktop" ? "Desktop canvas" : device === "tablet" ? "Tablet canvas" : "Mobile canvas"}</span><span>{items.length} elements</span></div>
              <div className="canvas-scroll">
                <div ref={canvasRef} className={`page-canvas device-${device}`} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }} onDrop={onCanvasDrop}>
                  <div className="canvas-page-label"><span>PAGE / HOME</span><span className="page-label-line" /></div>
                  {items.length ? items.map(renderCanvasItem) : <div className="canvas-empty"><Layers size={28} /><strong>Your canvas is ready</strong><span>Add an element from the left panel to start building.</span><button className="primary-button" onClick={() => addItem("heading")}><Plus size={15} /> Add a heading</button></div>}
                  <div className="canvas-drop-hint"><Plus size={13} /> Drop an element here</div>
                </div>
              </div>
              <div className="canvas-footer"><span><MousePointer2 size={13} /> Select an element to edit its properties</span><span>100%</span></div>
            </div>
            {showCode && renderCode()}
          </div>}

          {mode === "code" && <div className="full-mode-code">{renderCode()}</div>}
          {mode === "preview" && <div className="preview-zone"><div className="preview-toolbar"><span><Eye size={15} /> Live website preview</span><button className="secondary-button" onClick={() => setMode("design")}><ArrowLeft size={14} /> Back to design</button></div><iframe title="Website preview" sandbox="allow-scripts" srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${generated.css}</style></head><body><main class="site-shell">${items.map(i => itemMarkup(i)).join("")}</main><script>${generated.js}</script></body></html>`} /></div>}
        </section>

        <aside className={`right-panel ${showRight ? "" : "panel-hidden"}`}>
          <div className="right-head"><div><h2>Properties</h2><p>Customize your selection</p></div><button className="tiny-icon" onClick={() => setShowRight(false)} title="Collapse panel"><PanelRightClose size={16} /></button></div>
          {!showRight && null}
          {!selected ? <div className="properties-empty"><MousePointer2 size={24} /><strong>Nothing selected</strong><span>Choose an element on the canvas to edit its properties.</span></div> : <>
            <div className="selected-card"><span className="selected-type-icon">{renderIcon(BLOCKS.find(b => b.type === selected.type)?.label === "Heading" ? "Code2" : "Layers", 17)}</span><div><strong>{BLOCKS.find(b => b.type === selected.type)?.label || selected.type}</strong><small>Selected element</small></div><button className="tiny-icon" title="Delete element" onClick={deleteSelected}><Trash2 size={15} /></button><button className="tiny-icon" title="Duplicate element" onClick={duplicateSelected}><Copy size={15} /></button></div>
            <div className="property-section"><div className="property-heading">Content <ChevronDown size={14} /></div>
              {selected.type !== "divider" && selected.type !== "image" && <label className="field-label">{selected.type === "icon" ? "Icon name" : "Text / label"}<input value={selected.text || ""} onChange={e => updateSelected({ text: e.target.value })} /></label>}
              {selected.type === "image" && <label className="field-label">Image URL<input value={selected.src || ""} placeholder="https://example.com/image.jpg" onChange={e => updateSelected({ src: e.target.value })} /></label>}
              {selected.type === "link" && <label className="field-label">Link destination<input value={selected.href || ""} placeholder="https://example.com" onChange={e => updateSelected({ href: e.target.value })} /></label>}
            </div>
            <div className="property-section"><div className="property-heading">Appearance <ChevronDown size={14} /></div>
              <div className="color-row"><label className="field-label">Text color<div className="color-input-wrap"><input type="color" value={/^#[0-9a-f]{6}$/i.test(selected.styles?.color || "") ? selected.styles.color : "#172033"} onChange={e => updateSelected({ styles: { color: e.target.value } })} /><input value={selected.styles?.color || "#172033"} onChange={e => updateSelected({ styles: { color: e.target.value } })} /></div></label>
              <label className="field-label">Background<div className="color-input-wrap"><input type="color" value={/^#[0-9a-f]{6}$/i.test(selected.styles?.background || "") ? selected.styles.background : "#ffffff"} onChange={e => updateSelected({ styles: { background: e.target.value } })} /><input value={selected.styles?.background || "transparent"} onChange={e => updateSelected({ styles: { background: e.target.value } })} /></div></label></div>
              <label className="field-label">Font size <span className="field-value">{selected.styles?.fontSize || 16}px</span><input type="range" min="10" max="64" value={selected.styles?.fontSize || 16} onChange={e => updateSelected({ styles: { fontSize: Number(e.target.value) } })} /></label>
              <div className="two-fields"><label className="field-label">Padding (px)<input type="number" min="0" max="100" value={selected.styles?.padding ?? 0} onChange={e => updateSelected({ styles: { padding: Math.max(0, Number(e.target.value) || 0) } })} /></label><label className="field-label">Radius (px)<input type="number" min="0" max="100" value={selected.styles?.radius ?? 0} onChange={e => updateSelected({ styles: { radius: Math.max(0, Number(e.target.value) || 0) } })} /></label></div>
              <label className="field-label">Width<select value={selected.styles?.width || "100%"} onChange={e => updateSelected({ styles: { width: e.target.value } })}><option value="100%">Full width</option><option value="80%">80%</option><option value="60%">60%</option><option value="50%">Half width</option><option value="fit-content">Fit content</option></select></label>
            </div>
            <div className="property-section"><div className="property-heading">Element actions</div><div className="action-row"><button className="secondary-button" onClick={duplicateSelected}><Copy size={14} /> Duplicate</button><button className="danger-button" onClick={deleteSelected}><Trash2 size={14} /> Delete</button></div></div>
            <div className="properties-tip"><Sparkles size={14} /><span>Changes update the canvas and generated code automatically.</span></div>
          </>}
        </aside>
        {!showRight && <button className="reopen-tab reopen-right" onClick={() => setShowRight(true)} title="Show properties"><PanelRightOpen size={17} /></button>}
      </main>
      <footer className="app-footer"><span><span className="footer-green-dot" /> All systems ready</span><span>CODE EDITOR BY SYRIX <span className="footer-separator">·</span> Visual Builder v1.0</span><span><Globe size={13} /> Local project</span></footer>
      {busy && <LoadingOverlay message="Preparing your export…" />}
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  );
}

export default App;