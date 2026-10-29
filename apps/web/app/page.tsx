"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type IconName =
  | "grid"
  | "plus"
  | "users"
  | "chart"
  | "settings"
  | "search"
  | "arrow"
  | "play"
  | "copy"
  | "spark";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    plus: "M12 5v14M5 12h14",
    users:
      "M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H7.4A3.4 3.4 0 0 0 4 18.4V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 4.2a3.5 3.5 0 0 1 0 6.6M20 20v-1.6a3.4 3.4 0 0 0-2.5-3.3",
    chart:
      "M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-7",
    settings:
      "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z",
    search: "m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
    arrow: "M5 12h13M13 6l6 6-6 6",
    play: "m9 6 8 6-8 6V6Z",
    copy: "M8 8h10v12H8zM6 16H4V4h10v2",
    spark:
      "m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z",
  };

  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
      <path d={paths[name]} />
    </svg>
  );
}

const recentRooms = [
  { title: "Physics: Motion & Forces", code: "MOTION7", people: 28, time: "Today, 10:42 AM", color: "coral" },
  { title: "Weekly Design Critique", code: "DESIGN4", people: 16, time: "Yesterday, 2:15 PM", color: "violet" },
  { title: "Introduction to Economics", code: "ECON101", people: 34, time: "Mon, 9:05 AM", color: "mint" },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [notice, setNotice] = useState("");

  function submitCreate(event: FormEvent) {
    event.preventDefault();
    if (!roomTitle.trim()) return;
    setNotice(`"${roomTitle}" is ready to connect.`);
    setShowCreate(false);
    setRoomTitle("");
  }

  function submitJoin(event: FormEvent) {
    event.preventDefault();
    if (!roomCode.trim()) return;
    setNotice(`Joining room ${roomCode.toUpperCase()}...`);
    setShowJoin(false);
    setRoomCode("");
  }

  return (
    <main className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}><Icon name="spark" /></div>
          <span>pulse<span className={styles.brandDot}>.</span></span>
        </div>
        <div className={styles.workspaceLabel}>WORKSPACE</div>
        <nav className={styles.nav}>
          {([
            ["Overview", "grid"],
            ["My rooms", "users"],
            ["Insights", "chart"],
          ] as const).map(([label, icon]) => (
            <button
              className={`${styles.navItem} ${activeNav === label ? styles.navItemActive : ""}`}
              key={label}
              onClick={() => setActiveNav(label)}
            >
              <Icon name={icon as IconName} /> {label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <button className={styles.navItem}><Icon name="settings" /> Settings</button>
          <div className={styles.profile}>
            <div className={styles.avatar}>AM</div>
            <div><strong>Alex Morgan</strong><span>Teacher account</span></div>
            <span className={styles.more}>•••</span>
          </div>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.mobileBrand}><div className={styles.brandMark}><Icon name="spark" /></div><strong>pulse<span className={styles.brandDot}>.</span></strong></div>
          <div className={styles.breadcrumb}><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div>
          <div className={styles.topbarActions}>
            <button className={styles.searchButton}><Icon name="search" /><span>Search</span><kbd>⌘ K</kbd></button>
            <button className={styles.helpButton}>?</button>
            <div className={styles.avatar}>AM</div>
          </div>
        </header>

        <div className={styles.pageContent}>
          <div className={styles.welcomeRow}>
            <div>
              <p className={styles.eyebrow}>TUESDAY, OCTOBER 29, 2026</p>
              <h1>Good morning, Alex <span>✦</span></h1>
              <p className={styles.subheading}>Make every voice count in the room.</p>
            </div>
            <div className={styles.headerButtons}>
              <button className={styles.secondaryButton} onClick={() => setShowJoin(true)}>Join a room <Icon name="arrow" /></button>
              <button className={styles.primaryButton} onClick={() => setShowCreate(true)}><Icon name="plus" /> Create room</button>
            </div>
          </div>

          {notice && <div className={styles.notice}><span>✓</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}

          <section className={styles.heroCard}>
            <div className={styles.heroCopy}>
              <span className={styles.livePill}><i /> LIVE NOW</span>
              <h2>Turn a quiet room<br />into a <em>conversation.</em></h2>
              <p>Launch an interactive poll and see what your audience thinks, in real time.</p>
              <button className={styles.heroButton} onClick={() => setShowCreate(true)}>Start a live poll <Icon name="arrow" /></button>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.pulseCircle}><span>42</span><small>responses</small></div>
              <div className={`${styles.floatCard} ${styles.floatCardOne}`}><span className={styles.check}>✓</span><div><strong>Love this!</strong><small>84% agree</small></div></div>
              <div className={`${styles.floatCard} ${styles.floatCardTwo}`}><span className={styles.miniAvatar}>JD</span><div><strong>Jamie answered</strong><small>just now</small></div></div>
              <div className={styles.sparkle}>✦</div>
            </div>
          </section>

          <div className={styles.sectionHeading}><div><h2>Your workspace</h2><p>Everything you need to keep your audience engaged.</p></div><button className={styles.textButton}>View analytics <Icon name="arrow" /></button></div>
          <div className={styles.statsGrid}>
            <article className={styles.statCard}><div className={`${styles.statIcon} ${styles.orange}`}><Icon name="play" /></div><div><span>Sessions hosted</span><strong>24</strong><small className={styles.positive}>↗ 18% <b>vs last month</b></small></div></article>
            <article className={styles.statCard}><div className={`${styles.statIcon} ${styles.blue}`}><Icon name="users" /></div><div><span>Total participants</span><strong>684</strong><small className={styles.positive}>↗ 24% <b>vs last month</b></small></div></article>
            <article className={styles.statCard}><div className={`${styles.statIcon} ${styles.purple}`}><Icon name="chart" /></div><div><span>Avg. response rate</span><strong>86.4%</strong><small className={styles.positive}>↗ 6.2% <b>vs last month</b></small></div></article>
          </div>

          <section className={styles.roomsSection}>
            <div className={styles.sectionHeading}><div><h2>Recent rooms</h2><p>Pick up where you left off.</p></div><button className={styles.textButton}>See all rooms <Icon name="arrow" /></button></div>
            <div className={styles.roomList}>
              {recentRooms.map((room) => <article className={styles.roomRow} key={room.code}>
                <div className={`${styles.roomThumbnail} ${styles[room.color]}`}><span>{(room.title.split(":")[0] ?? room.title).slice(0, 2).toUpperCase()}</span></div>
                <div className={styles.roomInfo}><strong>{room.title}</strong><span>{room.code} <i /> {room.people} participants</span></div>
                <span className={styles.roomTime}>{room.time}</span>
                <button className={styles.roomAction}><Icon name="arrow" /></button>
              </article>)}
            </div>
          </section>
        </div>
      </section>

      {showCreate && <div className={styles.modalBackdrop} onClick={() => setShowCreate(false)}><form className={styles.modal} onSubmit={submitCreate} onClick={(event) => event.stopPropagation()}><button type="button" className={styles.close} onClick={() => setShowCreate(false)}>×</button><span className={styles.modalIcon}><Icon name="plus" /></span><h2>Create a room</h2><p>Set up a space for your next live conversation.</p><label>Room title<input autoFocus value={roomTitle} onChange={(event) => setRoomTitle(event.target.value)} placeholder="e.g. Friday team check-in" /></label><button className={styles.primaryButton} type="submit">Create room <Icon name="arrow" /></button></form></div>}
      {showJoin && <div className={styles.modalBackdrop} onClick={() => setShowJoin(false)}><form className={styles.modal} onSubmit={submitJoin} onClick={(event) => event.stopPropagation()}><button type="button" className={styles.close} onClick={() => setShowJoin(false)}>×</button><span className={`${styles.modalIcon} ${styles.blue}`}><Icon name="users" /></span><h2>Join a room</h2><p>Enter the room code shared by your host.</p><label>Room code<input autoFocus value={roomCode} onChange={(event) => setRoomCode(event.target.value)} placeholder="e.g. MOTION7" /></label><button className={styles.primaryButton} type="submit">Join room <Icon name="arrow" /></button></form></div>}
    </main>
  );
}
