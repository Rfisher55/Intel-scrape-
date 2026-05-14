#!/usr/bin/env python3
"""
Intel Globe - Python backend server
Serves the frontend and provides JSON Intel API.
Run: python3 server.py
"""

import json
import os
import sys
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

# ── Mock intel data ────────────────────────────────────────────────────────────

MOCK_INTEL = {
    "ISR": {
        "alertLevel": "HIGH",
        "summary": "Israel remains engaged in multi-front military operations. Gaza ground campaign continues with ongoing hostage negotiations mediated by Qatar and Egypt. Northern border with Lebanon shows reduced but persistent Hezbollah activity. Diplomatic normalization with Saudi Arabia stalled. Iran continues threatening rhetoric alongside reported drone and missile development.",
        "threats": [
            {"type":"Military","description":"Active Gaza campaign with IDF ground and air operations","severity":"critical"},
            {"type":"Missile","description":"Hezbollah rocket capability estimated at 150,000+ projectiles","severity":"high"},
            {"type":"Cyber","description":"Ongoing Iranian state-sponsored cyber operations targeting infrastructure","severity":"high"},
            {"type":"Diplomatic","description":"Regional normalization process disrupted by Gaza conflict","severity":"medium"}
        ],
        "keyActors": ["IDF","Mossad","Shin Bet","Hamas","Hezbollah","Iran IRGC"],
        "recentEvents": [
            "IDF reports elimination of senior Hamas command structure",
            "Iron Dome intercepts projectiles from northern border",
            "Hostage deal negotiations ongoing in Doha",
            "US $14.1B emergency military aid package approved"
        ],
        "economicIndicator": "Wartime budget: defense spending at 8.2% of GDP. Shekel under pressure."
    },
    "PSE": {
        "alertLevel": "CRITICAL",
        "summary": "Gaza Strip experiencing catastrophic humanitarian crisis under sustained Israeli military operations. West Bank tension elevated with IDF incursions into Jenin and Tulkarm. Palestinian Authority governance fragmented. International pressure mounting for ceasefire and two-state solution.",
        "threats": [
            {"type":"Humanitarian","description":"Acute food, water, and medical supply shortages across Gaza","severity":"critical"},
            {"type":"Military","description":"Ongoing IDF ground operations in Rafah and northern Gaza","severity":"critical"},
            {"type":"Political","description":"Hamas-PA governance split deepens, post-war governance unclear","severity":"high"},
            {"type":"Displacement","description":"1.9M+ displaced persons within Gaza Strip","severity":"critical"}
        ],
        "keyActors": ["Hamas","Palestinian Authority","UNRWA","IDF","Islamic Jihad"],
        "recentEvents": [
            "Ceasefire negotiations ongoing, Phase 2 terms disputed",
            "UNRWA reports 80% of health facilities non-functional",
            "ICC arrest warrant implications for regional diplomacy",
            "West Bank settler activity escalating in Area C"
        ],
        "economicIndicator": "Economy functionally collapsed in Gaza. West Bank GDP contracted 25%."
    },
    "IRN": {
        "alertLevel": "HIGH",
        "summary": "Iran maintains its 'Axis of Resistance' proxy network across the region while advancing nuclear enrichment to near-weapons-grade levels. IRGC Quds Force operations in Iraq, Syria, Lebanon, and Yemen continue. Domestic economic pressure from sanctions mounts.",
        "threats": [
            {"type":"Nuclear","description":"60% U-235 enrichment, breakout timeline estimated at 1-2 weeks","severity":"critical"},
            {"type":"Proxy","description":"IRGC funding/arming Hamas, Hezbollah, Houthis, Iraqi PMFs","severity":"high"},
            {"type":"Missile","description":"Shahab, Emad, Fattah hypersonic missile arsenal expanding","severity":"high"},
            {"type":"Cyber","description":"APT33/34/35 units active against Gulf and Western targets","severity":"medium"}
        ],
        "keyActors": ["IRGC","Quds Force","Supreme Leader Khamenei","Hezbollah","Houthis"],
        "recentEvents": [
            "IAEA reports 22kg near-weapons-grade uranium stockpile",
            "Iran reportedly supplied Hezbollah with precision missile guidance",
            "Direct missile exchange with Israel marks unprecedented escalation",
            "US and EU sanctions tightened on oil exports"
        ],
        "economicIndicator": "Rial at historic lows. Inflation 42%. Sanctions costing $60B+ annually."
    },
    "IRQ": {
        "alertLevel": "MEDIUM",
        "summary": "Iraq navigates complex balancing act between US military presence and dominant Iranian influence. PMF units conduct periodic strikes against US assets. ISIS remnants active in Anbar and Kirkuk.",
        "threats": [
            {"type":"Militia","description":"Iran-backed PMF groups conducting drone/rocket attacks on US bases","severity":"high"},
            {"type":"Terrorism","description":"ISIS cells active in Anbar, Diyala, and Kirkuk provinces","severity":"medium"},
            {"type":"Political","description":"Government paralysis amid PM balancing US-Iran pressure","severity":"medium"}
        ],
        "keyActors": ["PMF","Kataib Hezbollah","KDP","PUK","US CENTCOM","IRGC Quds Force"],
        "recentEvents": [
            "PMF agrees to cease attacks on US forces",
            "ISIS attack kills 10 in Anbar province ambush",
            "Oil production reaches 4.4M bpd record",
            "US-Iraq talks on military withdrawal timeline ongoing"
        ],
        "economicIndicator": "Oil revenues strong at $7B/month. Reconstruction progress slow."
    },
    "SYR": {
        "alertLevel": "HIGH",
        "summary": "Syria remains fractured with Assad government, HTS (Idlib), SDF (northeast), and Turkish proxies (north). Israeli airstrikes on Iranian positions continue. Russian military presence maintained.",
        "threats": [
            {"type":"Conflict","description":"Multiple armed factions in active territorial disputes","severity":"high"},
            {"type":"Airstrike","description":"Regular Israeli strikes on IRGC and Hezbollah logistics","severity":"medium"},
            {"type":"Humanitarian","description":"6.8M internally displaced, 5.5M external refugees","severity":"critical"}
        ],
        "keyActors": ["Assad Government","HTS","SDF/YPG","Turkish-backed FSA","IRGC","Russian Forces"],
        "recentEvents": [
            "HTS expands control in Idlib",
            "Israel strikes Iranian weapons depot near Damascus",
            "Chemical weapons investigation renewed by OPCW",
            "Arab League re-engagement with Damascus"
        ],
        "economicIndicator": "GDP collapsed 90% since 2011. Sanctions block recovery."
    },
    "LBN": {
        "alertLevel": "HIGH",
        "summary": "Lebanon in political and economic freefall. Hezbollah controlling significant territory. Post-Beirut blast reconstruction stalled. Banking sector collapsed. Presidential vacancy continues.",
        "threats": [
            {"type":"Hezbollah","description":"Rearming in violation of UNSC 1701, 150K+ rocket arsenal","severity":"high"},
            {"type":"Economic","description":"Banking system collapsed, pound lost 98% of value since 2019","severity":"critical"},
            {"type":"Political","description":"Presidential vacuum, government formation blocked","severity":"high"}
        ],
        "keyActors": ["Hezbollah","Lebanese Armed Forces","UNIFIL","Iran","Saudi Arabia","France"],
        "recentEvents": [
            "Ceasefire with Israel holding with violations",
            "IMF talks resumed on $3B bailout package",
            "Hezbollah rearming via Syrian corridor",
            "New presidential election attempt scheduled"
        ],
        "economicIndicator": "GDP collapsed 40%. Unemployment 40%+. Poverty rate 80%."
    },
    "SAU": {
        "alertLevel": "MEDIUM",
        "summary": "Saudi Arabia advances Vision 2030 while managing Yemen ceasefire fragility and Iran rivalry. OPEC+ production management central to global oil markets. MBS consolidates power.",
        "threats": [
            {"type":"Houthi","description":"Houthi missile and drone attacks on Saudi infrastructure","severity":"medium"},
            {"type":"Iran","description":"Iranian regional expansion threatens Saudi sphere","severity":"medium"},
            {"type":"Economic","description":"Oil price volatility threatens Vision 2030 timeline","severity":"medium"}
        ],
        "keyActors": ["MBS (Crown Prince)","Saudi ARAMCO","Houthi Movement","Iran","US CENTCOM"],
        "recentEvents": [
            "Saudi-Iran normalization shows strain over Gaza",
            "NEOM megacity faces funding challenges",
            "Aramco secondary offering raises $12B",
            "Yemen coalition in limited ceasefire"
        ],
        "economicIndicator": "GDP $1.06T. Vision 2030 on track. Oil revenues funding $500B+ projects."
    },
    "YEM": {
        "alertLevel": "HIGH",
        "summary": "Yemen split between Houthi-controlled north and Saudi-backed government south. Houthis continue Red Sea shipping attacks. 21M people needing humanitarian aid.",
        "threats": [
            {"type":"Houthi","description":"Ongoing Red Sea drone/missile attacks on commercial shipping","severity":"high"},
            {"type":"Humanitarian","description":"21M of 33M population requiring humanitarian assistance","severity":"critical"},
            {"type":"Civil War","description":"Houthi-government conflict with multiple armed factions","severity":"high"}
        ],
        "keyActors": ["Houthi Movement (Ansar Allah)","Presidential Leadership Council","Saudi Coalition","US Navy","IRGC"],
        "recentEvents": [
            "Houthis claim attacks on 45+ vessels",
            "US/UK Operation Prosperity Guardian strikes Houthi sites",
            "UN-mediated prisoner exchange",
            "Cholera outbreak in Hodeidah province"
        ],
        "economicIndicator": "Economy destroyed. 80% depend on imports blocked by conflict."
    },
    "TUR": {
        "alertLevel": "MEDIUM",
        "summary": "Turkey plays multi-vector role as NATO member, maintains Russia ties, mediates conflicts, conducts operations against Kurdish PKK/YPG. Economy recovering from 2023 lira crisis.",
        "threats": [
            {"type":"Kurdish","description":"PKK attacks inside Turkey; YPG presence on Syrian border","severity":"medium"},
            {"type":"Economic","description":"Inflation normalizing from 85% peak; lira still fragile","severity":"medium"},
            {"type":"Refugee","description":"3.6M registered Syrian refugees; political pressure growing","severity":"medium"}
        ],
        "keyActors": ["Erdogan","Turkish Armed Forces","MIT Intelligence","PKK","YPG/SDF","NATO"],
        "recentEvents": [
            "Operation Claw-Lock expanded against PKK in Iraq",
            "Turkey-Greece maritime boundary talks resume",
            "F-16 Block 70 delivery confirmed",
            "Swedish NATO accession approved"
        ],
        "economicIndicator": "GDP $1.1T. Inflation 65% (down from 85%). Tourism $55B record."
    },
    "JOR": {
        "alertLevel": "LOW",
        "summary": "Jordan maintains stability as moderate regional anchor. King Abdullah navigates US alliance and Palestinian cause. Gaza conflict strains public opinion.",
        "threats": [
            {"type":"Refugee","description":"2M+ Palestinian refugees; 660K Syrian refugees","severity":"medium"},
            {"type":"Economic","description":"Water scarcity and energy costs remain structural vulnerabilities","severity":"medium"}
        ],
        "keyActors": ["King Abdullah II","GID Intelligence","Palestinian Refugees","US CENTCOM","IMF"],
        "recentEvents": [
            "Jordan intercepts Iranian-backed drones targeting Israel",
            "IMF $1.2B Extended Fund Facility approved",
            "Israel-Jordan water-for-energy deal renegotiating",
            "Joint military exercises with US, UK, France"
        ],
        "economicIndicator": "GDP $50B. Debt 90% of GDP. Remittances $4B annually."
    },
    "EGY": {
        "alertLevel": "LOW",
        "summary": "Egypt under Sisi manages Gaza border pressure, economic crisis. Rafah crossing central to Gaza humanitarian corridor. Nile water dispute with Ethiopia ongoing.",
        "threats": [
            {"type":"Economic","description":"Foreign exchange crisis, pound devalued 50%+, IMF bailout required","severity":"high"},
            {"type":"Ethiopia","description":"GERD dam threatens Nile water security for 100M Egyptians","severity":"medium"}
        ],
        "keyActors": ["President Sisi","Egyptian Military","IMF","Ethiopia"],
        "recentEvents": [
            "IMF $8B deal approved",
            "Egypt brokers Gaza ceasefire talks",
            "GERD negotiations stalled",
            "GCC $20B investment package pledged"
        ],
        "economicIndicator": "GDP $395B. Inflation 34%. IMF $8B program underway."
    },
    "ARE": {
        "alertLevel": "LOW",
        "summary": "UAE operates as global financial/diplomatic hub. Abraham Accords normalization with Israel strained. Robust economic diversification.",
        "threats": [
            {"type":"Cyber","description":"Targeted by Iranian and state-sponsored cyber operations","severity":"medium"}
        ],
        "keyActors": ["MBZ (President)","ADNOC","Dubai Inc.","US CENTCOM"],
        "recentEvents": [
            "Abraham Accords trade with Israel reduced",
            "UAE-China Huawei 5G compromise",
            "Dubai GDP at record highs",
            "G42-Microsoft partnership $1.5B"
        ],
        "economicIndicator": "GDP $504B. Dubai growing 4.3%. Diversified economy."
    },
    "QAT": {
        "alertLevel": "LOW",
        "summary": "Qatar exercises outsized diplomatic influence as Hamas-Israel mediator and host of Hamas political bureau. US Al Udeid base home. LNG wealth insulates from instability.",
        "threats": [
            {"type":"Diplomatic","description":"Hamas hosting creates friction with Western partners","severity":"low"}
        ],
        "keyActors": ["Emir Tamim","QIA (Sovereign Fund)","Hamas Political Bureau","US Al Udeid Base"],
        "recentEvents": [
            "Qatar-mediated ceasefire talks Phase 2",
            "LNG contracts renegotiated at premium",
            "Qatar Airways fleet expansion",
            "US military cooperation extended 10 years"
        ],
        "economicIndicator": "GDP $225B. World's highest GDP per capita. LNG exports $60B+/year."
    },
    "KWT": {
        "alertLevel": "LOW",
        "summary": "Kuwait maintains stable constitutional monarchy with US military presence. Oil wealth managed through Kuwait Investment Authority.",
        "threats": [
            {"type":"Political","description":"Parliamentary-government deadlock stalls economic reforms","severity":"medium"}
        ],
        "keyActors": ["Emir Sheikh Mishal","KIA (Sovereign Fund)","US Camp Arifjan"],
        "recentEvents": [
            "Emir dissolves parliament again",
            "KIA assets exceed $800B",
            "OPEC+ quota 2.6M bpd maintained"
        ],
        "economicIndicator": "GDP $162B. $800B sovereign wealth fund."
    },
    "BHR": {
        "alertLevel": "LOW",
        "summary": "Bahrain hosts US Fifth Fleet, aligned with Saudi Arabia and UAE. Abraham Accords signatory. Shia majority governed by Sunni monarchy.",
        "threats": [
            {"type":"Sectarian","description":"Shia majority grievances exploited by Iran for influence","severity":"medium"}
        ],
        "keyActors": ["King Hamad","Al Khalifa Ruling Family","US Fifth Fleet"],
        "recentEvents": [
            "Bahrain-Israel normalization trade expanded",
            "US Fifth Fleet base expansion approved",
            "F1 Grand Prix proceeds",
            "Shia opposition leaders remain imprisoned"
        ],
        "economicIndicator": "GDP $44B. Oil reserves near depletion by 2030."
    },
    "OMN": {
        "alertLevel": "LOW",
        "summary": "Oman under Sultan Haitham maintains traditional neutrality. Back-channel for US-Iran communications. Controls Strait of Hormuz approach.",
        "threats": [
            {"type":"Economic","description":"Oil reserves limited; diversification needed","severity":"low"}
        ],
        "keyActors": ["Sultan Haitham","Omani Intelligence","US CENTCOM","Iran Foreign Ministry"],
        "recentEvents": [
            "Oman hosts indirect Iran-US nuclear talks",
            "DUQM port attracting $30B investment",
            "Oman mediates Yemen humanitarian corridor"
        ],
        "economicIndicator": "GDP $108B. Vision 2040 on track. Logistics and tourism growing."
    }
}

CONFLICTS = [
    {"from":"ISR","to":"PSE","type":"war","label":"Gaza Conflict","severity":"critical"},
    {"from":"ISR","to":"LBN","type":"conflict","label":"Hezbollah Confrontation","severity":"high"},
    {"from":"ISR","to":"IRN","type":"proxy_war","label":"Shadow War","severity":"high"},
    {"from":"ISR","to":"SYR","type":"airstrike","label":"Israeli Airstrikes on Syria","severity":"medium"},
    {"from":"IRN","to":"SAU","type":"rivalry","label":"Regional Rivalry","severity":"medium"},
    {"from":"IRN","to":"YEM","type":"proxy","label":"Houthi Proxy Support","severity":"high"},
    {"from":"IRN","to":"LBN","type":"support","label":"Hezbollah Arming & Funding","severity":"high"},
    {"from":"IRN","to":"IRQ","type":"influence","label":"Iranian Political Influence","severity":"medium"},
    {"from":"IRN","to":"PSE","type":"support","label":"Hamas Support Network","severity":"high"},
    {"from":"SAU","to":"YEM","type":"war","label":"Coalition Military Campaign","severity":"high"},
    {"from":"TUR","to":"SYR","type":"conflict","label":"Border Ops / Kurdish","severity":"medium"},
    {"from":"EGY","to":"PSE","type":"border","label":"Rafah Border Crisis","severity":"medium"},
    {"from":"JOR","to":"ISR","type":"border","label":"Border Security Agreement","severity":"low"},
    {"from":"ARE","to":"IRN","type":"rivalry","label":"Gulf Territorial Tensions","severity":"low"},
]

COUNTRY_COORDS = {
    "ISR": {"lat":31.5,"lng":34.75,"name":"Israel","capital":"Jerusalem"},
    "PSE": {"lat":31.9,"lng":35.2,"name":"Palestine","capital":"Ramallah"},
    "LBN": {"lat":33.9,"lng":35.5,"name":"Lebanon","capital":"Beirut"},
    "SYR": {"lat":33.5,"lng":36.3,"name":"Syria","capital":"Damascus"},
    "IRN": {"lat":35.7,"lng":51.4,"name":"Iran","capital":"Tehran"},
    "IRQ": {"lat":33.3,"lng":44.4,"name":"Iraq","capital":"Baghdad"},
    "SAU": {"lat":24.7,"lng":46.7,"name":"Saudi Arabia","capital":"Riyadh"},
    "YEM": {"lat":15.4,"lng":44.2,"name":"Yemen","capital":"Sana'a"},
    "TUR": {"lat":39.9,"lng":32.9,"name":"Turkey","capital":"Ankara"},
    "JOR": {"lat":31.9,"lng":35.9,"name":"Jordan","capital":"Amman"},
    "EGY": {"lat":30.1,"lng":31.2,"name":"Egypt","capital":"Cairo"},
    "ARE": {"lat":24.5,"lng":54.4,"name":"UAE","capital":"Abu Dhabi"},
    "QAT": {"lat":25.3,"lng":51.5,"name":"Qatar","capital":"Doha"},
    "KWT": {"lat":29.4,"lng":47.6,"name":"Kuwait","capital":"Kuwait City"},
    "BHR": {"lat":26.2,"lng":50.6,"name":"Bahrain","capital":"Manama"},
    "OMN": {"lat":23.6,"lng":58.6,"name":"Oman","capital":"Muscat"},
}

# ── HTTP Handler ───────────────────────────────────────────────────────────────

class IntelHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(__file__), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path   = parsed.path

        if path == '/':
            self.send_file('standalone.html', 'text/html')
        elif path.startswith('/api/intel/arcs/all'):
            self.send_json(self.build_arcs())
        elif path.startswith('/api/intel/countries/all'):
            countries = [
                {"iso": iso, **meta, "alertLevel": MOCK_INTEL.get(iso, {}).get("alertLevel", "LOW")}
                for iso, meta in COUNTRY_COORDS.items()
            ]
            self.send_json(countries)
        elif path.startswith('/api/intel/'):
            iso = path.split('/')[-1].upper()
            self.serve_intel(iso)
        else:
            super().do_GET()

    def serve_intel(self, iso):
        if iso not in COUNTRY_COORDS:
            self.send_error(404, f"Country {iso} not found")
            return

        meta   = COUNTRY_COORDS[iso]
        data   = MOCK_INTEL.get(iso, {"alertLevel":"LOW","summary":"Data unavailable","threats":[],"keyActors":[],"recentEvents":[]})
        arcs   = self.build_arcs(iso)
        news   = self.fetch_live_news(meta["name"]) if REQUESTS_AVAILABLE else []

        if not news:
            news = [{"title": e, "source": "Intel Base", "published": "2025-01-01T00:00:00Z"} for e in data.get("recentEvents", [])]

        result = {
            "iso": iso,
            **meta,
            **data,
            "liveNews": news,
            "conflicts": arcs,
            "lastUpdated": "2025-01-01T00:00:00Z"
        }
        self.send_json(result)

    def build_arcs(self, iso=None):
        arcs = []
        for c in CONFLICTS:
            if iso and c["from"] != iso and c["to"] != iso:
                continue
            f = COUNTRY_COORDS.get(c["from"])
            t = COUNTRY_COORDS.get(c["to"])
            if not f or not t:
                continue
            arcs.append({
                **c,
                "startLat": f["lat"], "startLng": f["lng"],
                "endLat":   t["lat"], "endLng":   t["lng"],
                "fromName": f["name"], "toName":   t["name"],
                "color": self.arc_color(c["type"])
            })
        return arcs

    def arc_color(self, type_):
        colors = {
            "war":        ["rgba(239,68,68,0.9)",   "rgba(239,68,68,0.1)"],
            "conflict":   ["rgba(249,115,22,0.9)",  "rgba(249,115,22,0.1)"],
            "proxy_war":  ["rgba(220,38,38,0.9)",   "rgba(220,38,38,0.1)"],
            "proxy":      ["rgba(245,158,11,0.9)",  "rgba(245,158,11,0.1)"],
            "rivalry":    ["rgba(234,179,8,0.9)",   "rgba(234,179,8,0.1)"],
            "influence":  ["rgba(168,85,247,0.9)",  "rgba(168,85,247,0.1)"],
            "support":    ["rgba(251,191,36,0.9)",  "rgba(251,191,36,0.1)"],
            "airstrike":  ["rgba(239,68,68,0.9)",   "rgba(239,68,68,0.1)"],
            "diplomatic": ["rgba(59,130,246,0.9)",  "rgba(59,130,246,0.1)"],
            "border":     ["rgba(107,114,128,0.9)", "rgba(107,114,128,0.1)"],
        }
        return colors.get(type_, colors["conflict"])

    def fetch_live_news(self, country_name):
        # Try RSS feeds via requests
        feeds = [
            f"https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
        ]
        results = []
        for feed_url in feeds:
            try:
                r = requests.get(feed_url, timeout=4,
                                 headers={"User-Agent": "IntelGlobe/1.0"})
                if country_name.lower() in r.text.lower():
                    # Basic XML title extraction
                    import re
                    titles = re.findall(r'<title><!\[CDATA\[(.*?)\]\]></title>', r.text)
                    for t in titles[:3]:
                        if country_name.lower() in t.lower():
                            results.append({"title": t, "source": "BBC Middle East", "published": ""})
            except Exception:
                pass
        return results

    def send_json(self, data):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type',  'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, filename, content_type):
        try:
            with open(os.path.join(os.path.dirname(__file__), filename), 'rb') as f:
                body = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except FileNotFoundError:
            self.send_error(404, f"{filename} not found")

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} — {fmt % args}")


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"\n  Intel Globe Server")
    print(f"  http://localhost:{port}")
    print(f"  Live news: {'enabled (requests available)' if REQUESTS_AVAILABLE else 'disabled — using mock data'}")
    print(f"\n  Press Ctrl+C to stop\n")
    HTTPServer(('', port), IntelHandler).serve_forever()
