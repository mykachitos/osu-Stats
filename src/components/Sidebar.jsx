import React, { useState, useRef, useEffect } from 'react';
import { useLang, useTheme, fmt } from '../App';
import { MOCK_PLAYER } from '../constants/mockData';

const NAV_ITEMS = (t) => [
  { id: "dashboard", icon: "⊞", label: t.nav.dashboard },
  { id: "profile",   icon: "◉", label: t.nav.profile },
  { id: "stats",     icon: "◈", label: t.nav.stats },
  { id: "maps",      icon: "♪", label: t.nav.maps },
  { id: "admin",     icon: "⚙", label: t.nav.admin },
];

const SettingsPanel = ({ onClose, anchorRef }) => {
  const { lang, setLang } = useLang();
  const { theme, themeKey, setTheme } = useTheme();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const THEME_LABELS = {
    midnight: { en: 'Sakura Night', ru: 'Сакура Ночь' },
    obsidian: { en: 'Lavender Dream', ru: 'Лаванда' },
    ember:    { en: 'Peach Blossom', ru: 'Персик' },
    dark:     { en: 'Pure Dark', ru: 'Тёмная' },
    ocean:    { en: 'Deep Ocean', ru: 'Океан' },
  };

  return (
    <div ref={panelRef} style={{
      position: 'fixed',
      left: 84,
      bottom: 20,
      zIndex: 500,
      width: 240,
      background: 'var(--card2)',
      border: '1px solid var(--border)',
      borderRadius: 18,
      padding: '18px 16px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      animation: 'fadeUp 0.25s cubic-bezier(.34,1.4,.64,1) both',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--a3)' }}>
          {lang === 'ru' ? '⚙ Настройки' : '⚙ Settings'}
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'var(--muted)',
          cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px',
        }}>×</button>
      </div>

      {/* Language */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
          {lang === 'ru' ? 'Язык' : 'Language'}
        </div>
        <div style={{
          display: 'flex', background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {['en', 'ru'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 800,
              background: lang === l ? 'var(--a)' : 'transparent',
              color: lang === l ? 'white' : 'var(--muted)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s', borderRadius: 0,
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
          {lang === 'ru' ? 'Тема' : 'Theme'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(THEME_LABELS).map(([k, labels]) => {
            const isActive = themeKey === k;
            return (
              <button key={k} onClick={() => setTheme(k)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 11, border: '1px solid',
                borderColor: isActive ? 'var(--a)' : 'var(--border)',
                background: isActive ? 'var(--dim)' : 'transparent',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                textAlign: 'left',
              }}>
                <ThemeDot themeKey={k} />
                <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--a3)' : 'var(--muted)' }}>
                  {lang === 'ru' ? labels.ru : labels.en}
                </span>
                {isActive && <span style={{ marginLeft: 'auto', color: 'var(--a)', fontSize: 12 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ThemeDot = ({ themeKey: k }) => {
  const gradients = {
    midnight: 'linear-gradient(135deg, #ff6eb4, #d44f8e)',
    obsidian: 'linear-gradient(135deg, #ba8cff, #8b5cf6)',
    ember:    'linear-gradient(135deg, #ff96aa, #e05575)',
    dark:     'linear-gradient(135deg, #3a3a4a, #1a1a2e)',
    ocean:    'linear-gradient(135deg, #4fc3f7, #0288d1)',
  };
  return (
    <div style={{
      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
      background: gradients[k] || '#333',
    }} />
  );
};

const Sidebar = ({ page, setPage, open }) => {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const navItems = NAV_ITEMS(t);
  const [showSettings, setShowSettings] = useState(false);
  const settingsBtnRef = useRef(null);

  const initial = (MOCK_PLAYER.username || 'S').charAt(0).toUpperCase();

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`} style={{
        width: 78,
        minHeight: '100vh',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 200,
      }}>
        {/* Logo */}
        <div style={{
          width: 44, height: 44, borderRadius: 14, marginBottom: 16, marginTop: 4,
          background: 'var(--grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: 'white', fontWeight: 900,
          boxShadow: '0 4px 16px var(--glow)',
          fontFamily: "'M PLUS Rounded 1c', sans-serif",
          flexShrink: 0,
        }}>o!</div>

        {/* Nav items */}
        {navItems.map(n => {
          const isActive = page === n.id;
          return (
            <div
              key={n.id}
              onClick={() => setPage(n.id)}
              title={n.label}
              style={{
                width: 54, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '10px 6px', borderRadius: 14, cursor: 'pointer',
                transition: 'all 0.2s',
                background: isActive ? 'var(--dim)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                color: isActive ? 'var(--a)' : 'var(--muted)',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--dim)';
                  e.currentTarget.style.color = 'var(--a3)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--muted)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 28, borderRadius: '0 3px 3px 0',
                  background: 'var(--a)', boxShadow: '0 0 8px var(--glow)',
                }} />
              )}
              <span style={{ fontSize: 18, lineHeight: 1 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.3, lineHeight: 1, textAlign: 'center' }}>
                {n.label}
              </span>
            </div>
          );
        })}

        {/* Bottom: settings + avatar */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
          {/* Settings */}
          <div
            ref={settingsBtnRef}
            onClick={() => setShowSettings(v => !v)}
            title={lang === 'ru' ? 'Настройки' : 'Settings'}
            style={{
              width: 54, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '10px 6px', borderRadius: 14, cursor: 'pointer',
              transition: 'all 0.2s',
              background: showSettings ? 'var(--dim)' : 'transparent',
              border: `1px solid ${showSettings ? 'var(--border)' : 'transparent'}`,
              color: showSettings ? 'var(--a)' : 'var(--muted)',
            }}
            onMouseEnter={e => {
              if (!showSettings) {
                e.currentTarget.style.background = 'var(--dim)';
                e.currentTarget.style.color = 'var(--a3)';
              }
            }}
            onMouseLeave={e => {
              if (!showSettings) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--muted)';
              }
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>⚙</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.3, lineHeight: 1 }}>
              {lang === 'ru' ? 'Настр.' : 'Settings'}
            </span>
          </div>

        </div>
      </aside>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          anchorRef={settingsBtnRef}
        />
      )}
    </>
  );
};

export default Sidebar;