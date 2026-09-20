export const LOCALES = ["sk", "cs", "en"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "sk"
export const LOCALE_COOKIE = "sweep-locale"
export const THEME_KEY = "sweep-theme"

export type Messages = {
  theme: { light: string; dark: string; toLight: string; toDark: string }
  lang: { label: string; sk: string; cs: string; en: string }
  header: { lab: string; newScan: string }
  footer: { tag: string }
  home: {
    kicker: string
    title: string
    titleEm: string
    lead: string
  }
  form: {
    kicker: string
    urlLabel: string
    placeholder: string
    demo: string
    demoPoor: string
    analyze: string
    measuring: string
    hint: string
    errorTitle: string
    failAnalyze: string
    failDemo: string
    modeUrl: string
    modeSitemap: string
    sitemapHint: string
    budgetKicker: string
    minScore: string
    maxLcp: string
    maxCls: string
    maxTbt: string
    crawlLimit: string
    budgetToggle: string
    budgetHide: string
  }
  progress: {
    labRunning: string
    preparing: string
    done: string
    elapsed: string
    hostFallback: string
    etaEarly: string
    etaMid: string
    etaLate: string
    etaLong: string
    labels: {
      verify: string
      mobile: string
      desktop: string
      report: string
      wait: string
      polish: string
      field: string
      crawl: string
    }
    crawlOf: string
    steps: { title: string; detail: string }[]
    tips: { kicker: string; body: string }[]
  }
  report: {
    dossier: string
    newScan: string
    mobile: string
    desktop: string
    link: string
    copied: string
    transfer: string
    requests: string
    labBadge: string
    fieldBadge: string
    engineLh: string
    enginePsi: string
    engineDemo: string
    fieldTitle: string
    fieldSub: string
    fieldEmpty: string
    fieldEmptyLab: string
    filmstripTitle: string
    filmstripSub: string
    screenshotTitle: string
    fixPlanTitle: string
    fixPlanSub: string
    improveTitle: string
    improveSub: string
    improveEmpty: string
    goodTitle: string
    goodSub: string
    goodEmpty: string
    waterfallTitle: string
    waterfallSub: string
    abTitle: string
    abSub: string
    abPrevious: string
    abCurrent: string
    abDelta: string
    compareTitle: string
    compareSub: string
    metric: string
    score: string
    size: string
    categoriesTitle: string
    categoriesSub: string
    budgetPass: string
    budgetFail: string
    annotationDone: string
    annotationUndo: string
    impactHigh: string
    impactMedium: string
    impactLow: string
  }
  crawl: {
    kicker: string
    title: string
    metaBudget: string
    colUrl: string
    colMobile: string
    colDesktop: string
    colBudget: string
    report: string
    newScan: string
    share: string
    copied: string
    csv: string
    pass: string
    fail: string
    err: string
    notFound: string
  }
  skeleton: {
    improve: string
    good: string
    waterfall: string
    waterfallHint: string
  }
}

export const dictionaries: Record<Locale, Messages> = {
  sk: {
    theme: { light: "Svetlo", dark: "Tma", toLight: "Svetlý režim", toDark: "Tmavý režim" },
    lang: { label: "Jazyk", sk: "SK", cs: "CZ", en: "EN" },
    header: { lab: "Laboratórium / Lighthouse", newScan: "Nové meranie" },
    footer: { tag: "Sweep / laboratórny odpočet" },
    home: {
      kicker: "Web performance lab",
      title: "Rýchlosť webu,",
      titleEm: "nameraná presne.",
      lead: "Core Web Vitals, waterfall a opravy s odhadovaným dopadom. Samostatný odpočet pre mobil a desktop.",
    },
    form: {
      kicker: "Začni meranie",
      urlLabel: "URL na analýzu",
      placeholder: "https://vasa-stranka.sk",
      demo: "Ukážka",
      demoPoor: "Slabý web",
      analyze: "Analyzovať",
      measuring: "Meriam",
      hint: "Lokálne Lighthouse · PSI API ako záloha",
      errorTitle: "Chyba merania",
      failAnalyze: "Analýza zlyhala.",
      failDemo: "Ukážku sa nepodarilo načítať.",
      modeUrl: "Jedna URL",
      modeSitemap: "Sitemap",
      sitemapHint: "Zadaj sitemap.xml alebo root webu — zmeriam až N stránok.",
      budgetKicker: "Budget prahy",
      minScore: "Min. skóre",
      maxLcp: "Max. LCP (ms)",
      maxCls: "Max. CLS",
      maxTbt: "Max. TBT (ms)",
      crawlLimit: "Počet URL",
      budgetToggle: "Nastaviť budget",
      budgetHide: "Skryť budget",
    },
    progress: {
      labRunning: "Laboratórium beží",
      preparing: "Pripravujem meranie",
      done: "Hotovo",
      elapsed: "Uplynulo",
      hostFallback: "cieľová stránka",
      etaEarly: "Typicky 15–40 s",
      etaMid: "Druhý prechod laboratória…",
      etaLate: "Už skoro hotovo",
      etaLong: "Ešte chvíľu — laboratórium beží",
      labels: {
        verify: "Overujem URL",
        mobile: "Lighthouse · mobil",
        desktop: "Lighthouse · desktop",
        report: "Skladám report",
        wait: "Ešte chvíľu…",
        polish: "Dolaďujem metriky",
        field: "Dopĺňam CrUX pole",
        crawl: "Meriam URL v sitemape",
      },
      crawlOf: "URL {current}/{total}",
      steps: [
        { title: "Overenie URL", detail: "Kontrolujem dostupnosť a protokol" },
        { title: "Mobilné laboratórium", detail: "Lighthouse · throttled 4G" },
        { title: "Desktopové laboratórium", detail: "Lighthouse · široký viewport" },
        { title: "Skladanie reportu", detail: "Skóre, waterfall a odporúčania" },
      ],
      tips: [
        {
          kicker: "Tip · LCP",
          body: "Largest Contentful Paint meria, kedy sa načíta hlavný vizuálny obsah. Cieľ je pod 2,5 s.",
        },
        {
          kicker: "Tip · INP",
          body: "Interaction to Next Paint sleduje odozvu na kliky a ťuknutia. Pod 200 ms pôsobí stránka živo.",
        },
        {
          kicker: "Tip · CLS",
          body: "Cumulative Layout Shift hodnotí posuny layoutu. Stabilný layout = menej frustrácie pri čítaní.",
        },
        {
          kicker: "Tip · Waterfall",
          body: "V reporte uvidíš, ktoré requesty blokujú render — často fonty, JS a veľké obrázky.",
        },
        {
          kicker: "Prečo to trvá",
          body: "Každý prechod spúšťa skutočné laboratórium v Chrome. Dva stratégické behy (mobil + desktop) berú 15–40 s.",
        },
      ],
    },
    report: {
      dossier: "03 — dossier",
      newScan: "Nové meranie",
      mobile: "Mobil",
      desktop: "Desktop",
      link: "Odkaz",
      copied: "Skopírované",
      transfer: "Prenos",
      requests: "requestov",
      labBadge: "Laboratórium",
      fieldBadge: "CrUX · pole",
      engineLh: "Lokálne Lighthouse",
      enginePsi: "PageSpeed Insights API",
      engineDemo: "Ukážkový report",
      fieldTitle: "Reálni používatelia",
      fieldSub: "Chrome UX Report (CrUX), posledných ~28 dní — nie laboratórium.",
      fieldEmpty: "Pre túto URL CrUX zatiaľ nemá dosť dát. Nižšie sú len laboratórne metriky.",
      fieldEmptyLab: "Lokálne Lighthouse neobsahuje CrUX (reálnych používateľov). Ak je nastavený PAGESPEED_API_KEY, Sweep skúsi doplniť pole; inak ostávajú len lab metriky.",
      filmstripTitle: "Filmstrip",
      filmstripSub: "Snímky priebehu načítania v laboratóriu.",
      screenshotTitle: "Finálny screenshot",
      fixPlanTitle: "Fix plan",
      fixPlanSub: "Tri kroky s najväčším odhadovaným dopadom.",
      improveTitle: "Čo zlepšiť",
      improveSub: "Všetky prioritné opravy podľa odhadovaného dopadu.",
      improveEmpty: "Žiadne výrazné problémy — výborne.",
      goodTitle: "Čo je dobré",
      goodSub: "Metriky a audity, ktoré už spĺňajú cieľ.",
      goodEmpty: "Zatiaľ žiadne silné stránky na vyzdvihnutie.",
      waterfallTitle: "Waterfall",
      waterfallSub: "Časová os sieťových požiadaviek.",
      abTitle: "Oproti predchádzajúcemu meraniu",
      abSub: "Diff skóre a metrík po opätovnom meraní rovnakej URL.",
      abPrevious: "Predtým",
      abCurrent: "Teraz",
      abDelta: "Zmena",
      compareTitle: "Mobil vs desktop",
      compareSub: "Rovnaká URL, dve laboratórne stratégie.",
      metric: "Metrika",
      score: "Skóre",
      size: "Veľkosť",
            categoriesTitle: "Lighthouse kategórie",
      categoriesSub: "Performance, Accessibility, Best Practices a SEO.",
      budgetPass: "Budget PASS",
      budgetFail: "Budget FAIL",
      annotationDone: "Označiť ako opravené",
      annotationUndo: "Zrušiť označenie",
impactHigh: "vysoký",
      impactMedium: "stredný",
      impactLow: "nízky",
    },
    crawl: {
      kicker: "Sitemap crawl",
      title: "{count} URL zmeraných",
      metaBudget:
        "budget skóre ≥ {minScore}, LCP ≤ {maxLcp} ms, CLS ≤ {maxCls}, TBT ≤ {maxTbt}",
      colUrl: "URL",
      colMobile: "Mobil",
      colDesktop: "Desktop",
      colBudget: "Budget",
      report: "Report",
      newScan: "Nové meranie",
      share: "Odkaz",
      copied: "Skopírované",
      csv: "CSV",
      pass: "PASS",
      fail: "FAIL",
      err: "ERR",
      notFound: "Crawl sa nenašiel",
    },
    skeleton: {
      improve: "06 — čo zlepšiť",
      good: "07 — čo je dobré",
      waterfall: "05 — waterfall",
      waterfallHint: "Skladám sieťové požiadavky…",
    },
  },
  cs: {
    theme: { light: "Světlý", dark: "Tmavý", toLight: "Světlý režim", toDark: "Tmavý režim" },
    lang: { label: "Jazyk", sk: "SK", cs: "CZ", en: "EN" },
    header: { lab: "Laboratoř / Lighthouse", newScan: "Nové měření" },
    footer: { tag: "Sweep / laboratorní výsledek" },
    home: {
      kicker: "Web performance lab",
      title: "Rychlost webu,",
      titleEm: "naměřená přesně.",
      lead: "Core Web Vitals, waterfall a opravy s odhadovaným dopadem. Samostatný výsledek pro mobil i desktop.",
    },
    form: {
      kicker: "Začni měření",
      urlLabel: "URL k analýze",
      placeholder: "https://vase-stranka.cz",
      demo: "Ukázka",
      demoPoor: "Slabý web",
      analyze: "Analyzovat",
      measuring: "Měřím",
      hint: "Lokální Lighthouse · PSI API jako záloha",
      errorTitle: "Chyba měření",
      failAnalyze: "Analýza selhala.",
      failDemo: "Ukázku se nepodařilo načíst.",
      modeUrl: "Jedna URL",
      modeSitemap: "Sitemap",
      sitemapHint: "Zadej sitemap.xml nebo root webu — změřím až N stránek.",
      budgetKicker: "Budget prahy",
      minScore: "Min. skóre",
      maxLcp: "Max. LCP (ms)",
      maxCls: "Max. CLS",
      maxTbt: "Max. TBT (ms)",
      crawlLimit: "Počet URL",
      budgetToggle: "Nastavit budget",
      budgetHide: "Skrýt budget",
    },
    progress: {
      labRunning: "Laboratoř běží",
      preparing: "Připravuji měření",
      done: "Hotovo",
      elapsed: "Uplynulo",
      hostFallback: "cílová stránka",
      etaEarly: "Typicky 15–40 s",
      etaMid: "Druhý průchod laboratoře…",
      etaLate: "Už skoro hotovo",
      etaLong: "Ještě chvíli — laboratoř běží",
      labels: {
        verify: "Ověřuji URL",
        mobile: "Lighthouse · mobil",
        desktop: "Lighthouse · desktop",
        report: "Skládám report",
        wait: "Ještě chvíli…",
        polish: "Doladění metrik",
        field: "Doplňuji CrUX pole",
        crawl: "Měřím URL v sitemapě",
      },
      crawlOf: "URL {current}/{total}",
      steps: [
        { title: "Ověření URL", detail: "Kontroluji dostupnost a protokol" },
        { title: "Mobilní laboratoř", detail: "Lighthouse · throttled 4G" },
        { title: "Desktopová laboratoř", detail: "Lighthouse · široký viewport" },
        { title: "Sestavení reportu", detail: "Skóre, waterfall a doporučení" },
      ],
      tips: [
        {
          kicker: "Tip · LCP",
          body: "Largest Contentful Paint měří, kdy se načte hlavní vizuální obsah. Cíl je pod 2,5 s.",
        },
        {
          kicker: "Tip · INP",
          body: "Interaction to Next Paint sleduje odezvu na kliky a klepnutí. Pod 200 ms působí stránka živě.",
        },
        {
          kicker: "Tip · CLS",
          body: "Cumulative Layout Shift hodnotí posuny layoutu. Stabilní layout = méně frustrace při čtení.",
        },
        {
          kicker: "Tip · Waterfall",
          body: "V reportu uvidíš, které requesty blokují render — často fonty, JS a velké obrázky.",
        },
        {
          kicker: "Proč to trvá",
          body: "Každý průchod spouští skutečnou laboratoř v Chrome. Dva strategické běhy (mobil + desktop) berou 15–40 s.",
        },
      ],
    },
    report: {
      dossier: "03 — dossier",
      newScan: "Nové měření",
      mobile: "Mobil",
      desktop: "Desktop",
      link: "Odkaz",
      copied: "Zkopírováno",
      transfer: "Přenos",
      requests: "requestů",
      labBadge: "Laboratoř",
      fieldBadge: "CrUX · pole",
      engineLh: "Lokální Lighthouse",
      enginePsi: "PageSpeed Insights API",
      engineDemo: "Ukázkový report",
      fieldTitle: "Reální uživatelé",
      fieldSub: "Chrome UX Report (CrUX), posledních ~28 dní — ne laboratoř.",
      fieldEmpty: "Pro tuto URL CrUX zatím nemá dost dat. Níže jsou jen laboratorní metriky.",
      fieldEmptyLab: "Lokální Lighthouse neobsahuje CrUX (reálné uživatele). Pokud je nastaven PAGESPEED_API_KEY, Sweep zkusí pole doplnit; jinak zůstávají jen lab metriky.",
      filmstripTitle: "Filmstrip",
      filmstripSub: "Snímky průběhu načítání v laboratoři.",
      screenshotTitle: "Finální screenshot",
      fixPlanTitle: "Fix plan",
      fixPlanSub: "Tři kroky s největším odhadovaným dopadem.",
      improveTitle: "Co zlepšit",
      improveSub: "Všechny prioritní opravy podle odhadovaného dopadu.",
      improveEmpty: "Žádné výrazné problémy — výborně.",
      goodTitle: "Co je dobré",
      goodSub: "Metriky a audity, které už plní cíl.",
      goodEmpty: "Zatím žádné silné stránky k vyzdvižení.",
      waterfallTitle: "Waterfall",
      waterfallSub: "Časová osa síťových požadavků.",
      abTitle: "Oproti předchozímu měření",
      abSub: "Diff skóre a metrik po opětovném měření stejné URL.",
      abPrevious: "Předtím",
      abCurrent: "Teď",
      abDelta: "Změna",
      compareTitle: "Mobil vs desktop",
      compareSub: "Stejná URL, dvě laboratorní strategie.",
      metric: "Metrika",
      score: "Skóre",
      size: "Velikost",
            categoriesTitle: "Lighthouse kategorie",
      categoriesSub: "Performance, Accessibility, Best Practices a SEO.",
      budgetPass: "Budget PASS",
      budgetFail: "Budget FAIL",
      annotationDone: "Označit jako opravené",
      annotationUndo: "Zrušit označení",
impactHigh: "vysoký",
      impactMedium: "střední",
      impactLow: "nízký",
    },
    crawl: {
      kicker: "Sitemap crawl",
      title: "{count} URL změřeno",
      metaBudget:
        "budget skóre ≥ {minScore}, LCP ≤ {maxLcp} ms, CLS ≤ {maxCls}, TBT ≤ {maxTbt}",
      colUrl: "URL",
      colMobile: "Mobil",
      colDesktop: "Desktop",
      colBudget: "Budget",
      report: "Report",
      newScan: "Nové měření",
      share: "Odkaz",
      copied: "Zkopírováno",
      csv: "CSV",
      pass: "PASS",
      fail: "FAIL",
      err: "ERR",
      notFound: "Crawl se nenašel",
    },
    skeleton: {
      improve: "06 — co zlepšit",
      good: "07 — co je dobré",
      waterfall: "05 — waterfall",
      waterfallHint: "Skládám síťové požadavky…",
    },
  },
  en: {
    theme: { light: "Light", dark: "Dark", toLight: "Light mode", toDark: "Dark mode" },
    lang: { label: "Language", sk: "SK", cs: "CZ", en: "EN" },
    header: { lab: "Laboratory / Lighthouse", newScan: "New scan" },
    footer: { tag: "Sweep / lab readout" },
    home: {
      kicker: "Web performance lab",
      title: "Web speed,",
      titleEm: "measured precisely.",
      lead: "Core Web Vitals, waterfall, and fixes with estimated impact. Separate lab runs for mobile and desktop.",
    },
    form: {
      kicker: "Start a run",
      urlLabel: "URL to analyze",
      placeholder: "https://your-site.com",
      demo: "Demo",
      demoPoor: "Slow site",
      analyze: "Analyze",
      measuring: "Measuring",
      hint: "Local Lighthouse · PSI API as fallback",
      errorTitle: "Measurement error",
      failAnalyze: "Analysis failed.",
      failDemo: "Could not load the demo.",
      modeUrl: "Single URL",
      modeSitemap: "Sitemap",
      sitemapHint: "Enter sitemap.xml or site root — I'll measure up to N pages.",
      budgetKicker: "Budget thresholds",
      minScore: "Min. score",
      maxLcp: "Max LCP (ms)",
      maxCls: "Max CLS",
      maxTbt: "Max TBT (ms)",
      crawlLimit: "URL count",
      budgetToggle: "Set budget",
      budgetHide: "Hide budget",
    },
    progress: {
      labRunning: "Lab running",
      preparing: "Preparing measurement",
      done: "Done",
      elapsed: "Elapsed",
      hostFallback: "target site",
      etaEarly: "Typically 15–40 s",
      etaMid: "Second lab pass…",
      etaLate: "Almost done",
      etaLong: "Still running — hang tight",
      labels: {
        verify: "Checking URL",
        mobile: "Lighthouse · mobile",
        desktop: "Lighthouse · desktop",
        report: "Building report",
        wait: "One moment…",
        polish: "Polishing metrics",
        field: "Fetching CrUX field data",
        crawl: "Measuring sitemap URL",
      },
      crawlOf: "URL {current}/{total}",
      steps: [
        { title: "URL check", detail: "Validating availability and protocol" },
        { title: "Mobile lab", detail: "Lighthouse · throttled 4G" },
        { title: "Desktop lab", detail: "Lighthouse · wide viewport" },
        { title: "Assembling report", detail: "Score, waterfall, and recommendations" },
      ],
      tips: [
        {
          kicker: "Tip · LCP",
          body: "Largest Contentful Paint measures when the main visual content loads. Aim for under 2.5 s.",
        },
        {
          kicker: "Tip · INP",
          body: "Interaction to Next Paint tracks click and tap responsiveness. Under 200 ms feels snappy.",
        },
        {
          kicker: "Tip · CLS",
          body: "Cumulative Layout Shift scores layout jumps. A stable layout means less frustration while reading.",
        },
        {
          kicker: "Tip · Waterfall",
          body: "The report shows which requests block render — often fonts, JS, and large images.",
        },
        {
          kicker: "Why it takes time",
          body: "Each pass runs a real Chrome lab. Two strategy runs (mobile + desktop) take about 15–40 s.",
        },
      ],
    },
    report: {
      dossier: "03 — dossier",
      newScan: "New scan",
      mobile: "Mobile",
      desktop: "Desktop",
      link: "Link",
      copied: "Copied",
      transfer: "Transfer",
      requests: "requests",
      labBadge: "Lab",
      fieldBadge: "CrUX · field",
      engineLh: "Local Lighthouse",
      enginePsi: "PageSpeed Insights API",
      engineDemo: "Demo report",
      fieldTitle: "Real users",
      fieldSub: "Chrome UX Report (CrUX), last ~28 days — not the lab run.",
      fieldEmpty: "CrUX does not have enough data for this URL yet. Below are lab metrics only.",
      fieldEmptyLab: "Local Lighthouse does not include CrUX (real-user) data. With PAGESPEED_API_KEY set, Sweep tries to enrich field metrics; otherwise only lab metrics are shown.",
      filmstripTitle: "Filmstrip",
      filmstripSub: "Lab load-progress thumbnails.",
      screenshotTitle: "Final screenshot",
      fixPlanTitle: "Fix plan",
      fixPlanSub: "Three steps with the largest estimated impact.",
      improveTitle: "What to improve",
      improveSub: "All priority fixes by estimated impact.",
      improveEmpty: "No major issues — excellent.",
      goodTitle: "What's working",
      goodSub: "Metrics and audits already hitting the target.",
      goodEmpty: "No strengths to highlight yet.",
      waterfallTitle: "Waterfall",
      waterfallSub: "Network request timeline.",
      abTitle: "Versus previous measurement",
      abSub: "Score and metric diff after remeasuring the same URL.",
      abPrevious: "Before",
      abCurrent: "Now",
      abDelta: "Change",
      compareTitle: "Mobile vs desktop",
      compareSub: "Same URL, two lab strategies.",
      metric: "Metric",
      score: "Score",
      size: "Size",
            categoriesTitle: "Lighthouse categories",
      categoriesSub: "Performance, Accessibility, Best Practices, and SEO.",
      budgetPass: "Budget PASS",
      budgetFail: "Budget FAIL",
      annotationDone: "Mark as fixed",
      annotationUndo: "Undo mark",
impactHigh: "high",
      impactMedium: "medium",
      impactLow: "low",
    },
    crawl: {
      kicker: "Sitemap crawl",
      title: "{count} URLs measured",
      metaBudget:
        "budget score ≥ {minScore}, LCP ≤ {maxLcp} ms, CLS ≤ {maxCls}, TBT ≤ {maxTbt}",
      colUrl: "URL",
      colMobile: "Mobile",
      colDesktop: "Desktop",
      colBudget: "Budget",
      report: "Report",
      newScan: "New scan",
      share: "Link",
      copied: "Copied",
      csv: "CSV",
      pass: "PASS",
      fail: "FAIL",
      err: "ERR",
      notFound: "Crawl not found",
    },
    skeleton: {
      improve: "06 — what to improve",
      good: "07 — what's working",
      waterfall: "05 — waterfall",
      waterfallHint: "Assembling network requests…",
    },
  },
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value)
}
