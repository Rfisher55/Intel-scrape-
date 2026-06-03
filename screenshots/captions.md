# LinkedIn Asset Captions — Intel Globe OSINT Platform

All screenshots and videos show live public data only. No API keys, tokens, or private information appear in any asset. All data sourced from open APIs: GDELT Project, ReliefWeb/UN OCHA, USGS, NASA FIRMS, AIS vessel feeds, and World Bank.

---

## Screenshots

### `01-dashboard-globe.png`
**The main command center.** A custom-built Canvas 2D globe renders 195 countries color-coded by real-time threat level — red for active conflict zones, orange for instability, green for low threat — with live hotspot pins marking nuclear sites, cyberattacks, airstrikes, and maritime incidents. Intelligence module buttons span 17 columns on both sides of the screen. This is the full Palantir-style intelligence dashboard built as a single open-source HTML file.

### `02-defcon-ticker.png`
**Persistent situational awareness.** The top strip shows the current DEFCON readiness level alongside a continuously scrolling live news ticker fed by GDELT, the world's largest open-access event database. Headlines update every 5 minutes and are filtered by geopolitical severity — conflict, nuclear, and cyber events are prioritized.

### `03-nuclear-intel.png`
**Nuclear Intelligence Dashboard.** A dedicated overlay maps every declared and suspected nuclear power — the United States, Russia, China, the UK, France, India, Pakistan, Israel, and North Korea — with warhead counts, delivery systems, posture assessments, and doctrine analysis. Data is cross-referenced with open-source reporting and GDELT live events.

### `04-sanctions-tracker.png`
**Global Sanctions Registry.** Tracks active US OFAC, EU, and UN Security Council sanctions regimes in real time. Covers sanction targets by country, sector, and individual designation — with GDELT live feed injected to surface breaking sanctions news the moment it hits international media.

### `05-terror-watch.png`
**Global Terrorism & Extremism Watch.** Live tracking of designated terrorist organizations by threat level (CRITICAL / HIGH / MEDIUM). Each entry shows current operational status, active regions, and a GDELT live event count pulling real-time incident reporting. Covers ISIS/ISIL, al-Qaeda, Hamas, Hezbollah, al-Shabaab, Boko Haram, Taliban, Houthis, and more.

### `06-maritime-intel.png`
**Maritime Disputes & Sea Control Intelligence.** Full-page overlay covering the South China Sea, Taiwan Strait, East China Sea, and other contested maritime zones. Shows current territorial claims, recent naval incidents, and live shipping intelligence from AIS vessel feeds. Built for situational awareness of critical chokepoints and sea lane security.

### `07-cyber-breach.png`
**Cyber Breach Tracker.** Monitors reported state-sponsored and criminal cyber intrusions, infrastructure attacks, and ransomware campaigns. Live GDELT feed surfaces breaking cybersecurity incidents as they hit international news — nation-state actors, targets, and attribution all tracked.

### `08-ic-brief.png`
**Intelligence Community Daily Brief.** An IC Brief-format daily summary aggregating signals from across all active overlays — modeling the structure of a professional intelligence brief with sourcing citations (GDELT, ReliefWeb, open source). Auto-populated with today's date and current global situation.

### `09-sitrep.png`
**Global Situation Report (SITREP).** A structured situation report overlay showing active conflict count, crisis level metrics, and a written analytical summary of the current global intelligence environment. Mirrors the format of professional military and intelligence SITREP documents — automatically generated from live data aggregation.

### `10-intel-matrix.png`
**Intelligence Matrix.** A comparative cross-domain assessment matrix linking active threats across nuclear, cyber, conventional military, and hybrid domains. Shows threat actor relationships and cross-domain escalation risk — the kind of multi-domain threat visualization used in professional intelligence analysis.

### `11-country-usa.png`
**Country Intelligence File — United States.** Clicking any country on the globe opens a full intelligence dossier: government composition, military order of battle, economic assessment (GDP trend), alliance networks, primary vulnerabilities, intelligence gaps, and a CIA-style analyst note. Live GDELT and diplomatic event feeds update in real time. 195 countries have complete profiles.

### `12-country-russia.png`
**Country Intelligence File — Russia.** Same deep-profile format for Russia: Kremlin structure, nuclear arsenal (6,257 warheads, 1,588 deployed), military doctrine, hybrid warfare capabilities, sanctions impact, and ongoing conflict operations. Analyst note covers strategic assessment and long-term threat vector.

### `13-foreign-sig.png`
**Foreign Signals Intelligence (SIGINT) Feed.** Live aggregation of foreign signals, intercept-derived reporting (open-source), and diplomatic communications monitoring. Shows current signals collection priorities and live GDELT event feeds filtered for signals-relevant geopolitical developments.

### `14-unsc-overlay.png`
**UN Security Council Intelligence.** Tracks active UNSC resolutions, veto activity, sanctions regimes, and peacekeeping deployments in real time. GDELT live feed surfaces UN-related breaking news — useful for monitoring multilateral diplomatic action and deadlocks.

### `15-live-status-bar.png`
**Live Feed Status Bar.** The persistent bottom bar shows the real-time health of all five data pipeline sources: GDELT (global events), ReliefWeb (humanitarian), USGS (seismic), NASA FIRMS (satellite), and AIS (maritime vessel tracking). Green = live and healthy; degraded sources show warning state.

### `16-mobile-dashboard.png`
**iPhone-Optimized Dashboard.** On mobile (≤390px), the globe remains the centerpiece and the data layer panel collapses into a clean left sidebar. The "INTEL MENU" button at bottom opens the full intelligence category browser — 55+ modules accessible via touch-first navigation. No functionality is lost on mobile vs. desktop.

### `17-mobile-intel-menu.png`
**Mobile INTEL MENU — Category Browser.** The full intelligence module directory optimized for iPhone. All 55+ intelligence categories are accessible: Conflicts, Cyber, Nuclear, Terror, Maritime, SIGINT, Humanitarian, and more — each opening a full-screen overlay. Designed to CIA/DIA dashboard aesthetics scaled for mobile.

---

## Videos

### `video1-desktop-walkthrough.webm`
**Desktop intelligence platform walkthrough.** A 25-second tour of the full dashboard: the globe rotates with live country threat coloring, the Nuclear Intelligence overlay opens to reveal the global nuclear posture assessment, then the Sanctions Tracker loads with live GDELT-sourced breaking news injected at the top. Shows the complete flow from globe interaction to deep-dive intelligence analysis — all powered by public open APIs with no authentication.

### `video2-mobile-flow.webm`
**Mobile experience — INTEL MENU to module.** A 20-second capture on iPhone viewport (390×844px) showing the mobile intelligence workflow: the globe loads with threat coloring, the INTEL MENU opens to reveal the category browser, and a module is selected to show the full-screen intelligence panel with live data. Demonstrates that the full intelligence platform is accessible on mobile without compromising depth.

---

## Architecture Diagram

### `architecture-diagram.png`
**System architecture — public data sources to intelligence display.** A four-layer diagram showing how the platform works at a systems level: public APIs (GDELT, ReliefWeb, USGS, NASA FIRMS, AIS, World Bank) feed into an ingestion layer (GDELT semantic query builder + async fetch engine + universal live feed injector), which processes and deduplicates data before rendering across the intelligence display layer (globe, 143 overlays, country files, live ticker, mobile UI). Zero secrets, zero backend — a 39,000-line single-file web application.
