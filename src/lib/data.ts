import {
    Users, Eye, Search, Heart, ShieldCheck,
    ArrowRightLeft, FileText, Gavel,
    CheckCircle2, AlertCircle, HelpCircle, Lightbulb
} from "lucide-react";
import type {
    Principle, Tension, Model4DItem, DelegationLevel,
    VoteType, NavLink, DashboardSection, ParticipationSection
} from "./types";

// ─── PRINCIPLES (Valors Rectors) ────────────────────────────────

export const PRINCIPLES: Principle[] = [
    {
        id: "antropocentrisme",
        title: "Antropocentrisme i Humanisme",
        icon: Users,
        intro: "Prioritzem la relació humana, el benestar i la dignitat.",
        full: "Entenem que la tecnologia ha d'estar al servei de l'ésser humà. Garantim que la decisió final en qüestions que afecten les persones (especialment en avaluació) sigui sempre humana. La IA pot proposar, però la persona és la responsable última.",
        points: [
            "Responsabilitat humana (Human-in-the-loop)",
            "Enfortiment de la relació humana",
            "Prevenció de la dependència cognitiva"
        ]
    },
    {
        id: "transparencia",
        title: "Transparència i Integritat",
        icon: Eye,
        intro: "Ús visible i honorable de la tecnologia.",
        full: "Fomentem l'honestedat en l'ús de l'IA. Evolucionem del concepte de 'copiar' al de 'generar pensament propi', avaluant la capacitat de l'alumne d'utilitzar l'eina per a una elaboració original.",
        points: [
            "Identificació i divulgació (declarar ús d'IA)",
            "Explicabilitat de criteris (no caixes negres)",
            "Citació i protocols clars de reconeixement"
        ]
    },
    {
        id: "verificacio",
        title: "Verificació i Crítica",
        icon: Search,
        intro: "Cultura de vigilància activa davant la versemblança.",
        full: "Davant models probabilístics que generen resultats plausibles però no sempre certs, eduquem en el contrast de fonts i la vigilància activa contra biaixos de gènere o culturals.",
        points: [
            "Desenvolupament del pensament crític permanent",
            "Fiabilitat i contrast sistemàtic amb fonts",
            "Mitigació activa de biaixos algorítmics"
        ]
    },
    {
        id: "equitat",
        title: "Equitat i Inclusió",
        icon: Heart,
        intro: "Instrument per reduir bretxes i eliminar barreres.",
        full: "L'IA ha de ser una eina per arribar a tothom. L'utilitzem per atendre múltiples necessitats educatives sota supervisió docent, evitant que les versions de pagament generin avantatges injustos.",
        points: [
            "Accés universal a eines institucionals",
            "Accessibilitat per disseny",
            "Personalització inclusiva de l'aprenentatge"
        ]
    },
    {
        id: "benestar",
        title: "Benestar i Sostenibilitat",
        icon: ShieldCheck,
        intro: "Relació equilibrada amb l'entorn i compromís ambiental.",
        full: "Som conscients de l'impacte energètic i hídric de l'IA. Promovem la desconnexió com a valor i el manteniment d'una frontera clara entre l'activitat digital i la interacció física.",
        points: [
            "Integritat i seguretat de les dades (RGPD)",
            "Salut digital i dret a la desconnexió",
            "Justícia socioambiental i consum responsable"
        ]
    }
];

// ─── TENSIONS ────────────────────────────────────────────────────

export const TENSIONS: Tension[] = [
    {
        id: "t1",
        title: "Integritat Humana",
        desc: "Habitar l'ecosistema digital reconeixent la hibridació sense perdre la centralitat i dignitat de la persona.",
        left: "Humanisme clàssic",
        leftDesc: "Mantenir la tecnologia com una eina externa i controlable per reforçar la nostra essència humana més profunda.",
        right: "Posthumanisme crític",
        rightDesc: "Assumir que la hibridació digital ja forma part de nosaltres i amplificar les nostres capacitats cognitives.",
    },
    {
        id: "t2",
        title: "Autonomia i Agència",
        desc: "Diferenciem entre estalviar temps en la repetició i perdre la responsabilitat i la veu en la presa de decisions.",
        left: "Offloading",
        leftDesc: "Alliberar-nos de tasques repetitives i mecàniques per guanyar temps per a les relacions i l'acompanyament.",
        right: "Outsourcing",
        rightDesc: "Risc d'externalitzar la reflexió crítica i el judici ètic en mans de sistemes algorítmics opacs.",
    },
    {
        id: "t3",
        title: "Profunditat Cognitiva",
        desc: "Defensem el pensament lent i la concentració davant la temptació d'anul·lar l'esforç intel·lectual.",
        left: "Fricció productiva",
        leftDesc: "Protegir el valor de l'esforç, la dificultat desitjable i el temps necessari per a l'aprenentatge significatiu.",
        right: "Eficiència",
        rightDesc: "Aprofitar la immediatesa i l'optimització de resultats que ens ofereix la intel·ligència artificial generativa.",
    },
    {
        id: "t4",
        title: "Vincles i Presència",
        desc: "Recuperem la calidesa i la intencionalitat en la trobada humana davant la sorollosa distracció dels algorismes.",
        left: "Atenció",
        leftDesc: "Davant la fragmentació digital, la dopamina ràpida i la mercantilització del nostre temps a la xarxa.",
        right: "Intenció",
        rightDesc: "Mantenir una presència plena i conscient, amb una intencionalitat clara en cada interacció digital.",
    },
    {
        id: "t5",
        title: "Justícia i Equitat",
        desc: "Vigilar proactivament que la intel·ligència artificial no esdevingui una nova eina d'exclusió estructural.",
        left: "Biaixos",
        leftDesc: "Consciència de l'ús de dades històriques i els prejudicis que els models de llenguatge poden perpetuar.",
        right: "Justícia Algorítmica",
        rightDesc: "Treballar activament per un disseny inclusiu i una auditoria social que garanteixi l'equitat tecnológica.",
    },
    {
        id: "t6",
        title: "Integritat Intel·lectual",
        desc: "Aprendre a distingir un text que 'sembla correcte' d'una veritat argumentada, verificada i amb fonament.",
        left: "Plausibilitat",
        leftDesc: "Saber que l'IA genera resultats basats en versemblança estadística que poden semblar veritables.",
        right: "Realisme",
        rightDesc: "Compromís amb la veritat factual, el contrast de fonts i la integritat de la producció intel·lectual.",
    }
];

// ─── MODEL 4D ────────────────────────────────────────────────────

export const MODEL_4D: Model4DItem[] = [
    {
        id: "D1", name: "Delegació", subtitle: "Saber decidir qui fa què.",
        desc: "Prendre decisions reflexives sobre quin treball és per a un mateix i quin per a l'IA. No deleguem per evitar l'esforç.",
        icon: ArrowRightLeft, details: ["Consciència del problema", "Consciència de la plataforma", "Triatge estratègic"]
    },
    {
        id: "D2", name: "Descripció", subtitle: "Saber demanar amb precisió.",
        desc: "Traduir la intenció humana en instruccions semàntiques (prompts). La qualitat de l'output depèn de la claredat.",
        icon: FileText, details: ["Definició de producte", "Descripció de procés (CoT)", "Rol i performance"]
    },
    {
        id: "D3", name: "Discerniment", subtitle: "Saber jutjar el resultat.",
        desc: "Avaluar de manera crítica i reflexiva tot allò que produeix l'IA. Actua com el sistema de control de qualitat.",
        icon: Gavel, details: ["Verificació factual", "Detecció d'al·lucinacions", "Filtre de veracitat"]
    },
    {
        id: "D4", name: "Diligència", subtitle: "Saber-se responsable final.",
        desc: "Governança ètica i responsabilitat en l'acció. Transforma l'habilitat tècnica en ciutadania compromesa.",
        icon: ShieldCheck, details: ["Seguretat i privadesa", "Transparència i autoria", "Impacte socioambiental"]
    }
];

// ─── DELEGATION LEVELS ───────────────────────────────────────────

export const DELEGATION_LEVELS: DelegationLevel[] = [
    {
        lv: 0, name: "Preservació", sub: "No delegació", human: 100, ia: 0,
        desc: "Es prioritza l'activitat humana directa per preservar habilitats fonamentals o judici ètic.",
        examples: [
            { subject: "Dibuix", activity: "Grafoescritura i coordinació oculomanual bàsica." },
            { subject: "Filosofia", activity: "Reflexió ètica en situacions de crisi humana." },
            { subject: "Educació Física", activity: "Desenvolupament de la consciència corporal i motricitat." },
            { subject: "Interioritat", activity: "Pràctica de l'atenció plena sense dispositius." },
            { subject: "Teatre", activity: "Expressió emocional i llenguatge no verbal en viu." }
        ]
    },
    {
        lv: 1, name: "Exploració", sub: "Font d'idees", human: 90, ia: 10,
        desc: "L'IA actua com a mirall d'idees o font d'informació inicial. L'artefacte final és 100% humà.",
        examples: [
            { subject: "Ciències", activity: "Interrogar l'IA per entendre un concepte abstracte o analogies." },
            { subject: "Llengua", activity: "Pluja d'idees assistida per IA per definir el tema d'un relat." },
            { subject: "Visual i Plàstica", activity: "Recerca de referents artístics i moviments estètics." },
            { subject: "Socials", activity: "Cerca de context històric i mapes conceptuals inicials." },
            { subject: "Tecnologia", activity: "Exploració de possibles solucions a un repte de disseny." }
        ]
    },
    {
        lv: 2, name: "Suport", sub: "Refinament", human: 70, ia: 30,
        desc: "La persona crea el contingut base i l'IA proposa millores, correccions o refinament d'estil.",
        examples: [
            { subject: "Història", activity: "Revisió d'un assaig: suggeriments en l'estructura o el to." },
            { subject: "Anglès", activity: "Autocorrecció de gramàtica i propostes de vocabulari variat." },
            { subject: "Matemàtiques", activity: "Tutor socràtic que ajuda a detectar l'error en un procediment." },
            { subject: "Física", activity: "Millora de la redacció de les conclusions d'un laboratori." },
            { subject: "Llengua", activity: "Detecció de faltes de coferència o repeticions en un text propi." }
        ]
    },
    {
        lv: 3, name: "Cocreació", sub: "Estratègica", human: 50, ia: 50,
        desc: "Treball iteratiu on persona i l'IA alternen el lideratge en el disseny i l'execució.",
        examples: [
            { subject: "Música", activity: "Creació melòdica conjunta: l'IA proposa acords, l'humà la lletra." },
            { subject: "Tecnologia", activity: "Programació assistida: co-escriptura de codi amb realimentació." },
            { subject: "Projectes", activity: "Disseny de guions per a podcast i edició d'àudio híbrida." },
            { subject: "Emprenedoria", activity: "Desenvolupament d'un model de negoci iterant amb l'IA." },
            { subject: "Art", activity: "Instal·lació interactiva on l'IA processa dades en viu." }
        ]
    },
    {
        lv: 4, name: "Delegació", sub: "Supervisada", human: 20, ia: 80,
        desc: "L'IA genera la major part del producte sota instruccions molt precises; l'humà valida.",
        examples: [
            { subject: "Recerca", activity: "Generació de resums de lectura tancats des de fonts pròpies." },
            { subject: "Administració", activity: "Creació de plantilles de pressupost des de dades en brut." },
            { subject: "Disseny", activity: "Producció de visuals complexos des de prompts tècnics." },
            { subject: "Idiomes", activity: "Traducció de textos tècnics amb supervisió del matís." },
            { subject: "Mates", activity: "Optimització de càlculs complexos des de fórmules." }
        ]
    },
    {
        lv: 5, name: "Agència", sub: "Autònoma", human: 5, ia: 95,
        desc: "L'IA opera independentment dins d'un marc supervisat. L'humà actua com a auditor.",
        examples: [
            { subject: "Personalització", activity: "Plataformes adaptatives amb itineraris automàtics." },
            { subject: "Anàlisi", activity: "Monitorització del benestar de grup via sentiment analysis." },
            { subject: "Operacions", activity: "Sistemes de gestió administrativa recurrent (assistència)." },
            { subject: "Recerca", activity: "Anàlisi de grans volums de dades per identificar patrons." },
            { subject: "Educació", activity: "Generació de qüestionaris adaptatius segons el progrés." }
        ]
    }
];

// ─── VOTE TYPES ──────────────────────────────────────────────────

export const VOTE_TYPES: VoteType[] = [
    { id: "agree", label: "D'acord", color: "bg-green-500", icon: CheckCircle2 },
    { id: "worry", label: "M'inquieta", color: "bg-orange-500", icon: AlertCircle },
    { id: "doubt", label: "Tinc dubtes", color: "bg-blue-500", icon: HelpCircle },
    { id: "inspired", label: "M'inspira", color: "bg-purple-500", icon: Lightbulb }
];

export const VOTE_LABELS: Record<string, string> = {
    agree: "D'acord",
    worry: "Inquietud",
    doubt: "Dubtes",
    inspired: "Inspiració"
};

export const VOTE_COLORS: Record<string, string> = {
    agree: "bg-green-500",
    worry: "bg-orange-500",
    doubt: "bg-blue-500",
    inspired: "bg-purple-500"
};

// ─── NAVIGATION ──────────────────────────────────────────────────

export const NAV_LINKS: NavLink[] = [
    { name: "Inici", id: "hero-top" },
    { name: "Raons de fons", id: "details-intro" },
    { name: "Valors i Principis", id: "principles-section" },
    { name: "Tensions Dialèctiques", id: "tensions-section" },
    { name: "Model 4D", id: "model-4d-section" },
    { name: "Nivells", id: "delegation-section" },
    { name: "Visió Compartida", id: "results-dashboard" }
];

// ─── DASHBOARD SECTIONS ──────────────────────────────────────────

export const DASHBOARD_SECTIONS: DashboardSection[] = [
    { id: "objectius", name: "Objectius", items: ["institucional", "docent", "alumnat"] },
    { id: "valors", name: "Valors", items: ["antropocentrisme", "transparencia", "verificacio", "equitat", "benestar"] },
    { id: "tensions", name: "Tensions", items: ["humanisme", "agencia", "cognicio", "presencia", "justicia", "plausibilitat"] },
    { id: "model4d", name: "Model 4D", items: ["D1", "D2", "D3", "D4"] },
    { id: "delegacio", name: "Nivells", items: ["nivell0", "nivell1", "nivell2", "nivell3", "nivell4", "nivell5"] }
];

// ─── PARTICIPATION CONTENT ───────────────────────────────────────

export const PARTICIPATION_CONTENT: ParticipationSection[] = [
    {
        id: "objectius",
        name: "Objectius Estratègics",
        items: [
            { id: "institucional", name: "Eficàcia Institucional" },
            { id: "docent", name: "Docència de Qualitat" },
            { id: "alumnat", name: "Responsabilitat de l'Alumnat" }
        ]
    },
    {
        id: "valors",
        name: "Valors i Principis",
        items: [
            { id: "antropocentrisme", name: "Antropocentrisme" },
            { id: "transparencia", name: "Transparència" },
            { id: "verificacio", name: "Verificació i Crítica" },
            { id: "equitat", name: "Equitat i Inclusió" },
            { id: "benestar", name: "Benestar" }
        ]
    },
    {
        id: "tensions",
        name: "Tensions Dialèctiques",
        items: [
            { id: "humanisme", name: "Integritat Humana" },
            { id: "agencia", name: "Autonomia i Agència" },
            { id: "cognicio", name: "Profunditat Cognitiva" },
            { id: "presencia", name: "Vincles i Presència" },
            { id: "justicia", name: "Justícia i Equitat" },
            { id: "plausibilitat", name: "Integritat Intel·lectual" }
        ]
    },
    {
        id: "model4d",
        name: "Model 4D: Fluidesa en IA",
        items: [
            { id: "D1", name: "D1: Delegació" },
            { id: "D2", name: "D2: Descripció" },
            { id: "D3", name: "D3: Discerniment" },
            { id: "D4", name: "D4: Diligència" }
        ]
    },
    {
        id: "delegacio",
        name: "Graus de Delegació",
        items: [
            { id: "nivell0", name: "L0: Preservació" },
            { id: "nivell1", name: "L1: Exploració" },
            { id: "nivell2", name: "L2: Suport" },
            { id: "nivell3", name: "L3: Cocreació" },
            { id: "nivell4", name: "L4: Delegació" },
            { id: "nivell5", name: "L5: Agència" }
        ]
    }
];

// ─── UTILITY ─────────────────────────────────────────────────────

export function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
