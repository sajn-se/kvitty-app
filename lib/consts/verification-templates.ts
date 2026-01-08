import type { VerificationTemplate } from "@/lib/types/templates";

export const TEMPLATE_CATEGORIES = [
  "Andelar i andra bolag",
  "Bil och Transport",
  "Bredband och Telefoni",
  "Finans och Försäkring",
  "Frakt",
  "Försäljning tjänster",
  "Försäljning varor",
  "Inköp tjänster",
  "Inom EU",
  "Kontor och Fastighet",
  "Möten, Konferens & Nöjen",
  "Personal",
  "Reklam och PR",
  "Reparationer och Underhåll",
  "Resa och Boende",
  "Returer",
  "Räntor och Påminnelseavgifter",
  "Skatter och avgifter",
  "Tillgångar",
  "Utanför EU",
  "Utlägg",
  "Varor och material",
  "Övriga intäkter",
  "Övriga mallar",
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

export const VERIFICATION_TEMPLATES: VerificationTemplate[] = [
  {
    "id": "ac3f7ku9861edo3uzwtzogoj",
    "name": "Banktjänster",
    "description": "Betalning av banktjänster. Dessa tjänster är momsfria.",
    "direction": "InShowAll",
    "categories": [
      "Finans och Försäkring",
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6570,
        "accountName": "Bankkostnader",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "fppsc4kbxiryha68kum2fxyr",
    "name": "Biljetter inrikes",
    "description": "Kostnader för biljetter till tåg, flyg och buss. Biljetter som gäller inrikes resor.",
    "direction": "In",
    "categories": [
      "Resa och Boende"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 56.6,
        "credit": 0
      },
      {
        "account": 5810,
        "accountName": "Biljetter",
        "debit": 943.4,
        "credit": 0
      }
    ]
  },
  {
    "id": "go0xaqpr7vx56xxkt2upav6z",
    "name": "Biljetter utrikes",
    "description": "Kostnader för biljetter till tåg, flyg och buss. Biljetter som gäller utrikes resor och är momsfria",
    "direction": "In",
    "categories": [
      "Inom EU",
      "Utanför EU",
      "Resa och Boende"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 5810,
        "accountName": "Biljetter",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "vb02n2phzzq4y4mlzia8j9n4",
    "name": "Billeasing",
    "description": "Här bokför du löpande kostnader för leasing av bil där 50% av momsen är avdragsgill. Detta kallas även för operationell leasing.",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "glr5sdwkxcgan80rdoyctjgh",
    "name": "Biltvätt",
    "description": "Kostnader relaterade till bilar ägda av ditt företag där all moms är avdragsgill",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5610,
        "accountName": "Personbilskostnader",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "d6nvk60i9v2jzgsljiunxm8a",
    "name": "Böcker och E-publikationer",
    "description": "Här bokför du utgifter för böcker och facklitteratur. OBS Gäller e-böcker såsom digital tidningar och böcker",
    "direction": "In",
    "categories": [
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 56.6,
        "credit": 0
      },
      {
        "account": 6970,
        "accountName": "Tidningar, tidskrifter och facklitteratur",
        "debit": 943.4,
        "credit": 0
      }
    ]
  },
  {
    "id": "g4ckm3cp67wm7pa2vxsvvzd4",
    "name": "Bredband",
    "description": "Här bokför du utgifter för bredband",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet",
      "Bredband och Telefoni"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6230,
        "accountName": "Datakommunikation",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "ycu01svxsz98u3i4icmpeoxc",
    "name": "Direktpension",
    "description": "Här bokför du direktpension som sätts av i en kapitalförsäkring och inte är avdragsgill",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1385,
        "accountName": "Värde av kapitalförsäkring",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2230,
        "accountName": "Övriga avsättningar för pensioner och liknande förpliktelser",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 7421,
        "accountName": "Direktpension, ej avdragsgill",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "ag0a76k9jghebd02v703fzfj",
    "name": "Elkostnader",
    "description": "Här bokför du kostnader för el",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5020,
        "accountName": "El för belysning",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "hcex159hxqpxg020n7y305wt",
    "name": "Fondplaceringar",
    "description": "Här bokför du inköp av fondandelar för placering av likviditet",
    "direction": "In",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1880,
        "accountName": "Andra kortfristiga placeringar",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "e5tsrwco5ph4os9ja1ukkhlp",
    "name": "Företagsförsäkring avdragsgill",
    "description": "Kostnader för att försäkra företaget",
    "direction": "In",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6310,
        "accountName": "Företagsförsäkringar",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "wl1ztaltsh9kbba3b8txj21a",
    "name": "Företagslägenheter",
    "description": "Förmån av fri permanentbostad till den anställde där bolaget har avtal gentemot fastighetsägaren.",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 7389,
        "accountName": "Övriga kostnader för förmåner",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "fhneymyx4ezw5r7itp62gcfv",
    "name": "Försäkring ej avdragsgill",
    "description": "Här bokför du försäkringar som inte är avdragsgilla. Exempelvis privata sjukförsäkringar",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 7623,
        "accountName": "Sjukvårdsförsäkring, ej avdragsgill",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "e99fv1aa7i2d1noogabkr4nf",
    "name": "Försäljningstjänster",
    "description": "Vid inköp av tjänster som är kopplat till bolagets försäljning",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6090,
        "accountName": "Övriga försäljningskostnader",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "xwlwv0s2p5fe2w56091d5zb8",
    "name": "Hyra momsfri",
    "description": "Betalning av hyra när du inte betalar moms till hyresvärden",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 5010,
        "accountName": "Lokalhyra",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "us0tk6y6b2rd6xk8me9yzvma",
    "name": "Hyra momspliktig",
    "description": "Betala hyra för kontorslokaler om moms betalas",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5011,
        "accountName": "Hyra för kontorslokaler",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "b2homsehdmju2ab67l8ayflw",
    "name": "Idrottsevenemang",
    "description": "Här bokför du idrottsevenemang. Moms 6%",
    "direction": "In",
    "categories": [
      "Möten, Konferens & Nöjen"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 56.6,
        "credit": 0
      },
      {
        "account": 6991,
        "accountName": "Övriga externa kostnader, avdragsgilla",
        "debit": 943.4,
        "credit": 0
      }
    ]
  },
  {
    "id": "w1z03p4xndn5bvnsgsxsi4gr",
    "name": "Inhyrd personal",
    "description": "Konsulter som bolaget hyrt in av ett externt företag som arbetar på ens företag.",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6890,
        "accountName": "Övrig inhyrd personal",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "sv41w3ez0riibhfeueai5mh4",
    "name": "IT-produkter Inrikes",
    "description": "Inköp av IT-produkter så som domännamn webbhotell server mm.",
    "direction": "In",
    "categories": [
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6230,
        "accountName": "Datakommunikation",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "b18z4ifq7ifuf6l7owro003o",
    "name": "IT-tjänster",
    "description": "IT-tjänster. Välj inrikes eller inom/utanför EU i mallen.",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6540,
        "accountName": "IT-tjänster",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "yrszrd75gqnhnpwegc869k5f",
    "name": "Juridik",
    "description": "Här bokför du kostnader för advokater, rättegångskostnader och andra juridiska tjänster",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6580,
        "accountName": "Advokat- och rättegångskostnader",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "rotbvw9nk9zsagp5kdu9refm",
    "name": "Konferens",
    "description": "Utgifter för konferens för företaget dess anställda",
    "direction": "In",
    "categories": [
      "Möten, Konferens & Nöjen"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6991,
        "accountName": "Övriga externa kostnader, avdragsgilla",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "jb8rgr64pb9qkbu3mbaqbkt2",
    "name": "Konsultarvoden",
    "description": "Här bokför du kostnader för konsultarvoden",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6550,
        "accountName": "Konsultarvoden",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "iz88bt4mpxxiymw2xum4j854",
    "name": "Konsultarvoden momsfri",
    "description": "Här bokför du tjänster du köpt som är momsfria ex musiker",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6550,
        "accountName": "Konsultarvoden",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "agxwctryw2fyl2v5dg5wj49j",
    "name": "Kontorsmaterial",
    "description": "Här bokför du kostnader för pennor, papper och annat kontorsmaterial",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet",
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6110,
        "accountName": "Kontorsmateriel",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "q54fto5j08hody6qy9grylib",
    "name": "Kost och logi i utlandet",
    "description": "OBS! Här bokför du kostnader för kost och logi när du varit på tjänsteresa i utlandet.",
    "direction": "In",
    "categories": [
      "Inom EU",
      "Utanför EU",
      "Resa och Boende"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 5832,
        "accountName": "Kost och logi i utlandet",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "d6oxwkieo76qq2ih65bh0280",
    "name": "Kost och logi Sverige",
    "description": "Kostnader för hotell mm i Sverige. (Om företaget betalar för mat så ska det vanligtvis också förmånsbeskattas, läs gärna på om reglerna för matinköp innan du bokför, för att se om det istället ska bokföras som till exempel representation eller traktamente.)",
    "direction": "In",
    "categories": [
      "Möten, Konferens & Nöjen",
      "Resa och Boende"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 107.14,
        "credit": 0
      },
      {
        "account": 5831,
        "accountName": "Kost och logi i Sverige",
        "debit": 892.86,
        "credit": 0
      }
    ]
  },
  {
    "id": "d1rqrgiv07cb9hzvu9dldl7m",
    "name": "Kostnader från Zaver",
    "description": "Räkning av betallänkskostnader från Zaver",
    "direction": "In",
    "categories": [
      "Finans och Försäkring",
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6570,
        "accountName": "Bankkostnader",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "g66nizjejgjkbqxwb1pjo9oe",
    "name": "Larm",
    "description": "Här bokför du löpande kostnader för larm och bevakning",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6370,
        "accountName": "Kostnader för bevakning och larm",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "y1hjg1ftdcmdf6s1feuasvyq",
    "name": "Mässor och utställningar",
    "description": "Kostnader för mässor och utställningar",
    "direction": "In",
    "categories": [
      "Möten, Konferens & Nöjen",
      "Reklam och PR"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5940,
        "accountName": "Utställningar och mässor",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "ybgiiiengocao6uh6tscziy3",
    "name": "Mjukvara licens",
    "description": "Inköp av tillstånd för att använda viss mjukvara, sker oftast i form av löpande månadsbetalningar, licenser såsom microsoft office, adobe m.m.",
    "direction": "In",
    "categories": [
      "Inköp tjänster",
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6910,
        "accountName": "Licensavgifter och royalties",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "uxqj1ugp6qbcxdl4xn8usaz1",
    "name": "Mjukvara",
    "description": "Inköp av mjukvara som behövs för bolagets verksamhet. Exempel: office, kassaregister etc.",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5420,
        "accountName": "Programvaror",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "n4p425x558bfoh3amn2kdj69",
    "name": "Mobiltelefon",
    "description": "Kostnader för mobiltelefon och abonnemang",
    "direction": "In",
    "categories": [
      "Bredband och Telefoni"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6212,
        "accountName": "Mobiltelefon",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "uf2kf9ajyivae2c9xzq57d5q",
    "name": "Parkering",
    "description": "Här bokför du företagets kostnader för parkering",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5810,
        "accountName": "Biljetter",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "l4vvif2p4pdxifbxf0ghlnbw",
    "name": "Patentansökan",
    "description": "Här bokför du kostnader för patentansökningar 0% moms",
    "direction": "In",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6920,
        "accountName": "Kostnader för egna patent",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "zil84wsquvvkvvyrmdiotg7m",
    "name": "Post",
    "description": "Kostnader för porto, och frimärken. Kuvert och emballage bokförs som kontorsmaterial.",
    "direction": "In",
    "categories": [
      "Varor och material",
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6250,
        "accountName": "Postbefordran",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "w0luaifgodhwjk7vecl257sa",
    "name": "Ränteintäkter",
    "description": "Här bokför du ränteintäkter från banken",
    "direction": "Out",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 8311,
        "accountName": "Ränteintäkter från bank",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "wsp259ysnkln2xy3a58je7y0",
    "name": "Redovisningstjänster",
    "description": "Kostnader för redovisningstjänster",
    "direction": "In",
    "categories": [
      "Finans och Försäkring",
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6530,
        "accountName": "Redovisningstjänster",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "cplt9sob9cwwaznarqjebq5a",
    "name": "Reklamkostnader",
    "description": "Här bokför du kostnader för framtagande av reklammaterial eller annat marknadsmaterial.",
    "direction": "In",
    "categories": [
      "Reklam och PR"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5990,
        "accountName": "Övriga kostnader för reklam och PR",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "zz0e9f3qlcsyplawwdcmww80",
    "name": "Sophämtning",
    "description": "Här bokför du kostnader för avfallshantering",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5062,
        "accountName": "Sophämtning",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "w76254k6pgdnklzb6p19o9nh",
    "name": "Städning",
    "description": "Här bokför du kostnader för städning av dina lokaler",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet",
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5061,
        "accountName": "Städning",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "kblzaz6qpvjvog037k9sdppj",
    "name": "Telefonavgifter",
    "description": "Kostnader för telefoner och abonnemang",
    "direction": "In",
    "categories": [
      "Bredband och Telefoni"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6210,
        "accountName": "Telekommunikation",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "y2sb8f33vrk4gbzribur57ca",
    "name": "Trycksaker",
    "description": "Här bokför du kostnader för trycksaker som visitkort och flyers",
    "direction": "In",
    "categories": [
      "Varor och material",
      "Reklam och PR"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6150,
        "accountName": "Trycksaker",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "fl2im1l6kk5j4cw48j77w0zg",
    "name": "Uppvärmning",
    "description": "Här bokför du kostnader för uppvärmning",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5030,
        "accountName": "Värme",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "hdc6jlpkom4twpvfs1fareke",
    "name": "Utbildning",
    "description": "Här bokför du utgifter för kurser, utbildningar mm.",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 7610,
        "accountName": "Utbildning",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "w85mokw8mv69utblupybv85e",
    "name": "Anställdas utlägg - utbetalning",
    "description": "Bokför utbetalning till anställd för tidigare utlägg. Minskar skulden på konto 2890.",
    "direction": "In",
    "categories": [
      "Personal",
      "Utlägg"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2890,
        "accountName": "Övriga kortfristiga skulder",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "utlagg_registrering_2890",
    "name": "Anställdas utlägg - registrering",
    "description": "Bokför utgifter som en anställd betalt med egna pengar. Kostnadskontot väljs beroende på typ av utgift.",
    "direction": "In",
    "categories": [
      "Personal",
      "Utlägg"
    ],
    "transactions": [
      {
        "account": 5010,
        "accountName": "Lokalhyra",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2890,
        "accountName": "Övriga kortfristiga skulder",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "utlagg_registrering_2893",
    "name": "Egna utlägg - registrering",
    "description": "Bokför utgifter som ägaren eller delägaren betalt med egna pengar. Används för egna utlägg med konto 2893.",
    "direction": "In",
    "categories": [
      "Personal",
      "Utlägg"
    ],
    "transactions": [
      {
        "account": 5010,
        "accountName": "Lokalhyra",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2893,
        "accountName": "Skulder till närstående personer",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "utlagg_utbetalning_2893",
    "name": "Egna utlägg - utbetalning",
    "description": "Bokför utbetalning till ägare eller delägare för tidigare utlägg. Minskar skulden på konto 2893.",
    "direction": "In",
    "categories": [
      "Personal",
      "Utlägg"
    ],
    "transactions": [
      {
        "account": 2893,
        "accountName": "Skulder till närstående personer",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "wnyhyt0t0l0x0rt7bf2wzk8d",
    "name": "Vatten och Avlopp",
    "description": "Här bokför du kostnader för vatten och avlopp",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5140,
        "accountName": "Vatten och avlopp",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "pvwd2gg278sdozvatlkevxkz",
    "name": "Aktieägartillskott",
    "description": "Här bokför du ovillkorade aktieägartillskott.",
    "direction": "Out",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2093,
        "accountName": "Erhållna aktieägartillskott",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "qim3oslizoe20dpgqpi5w39t",
    "name": "Aktiekapital",
    "description": "Här bokför du insättning av aktiekapital. (Om insättningen skedde före första dagen på räkenskapsåret så bokför du insättningen på första dagen på räkenskapsåret).",
    "direction": "Out",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2081,
        "accountName": "Aktiekapital",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "ktb0sqlkgqtuxyrlxim2yajx",
    "name": "Arbetskläder",
    "description": "Här bokför du arbetskläder som är anpassade till arbetet, till exempel uniformer och skyddskläder.",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5480,
        "accountName": "Arbetskläder och skyddsmaterial",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "zeodi0i2ayoev52is2zyrfk9",
    "name": "Arrendeintäkter",
    "description": "Nyttjanderätt till jord, mark m.m. emot vederlag",
    "direction": "Out",
    "categories": [
      "Övriga intäkter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2610,
        "accountName": "Utgående moms, 25 %",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 3912,
        "accountName": "Arrendeintäkter",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "jsv4v2jv928rnlle7rflm6mu",
    "name": "Återbetalning av momsfordran till skattekonto",
    "description": "Här bokför du när Skatteverket betalar ut momsfordran till ditt skattekonto",
    "direction": "Out",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1630,
        "accountName": "Avräkning för skatter och avgifter (skattekonto)",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 1650,
        "accountName": "Momsfordran",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "tmpiy21juwhjrvjwrr2cxipa",
    "name": "Avgifter avräkningsnota",
    "description": "Avgifter såsom factoring, till tex Klarna",
    "direction": "InShowAll",
    "categories": [
      "Finans och Försäkring",
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6064,
        "accountName": "Factoringavgifter",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "g9lyq3up251aph8866gf6v1l",
    "name": "Avräkningsnota utan moms",
    "description": "Här bokför du avgifter där ingen moms förekommer, såsom transaktionsavgifter från Izettle. Om det är moms på avgifterna ska ni använda er av mallen Avräkningsnota 25%.",
    "direction": "InShowAll",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6570,
        "accountName": "Bankkostnader",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "klot75pz49rex86j209ncfyg",
    "name": "Banklån",
    "description": "Här bokför du utbetalningen av banklån från banken till ditt företagskonto",
    "direction": "OutShowAll",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2350,
        "accountName": "Andra långfristiga skulder till kreditinstitut",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "zeyso4n14duymrjipveaok8s",
    "name": "Bilförsäkring",
    "description": "Här bokför du försäkring för bilar som företaget betalar för",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 5612,
        "accountName": "Försäkring och skatt för personbilar",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "skah606974aoj91w27t7fiuz",
    "name": "Bilskatt",
    "description": "Här bokför du bilskatt för de bilar företaget betalar",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 5612,
        "accountName": "Försäkring och skatt för personbilar",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "mu31i8722jpzx4ioqb798931",
    "name": "Bokföring av kreditkortsfaktura",
    "description": "Här bokför du kreditkortsfakturan när du sedan tidigare bokfört själva inköpen mot konto 2899.",
    "direction": "In",
    "categories": [
      "Övriga mallar"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2899,
        "accountName": "Övriga kortfristiga skulder",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "in1qvzzpqbz2pnmsxsjpd02l",
    "name": "Bolagsverket, avdragsgill",
    "description": "Här bokför du kostnader hos bolagsverket som är avdragsgilla. Exempel på detta är ändringsanmälan.",
    "direction": "In",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6991,
        "accountName": "Övriga externa kostnader, avdragsgilla",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "vpyyp8fdja4mt1u7gek3djbv",
    "name": "Bolagsverket, ej avdragsgill",
    "description": "Här bokför du kostnader hos bolagsverket som inte är avdragsgilla. Exempelvis avgifter för nyregistreringar.",
    "direction": "In",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6992,
        "accountName": "Övriga externa kostnader, ej avdragsgilla",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "jzcl88o2lkohv7hde5pyejnr",
    "name": "Bolt utbetalning",
    "description": "Här bokför du utbetalningar från Bolt. Glöm inte att också bokföra själva avräkningsnotan med mallen Bolt avräkning.",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1684,
        "accountName": "Kortfristiga fordringar hos leverantörer",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "b97bfylmn0ktc21pxb09m19n",
    "name": "Drivmedel, inrikes",
    "description": "Här bokför du kostnader för drivmedel så som bensin, diesel & etanol",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5611,
        "accountName": "Drivmedel för personbilar",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "ltvwchj383fi4gm9qwbgqo90",
    "name": "Drivmedel, utrikes",
    "description": "Här bokför du kostnader för drivmedel så som bensin, diesel & etanol. Som inhandlas utanför Sverige.",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 5611,
        "accountName": "Drivmedel för personbilar",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "k30q0rgf1vdyf6yfari55q6f",
    "name": "Dröjsmålsränta leverantörsfaktura",
    "description": "Dröjsmålsränta vid sen betalning av leverantörsfaktura",
    "direction": "In",
    "categories": [
      "Räntor och Påminnelseavgifter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 8422,
        "accountName": "Dröjsmålsräntor för leverantörsskulder",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "iunybulvkzxd4m8fb4nz4rqd",
    "name": "Ej avdragsgilla kostnader",
    "description": "Här bokför du kostnader som du ej får dra av på bolaget.",
    "direction": "In",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6992,
        "accountName": "Övriga externa kostnader, ej avdragsgilla",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "fnw9pk7p4u71sppqfpfjlv9o",
    "name": "Energikostnader",
    "description": "Här bokför du kostnader för energikostnader",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5300,
        "accountName": "Energikostnader (gruppkonto)",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "ecjfw5dzd4751z9slm89lh3p",
    "name": "Erhållna bidrag",
    "description": "Erhållna offentliga stöd samt EU-bidrag, korttidsarbete m.m. OBS bidrag är momsbefriade, men inte skattefria och skall tas upp i skattedeklarationen som inkomst i din näringsverksamhet",
    "direction": "Out",
    "categories": [
      "Övriga intäkter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3980,
        "accountName": "Erhållna offentliga stöd m.m.",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "xb4dsmxsz0y7kdwoztnxxlns",
    "name": "Fastighetsreparationer och underhåll",
    "description": "Här bokför du kostnader relaterade till fastighetskostnader t.ex. tak, fönster, ytterväggar",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5170,
        "accountName": "Reparation och underhåll av fastighet",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "v1dqhxtkffo24o6fwn6hxc6h",
    "name": "Förändring av lager av handelsvaror (minskat värde)",
    "description": "Här bokför du när lagret av handelsvaror har minskat, först inventerar och värderar du ditt lager, därefter jämför du nuvarande saldot i bokföringen (konto 1460) med det nu värderade lagervärdet. I den här mallen tar du sedan upp mellanskillnaden så att värdet i bokföringen stämmer med senaste lagervärdet. (Om värdet har ökat använd istället mallen för ökat värde.)",
    "direction": "InShowAll",
    "categories": [
      "Övriga mallar"
    ],
    "transactions": [
      {
        "account": 1460,
        "accountName": "Lager av handelsvaror",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 4960,
        "accountName": "Förändring av lager av handelsvaror",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "csx1p1r2bbo5nus7eodc7q6q",
    "name": "Förändring av lager av handelsvaror (ökat värde)",
    "description": "Här bokför du när lagret av handelsvaror har ökat, först inventerar och värderar du ditt lager, därefter jämför du nuvarande saldot i bokföringen (konto 1460) med det nu värderade lagervärdet. I den här mallen tar du sedan upp mellanskillnaden så att värdet i bokföringen stämmer med senaste lagervärdet. (Om värdet har minskat använd istället mallen för minskat värde.)",
    "direction": "InShowAll",
    "categories": [
      "Övriga mallar"
    ],
    "transactions": [
      {
        "account": 1460,
        "accountName": "Lager av handelsvaror",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 4960,
        "accountName": "Förändring av lager av handelsvaror",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "wh1fl9o4zi5cqn4go0b0rfb4",
    "name": "Försäljning tjänster",
    "description": "Försäljning av tjänster till kund inom Sverige.",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2610,
        "accountName": "Utgående moms, 25 %",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 3011,
        "accountName": "Försäljning tjänster inom Sverige, 25 % moms",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "twhc4gs7bts1escceqpn5ild",
    "name": "Försäljning tjänster",
    "description": "För dig som säljer tjänster inom Sverige.",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2630,
        "accountName": "Utgående moms, 6 %",
        "debit": 0,
        "credit": 56.6
      },
      {
        "account": 3013,
        "accountName": "Försäljning tjänster inom Sverige, 6 % moms",
        "debit": 0,
        "credit": 943.4
      }
    ]
  },
  {
    "id": "xdpmfw40akym2cn26u2yt6up",
    "name": "Försäljning tjänster",
    "description": "För dig som säljer tjänster inom Sverige",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2620,
        "accountName": "Utgående moms, 12 %",
        "debit": 0,
        "credit": 107.14
      },
      {
        "account": 3012,
        "accountName": "Försäljning tjänster inom Sverige, 12 % moms",
        "debit": 0,
        "credit": 892.86
      }
    ]
  },
  {
    "id": "ub90ab37jgkvidzhw46zax1k",
    "name": "Försäljning tjänster inom EU",
    "description": "Här bokför du försäljning av tjänster inom EU",
    "direction": "Out",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3308,
        "accountName": "Försäljning tjänster till annat EU-land",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "tvc53rra72t9yle13jscrgga",
    "name": "Försäljning tjänster momsfri",
    "description": "För dig som bedriver momsfri försäljning av tjänster.",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3014,
        "accountName": "Försäljning tjänster inom Sverige, momsfri",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "frhrw5e9e5ufmxvwz0tklfnk",
    "name": "Försäljning tjänster utanför EU",
    "description": "Här bokför du försäljning av tjänster utanför EU",
    "direction": "Out",
    "categories": [
      "Utanför EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3305,
        "accountName": "Försäljning tjänster till land utanför EU",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "iw2csqdvgy8648vvce1riddq",
    "name": "Försäljning varor",
    "description": "För dig som säljer varor",
    "direction": "Out",
    "categories": [
      "Försäljning varor"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2620,
        "accountName": "Utgående moms, 12 %",
        "debit": 0,
        "credit": 107.14
      },
      {
        "account": 3002,
        "accountName": "Försäljning varor inom Sverige, 12 % moms",
        "debit": 0,
        "credit": 892.86
      }
    ]
  },
  {
    "id": "p1it1kjgrs55v7usq0z0cn29",
    "name": "Försäljning varor",
    "description": "Försäljning av varor till kund inom Sverige.",
    "direction": "Out",
    "categories": [
      "Försäljning varor"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2610,
        "accountName": "Utgående moms, 25 %",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 3001,
        "accountName": "Försäljning varor inom Sverige, 25 % moms",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "d917hp0qed7dligyn7sj3dxc",
    "name": "Försäljning varor",
    "description": "För dig som säljer varor",
    "direction": "Out",
    "categories": [
      "Försäljning varor"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2630,
        "accountName": "Utgående moms, 6 %",
        "debit": 0,
        "credit": 56.6
      },
      {
        "account": 3003,
        "accountName": "Försäljning varor inom Sverige, 6 % moms",
        "debit": 0,
        "credit": 943.4
      }
    ]
  },
  {
    "id": "nrbi76kwdmhixv7aa0kae5aw",
    "name": "Försäljning varor inom EU (företag)",
    "description": "Här bokför du försäljning av varor inom EU till företag med VAT nummer",
    "direction": "Out",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3108,
        "accountName": "Försäljning varor till annat EU-land, momsfri",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "xhwziesau14nq7ku404lttfe",
    "name": "Försäljning varor inom EU (privatperson) 12% moms",
    "description": "OBS! om försäljningen överskrider EUs omsättningströskel så behöver du antingen registrera dig för moms i det landet eller registrera dig via e-tjänsten OSS.",
    "direction": "Out",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2620,
        "accountName": "Utgående moms, 12 %",
        "debit": 0,
        "credit": 107.14
      },
      {
        "account": 3106,
        "accountName": "Försäljning varor till annat EU-land, momspliktig",
        "debit": 0,
        "credit": 892.86
      }
    ]
  },
  {
    "id": "f18l6aij57w9znb9mged3amq",
    "name": "Försäljning varor inom EU (privatperson) 25% moms",
    "description": "OBS! om försäljningen överskrider EUs omsättningströskel så behöver du antingen registrera dig för moms i det landet eller registrera dig via e-tjänsten OSS.",
    "direction": "Out",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2610,
        "accountName": "Utgående moms, 25 %",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 3106,
        "accountName": "Försäljning varor till annat EU-land, momspliktig",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "myq91v8r41cydygt66zcqvfb",
    "name": "Försäljning varor momsfri",
    "description": "För dig som bedriver momsfri försäljning av varor inom Sverige",
    "direction": "Out",
    "categories": [
      "Försäljning varor"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3004,
        "accountName": "Försäljning varor inom Sverige, momsfri",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "ac80yu9ns81fz0zt5n0pqmyh",
    "name": "Försäljning varor utanför EU",
    "description": "Här bokför du försäljning av varor som du exporterar utanför EU",
    "direction": "Out",
    "categories": [
      "Utanför EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3105,
        "accountName": "Försäljning varor till land utanför EU",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "zmamhw86wdb8j0yeg2uvgj8y",
    "name": "Förseningsavgift till skatteverket",
    "description": "Här bokför du förseningsavgift till skatteverket som har dragits från ditt skattekonto.",
    "direction": "In",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1630,
        "accountName": "Avräkning för skatter och avgifter (skattekonto)",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6992,
        "accountName": "Övriga externa kostnader, ej avdragsgilla",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "rnjdz6pneyl34vrwaddgsu9q",
    "name": "Frakt",
    "description": "Här bokför du fraktkostnader",
    "direction": "In",
    "categories": [
      "Frakt",
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5710,
        "accountName": "Frakter, transporter och försäkringar vid varudistribution",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "fk1vbtpzozanpv7l23qqj0z0",
    "name": "Fruktkorg",
    "description": "Här bokför du fruktkorg till kontoret.",
    "direction": "In",
    "categories": [
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 107.14,
        "credit": 0
      },
      {
        "account": 7699,
        "accountName": "Övriga personalkostnader",
        "debit": 892.86,
        "credit": 0
      }
    ]
  },
  {
    "id": "gerjuwpmz9qn8cv5e2tok5gn",
    "name": "Inbetalning från Ework (Faktureringsmetoden)",
    "description": "Här bokför du som bokför med faktureringsmetoden inbetalningen från Ework. Din SelfBilling bokför du först med mallen \"Ework SelfBilling 25% moms (Faktureringsmetoden)\".",
    "direction": "Out",
    "categories": [
      "Övriga intäkter"
    ],
    "transactions": [
      {
        "account": 1511,
        "accountName": "Kundfordringar",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "rr2087m0j3ikuyrnejy9kdlc",
    "name": "Inköp tjänster inom EU 25%",
    "description": "Här bokför du inköp av tjänster från annat EU land med 25% beräknad moms.  Om du vill få din bokföring mer specificerad kan du inom de flesta av våra andra mallar göra valet \"Från EU-land\" och med hjälp av det också få momsrapporten rätt.",
    "direction": "In",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2614,
        "accountName": "Utgående moms omvänd skattskyldighet, 25 %",
        "debit": 0,
        "credit": 250
      },
      {
        "account": 2645,
        "accountName": "Beräknad ingående moms på förvärv från utlandet",
        "debit": 250,
        "credit": 0
      },
      {
        "account": 4535,
        "accountName": "Inköp av tjänster från annat EU-land, 25 %",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "z25l0uxn13iz4prrjagteivx",
    "name": "Inköp Tjänster utanför EU",
    "description": "Här bokför du inköp av tjänster från länder utanför EU där omvänd skattskyldighet gäller.  Om du vill få din bokföring mer specificerad kan du inom de flesta av våra andra mallar göra valet \"Från icke EU-land\" och med hjälp av det också få momsrapporten rätt.",
    "direction": "In",
    "categories": [
      "Utanför EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2614,
        "accountName": "Utgående moms omvänd skattskyldighet, 25 %",
        "debit": 0,
        "credit": 250
      },
      {
        "account": 2645,
        "accountName": "Beräknad ingående moms på förvärv från utlandet",
        "debit": 250,
        "credit": 0
      },
      {
        "account": 4531,
        "accountName": "Import tjänster land utanför EU, 25% moms",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "jl6sbwxkcy0aso0x1085lfa5",
    "name": "Inköp varor utanför EU",
    "description": "Här bokför du inköp av varor utanför EU med omvänd skattskyldighet. Tänk på att använda händelsen \"Moms inköp av varor utanför EU\" När fakturan med tull & moms anländer.",
    "direction": "In",
    "categories": [
      "Utanför EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 4010,
        "accountName": "Inköp material och varor",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 4500,
        "accountName": "Inköp utanför Sverige",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 4598,
        "accountName": "Justering, omvänd moms",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "piaab48v8poaadmcrzxdb6yb",
    "name": "Inköp Anläggningstillgång",
    "description": "Inköp av anläggningstillgångar, vilket är en tillgång som är avsedd för stadigvarande bruk eller innehav, som har en nyttjandeperiod på minst tre år och har ett högre värde än ett halvt prisbasbelopp.",
    "direction": "In",
    "categories": [
      "Tillgångar"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5410,
        "accountName": "Förbrukningsinventarier",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "yipceql2v7n3pcrc8ok7d7k1",
    "name": "Inköp förbrukningsinventarier",
    "description": "Inköp av förbrukningsinventarier. Detta är inventarier med kort livslängd eller lågt värde (1-3 år eller mindre värde än ett halvt PBB). Tex dator, hårddisk, mobiltelefon, dammsugare m.m.",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet",
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5410,
        "accountName": "Förbrukningsinventarier",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "tegzomonu151zh0fu6wc6c7z",
    "name": "Inköp förbrukningsmaterial",
    "description": "Här bokför du material som har livslängd kortare än 1 år med mindre och av obetydligt värde. Tex batterier, glödlampor och papperspåsar, men även material som används i tillverkning, men som ej är en del av själva varan såsom klister, knappar och hinkar",
    "direction": "In",
    "categories": [
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5460,
        "accountName": "Förbrukningsmaterial",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "erw25dh07b78sb5gl0ct0kig",
    "name": "Inköp tjänster",
    "description": "Här bokför du inköp av tjänster inom Sverige",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6590,
        "accountName": "Övriga externa tjänster",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "se2jsjd8gkq9bufdqf96w7zl",
    "name": "Inköp tjänster i Sverige, omvänd skatteskyldighet moms 25%",
    "description": "Används för inköp av tjänster i Sverige där omvänd momsskyldighet gäller, dvs att du som köpare ska betala momsen. Detta gäller främst när byggföretag köper tjänster av andra byggföretag.",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2617,
        "accountName": "Utgående moms omvänd skattskyldighet varor och tjänster i Sverige, 25 %",
        "debit": 0,
        "credit": 250
      },
      {
        "account": 2647,
        "accountName": "Ingående moms omvänd skattskyldighet varor och tjänster i Sverige",
        "debit": 250,
        "credit": 0
      },
      {
        "account": 4400,
        "accountName": "Inköpta tjänster i Sverige, omvänd skattskyldighet",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 4425,
        "accountName": "Inköpta tjänster i Sverige, omvänd skattskyldighet, 25 %",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 4600,
        "accountName": "Legoarbeten och underentreprenader (gruppkonto)",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "nzxtjys7o0fz2yin6fhug9v5",
    "name": "Inköp tjänster inom EU 6% moms",
    "description": "Här bokför du inköp av tjänster från annat EU land med 6% beräknad moms",
    "direction": "In",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2634,
        "accountName": "Utgående moms omvänd skattskyldighet, 6 %",
        "debit": 0,
        "credit": 60
      },
      {
        "account": 2645,
        "accountName": "Beräknad ingående moms på förvärv från utlandet",
        "debit": 60,
        "credit": 0
      },
      {
        "account": 4537,
        "accountName": "Inköp av tjänster från annat EU-land, 6 %",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "svwr5og215u8nq9ngqurg315",
    "name": "Inköp Varor",
    "description": "Här bokför du inköp av varor.",
    "direction": "In",
    "categories": [
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 107.14,
        "credit": 0
      },
      {
        "account": 4010,
        "accountName": "Inköp material och varor",
        "debit": 892.86,
        "credit": 0
      }
    ]
  },
  {
    "id": "m14fxit73s38zdqn0jemoois",
    "name": "Inköp varor",
    "description": "Inköp av varor/förbrukningsvaror eller råmaterial för bolagets verksamhet även kallade direkta kostnader. Detta är en kostnad som direkt kan härledas till en vara eller tjänst.",
    "direction": "In",
    "categories": [
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 4010,
        "accountName": "Inköp material och varor",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "oxkvs5cwe25eeof0vgw0q7z4",
    "name": "Inköp Varor",
    "description": "Här bokför du inköp av varor.",
    "direction": "In",
    "categories": [
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 56.6,
        "credit": 0
      },
      {
        "account": 4010,
        "accountName": "Inköp material och varor",
        "debit": 943.4,
        "credit": 0
      }
    ]
  },
  {
    "id": "pnqm8725hbaju2z7dxz5wmrf",
    "name": "Inköp varor inom EU 12% moms",
    "description": "Här bokför du inköp av varor från EU land med 12% beräknad moms",
    "direction": "In",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2624,
        "accountName": "Utgående moms omvänd skattskyldighet, 12 %",
        "debit": 0,
        "credit": 120
      },
      {
        "account": 2645,
        "accountName": "Beräknad ingående moms på förvärv från utlandet",
        "debit": 120,
        "credit": 0
      },
      {
        "account": 4516,
        "accountName": "Inköp av varor från annat EU-land, 12 %",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "z2zua5117vqwvjojyza2j56w",
    "name": "Inköp varor inom EU 25% moms",
    "description": "Här bokför du inköp av varor inom EU med fiktiv momssats 25%",
    "direction": "In",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2614,
        "accountName": "Utgående moms omvänd skattskyldighet, 25 %",
        "debit": 0,
        "credit": 250
      },
      {
        "account": 2645,
        "accountName": "Beräknad ingående moms på förvärv från utlandet",
        "debit": 250,
        "credit": 0
      },
      {
        "account": 4010,
        "accountName": "Inköp material och varor",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 4515,
        "accountName": "Inköp av varor från annat EU-land, 25 %",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 4598,
        "accountName": "Justering, omvänd moms",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "kygx51b6gx246r5l5rb1ooxp",
    "name": "Inköp varor inom EU 6% moms",
    "description": "Här bokför du inköp av varor från annat EU land med 6% beräknad moms",
    "direction": "In",
    "categories": [
      "Inom EU"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2634,
        "accountName": "Utgående moms omvänd skattskyldighet, 6 %",
        "debit": 0,
        "credit": 60
      },
      {
        "account": 2645,
        "accountName": "Beräknad ingående moms på förvärv från utlandet",
        "debit": 60,
        "credit": 0
      },
      {
        "account": 4517,
        "accountName": "Inköp av varor från annat EU-land, 6 %",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "hboftoiuabhb8v3irso3zxvi",
    "name": "Inköp varor momsfri",
    "description": "Här bokför du inköp av varor som är momsfria för vidareförsäljning. Observera att om du köper in begagnade varor kan det förekomma vinstmarginalbeskattning se hjälptext Hur bokför jag vinstmarginalbeskattning, i sådana fall.",
    "direction": "In",
    "categories": [
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 4010,
        "accountName": "Inköp material och varor",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "regvkjm70gqv1ewbcg2jo0t6",
    "name": "Insättning till skattekonto",
    "description": "Här bokför du insättning till skattekonto från ditt bankkonto",
    "direction": "In",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1630,
        "accountName": "Avräkning för skatter och avgifter (skattekonto)",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "n4qc2v5lymf726bxiehdt900",
    "name": "Intäktsränta på skattekontot",
    "description": "Här bokför du intäktsränta som du har fått insatt på ditt skattekonto",
    "direction": "Out",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1630,
        "accountName": "Avräkning för skatter och avgifter (skattekonto)",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 8314,
        "accountName": "Skattefria ränteintäkter",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "xco4rowuczkhjwo6pfu0y6a8",
    "name": "Kickback momsfri",
    "description": "Intäkter från Kickback. Momsfri",
    "direction": "OutShowAll",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3929,
        "accountName": "Kickback momsfri",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "sb636lpoaoruxvhidqrbp8li",
    "name": "Konsulttjänster",
    "description": "Här bokför du Konsulttjänster.",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 56.6,
        "credit": 0
      },
      {
        "account": 6910,
        "accountName": "Licensavgifter och royalties",
        "debit": 943.4,
        "credit": 0
      }
    ]
  },
  {
    "id": "gagfblquh0b99ra2kjj29fdm",
    "name": "Kortfristiga placeringar",
    "description": "Här bokför du kortfristiga placeringar av rörelsekaraktär",
    "direction": "In",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1880,
        "accountName": "Andra kortfristiga placeringar",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "ch9wb455kkmtpla8isndch3c",
    "name": "Kostnader för transportmedel",
    "description": "Här bokför du avgifter för fordon exempel vägtrafikregisteravgift, registreringsbevis",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5600,
        "accountName": "Kostnader för transportmedel (gruppkonto)",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "h8w550d9irv7qcgfakh0g3we",
    "name": "Kostnadsränta på skattekontot",
    "description": "Här bokför du när skatteverket har dragit kostnadsränta från ditt skattekonto",
    "direction": "In",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1630,
        "accountName": "Avräkning för skatter och avgifter (skattekonto)",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 8423,
        "accountName": "Räntekostnader för skatter och avgifter",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "zjegr9cf933ah9s5rxbg0mjh",
    "name": "Kreditupplysning",
    "description": "Här bokför du tex fakturor från kreditupplysning såsom UC med 25% moms.",
    "direction": "In",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6061,
        "accountName": "Kreditupplysning",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "k70uuceyxqfbtn9gcx0s472o",
    "name": "Leasing och hyra av inventarier",
    "description": "Vid hyra av inventarier såsom dator, kameror och liknande utrustning",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5220,
        "accountName": "Hyra av inventarier och verktyg",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "cibaeieir75umt6qk1u2943b",
    "name": "Leasing och hyra av maskiner",
    "description": "Här bokför du hyra av maskiner",
    "direction": "In",
    "categories": [
      "Övriga mallar"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5210,
        "accountName": "Hyra av maskiner och andra tekniska anläggningar",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "sf7djacr4g5iz0w6pdatua8h",
    "name": "Legoarbeten och underentreprenader.",
    "description": "Här bokförs underentreprenader. Dock viktigt att istället använda vår andra mall \"Inköp tjänster i Sverige, omvänd skatteskyldighet moms 25%\" om du har ett byggföretag som anlitar ett annat byggföretag.",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 4600,
        "accountName": "Legoarbeten och underentreprenader (gruppkonto)",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "xr3nk3tw46dwr6qy27v9x9l1",
    "name": "Leverantörsbetalningar",
    "description": "Du som har fakturametoden bokför med den här mallen när själva betalningen av leverantörsfakturan görs. (Om du har bokfört leverantörsfakturan via Bokio markerar du den istället som betald via leverantörsfaktura-funktionen).",
    "direction": "In",
    "categories": [
      "Inköp tjänster",
      "Varor och material"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2440,
        "accountName": "Leverantörsskulder",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "kno1ztof09ltxnm9v5dzyhd2",
    "name": "Lokalreparationer och underhåll",
    "description": "Här bokför du kostnader relaterade till reparationer och underhåll inomhus t.ex. av skåp, armaturer eller golv",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5070,
        "accountName": "Reparation och underhåll av lokaler",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "zgmbcsnws2rwprdasu57sx19",
    "name": "Milersättning, utgår ifrån summa utbetald",
    "description": "Här bokför du ersättning för resa med bil efter årskiftet 2022/2023. Ersättning medges för närvarande skattefritt med 25kr per mil med egen bil. Ersättning över denna nivå är skattepliktig. OBS, delägare i enskild firma använder mall milersättning ägare enskild firma. (Den här mallen går att använda från sidan transaktioner att bokföra.)",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 7332,
        "accountName": "Skattepliktiga bilersättningar",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "qd4x6ttxifcatvjerra7rlsc",
    "name": "Moms dragen från skattekonto",
    "description": "Här bokför du när Skatteverket drar pengar från skattekontot",
    "direction": "In",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1630,
        "accountName": "Avräkning för skatter och avgifter (skattekonto)",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2650,
        "accountName": "Redovisningskonto för moms",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "hz6s7lerky42d0u1dw4jjjqz",
    "name": "Öresavrundning nedåt/kostnad och uppåt/intäkt",
    "description": "Den här mallen används för öresavrundningar som bokförs i kredit. Det vill säga en avrundning nedåt om det gäller en kostnad alternativt en avrundning uppåt om det gäller en inkomst.",
    "direction": "OutShowAll",
    "categories": [
      "Räntor och Påminnelseavgifter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 3740,
        "accountName": "Öres- och kronutjämning",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "a2u9ivgjcp9h9zgj3pi83gtd",
    "name": "Öresavrundning uppåt/kostnad och nedåt/intäkt",
    "description": "Den här mallen används för öresavrundningar som bokförs i debet. Det vill säga en avrundning uppåt om det gäller en kostnad alternativt en avrundning nedåt om det gäller en inkomst.",
    "direction": "InShowAll",
    "categories": [
      "Räntor och Påminnelseavgifter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 3740,
        "accountName": "Öres- och kronutjämning",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "ozl3z6rtt8iyi1jkjybxzzjv",
    "name": "Överföring till företagskonto",
    "description": "Här bokför du överföring från ditt sparkonto till ditt företagskonto",
    "direction": "Out",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 1931,
        "accountName": "Sparkonto",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "lfy33d8m4hwdzz7w79i1fuzq",
    "name": "Överföring till sparkonto",
    "description": "Här bokför du överföring från Företagskonto till sparkonto",
    "direction": "In",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 1931,
        "accountName": "Sparkonto",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "zjp74u1bhqdhfydxdxpmb8ep",
    "name": "Övriga Bilkostnader",
    "description": "Här bokför du övriga bilkostnader",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5619,
        "accountName": "Övriga personbilskostnader",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "cbogr7jhbmwg6thy1he2fauw",
    "name": "Övriga externa tjänster",
    "description": "Här bokför du övriga externa tjänster. Denna kan till exempel användas till när en ägare i en enskild firma har deltagit i en utbildning.",
    "direction": "In",
    "categories": [
      "Övriga mallar"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6590,
        "accountName": "Övriga externa tjänster",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "sd6jdcht2yot1mbithozg0u1",
    "name": "Övriga försäljningskostnader",
    "description": "Här bokför du övriga försäljningskostnader",
    "direction": "In",
    "categories": [
      "Kontor och Fastighet"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 6090,
        "accountName": "Övriga försäljningskostnader",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "s96z7qfk90ftmhhz9tuvro1v",
    "name": "Påminnelseavgift",
    "description": "Påminnelseavgift på en leverantörsfaktura",
    "direction": "In",
    "categories": [
      "Räntor och Påminnelseavgifter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 6990,
        "accountName": "Övriga externa kostnader",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "tqf3yvoiph1vj759xs1bix6j",
    "name": "Pensionsförsäkring",
    "description": "Här bokför du kostnader för individuell pensionsförsäkring till anställda.",
    "direction": "In",
    "categories": [
      "Personal",
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2514,
        "accountName": "Beräknad särskild löneskatt på pensionskostnader",
        "debit": 0,
        "credit": 242.6
      },
      {
        "account": 7412,
        "accountName": "Premier för individuella pensionsförsäkringar",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 7533,
        "accountName": "Särskild löneskatt för pensionskostnader",
        "debit": 242.6,
        "credit": 0
      }
    ]
  },
  {
    "id": "papk0cb79i7d9m7ziq826byk",
    "name": "Preliminärskatt dragen från skattekonto Aktiebolag",
    "description": "Dragning från skattekontot för preliminärskatt för aktiebolag även kallat F-skatt. Om du vill bokföra själva inbetalningen till skattekontot från ditt bankkonto så använd istället mallen: Insättning till skattekonto",
    "direction": "In",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1630,
        "accountName": "Avräkning för skatter och avgifter (skattekonto)",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2510,
        "accountName": "Skatteskulder",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "e0qzridun6l3yihbwrziqcjz",
    "name": "Provision",
    "description": "Intäkter från provision.",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2610,
        "accountName": "Utgående moms, 25 %",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 3920,
        "accountName": "Provisionsintäkter, licensintäkter och royalties",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "pie06iv3fwan8oe2d7qelp9j",
    "name": "Reparationer och underhåll av maskiner",
    "description": "Kostnader relaterade till reparationer och underhåll gällande maskiner",
    "direction": "In",
    "categories": [
      "Reparationer och Underhåll"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5510,
        "accountName": "Reparation och underhåll av maskiner och andra tekniska anläggningar",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "yw0d9nbcrrchjo4shnxfx407",
    "name": "Representation utomlands",
    "description": "Utomlands representation där ingen moms kan lyftas",
    "direction": "In",
    "categories": [
      "Inom EU",
      "Utanför EU",
      "Resa och Boende"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 7632,
        "accountName": "Personalrepresentation, ej avdragsgill",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "ghgag2lol3ldrmxubes2dtu5",
    "name": "Retur av förbrukningsinventarier inom Sverige",
    "description": "Retur av förbrukningsinventarier. Detta är inventarier med kort livslängd eller lågt värde (1-3 år eller mindre värde än ett halvt PBB). Tex dator, hårddisk, mobiltelefon, dammsugare m.m.",
    "direction": "Out",
    "categories": [
      "Returer"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 5410,
        "accountName": "Förbrukningsinventarier",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "rdrsn7ab58ijyrwiu4vzqy59",
    "name": "Retur av varor inom Sverige",
    "description": "Retur av varor/förbrukningsvaror eller råmaterial för bolagets verksamhet även kallade direkta kostnader.",
    "direction": "Out",
    "categories": [
      "Returer"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 4010,
        "accountName": "Inköp material och varor",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "k86izr7eoetdrkupg4bytv6n",
    "name": "Rot, Rut eller Grön teknik utbetalning fakturametoden",
    "description": "Utbetalning från Skatteverket för ett avdrag av Rot, Rut eller Grön teknik med fakturametoden.\n(Använd endast om du skapat Rot/Rut-fakturan i Bokio)",
    "direction": "Out",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1513,
        "accountName": "Kundfordringar – delad faktura",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "yophiwzsmf9xy9dqb6gengw5",
    "name": "Rot, Rut eller Grön teknik utbetalning kontantmetoden",
    "description": "Utbetalning från Skatteverket för ett avdrag av Rot, Rut eller Grön teknik med kontantmetoden.\n(Använd endast om du skapat Rot/Rut-fakturan i Bokio)",
    "direction": "Out",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2611,
        "accountName": "Utgående moms på försäljning inom Sverige, 25 %",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 3011,
        "accountName": "Försäljning tjänster inom Sverige, 25 % moms",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "q7ci0tks2ujamkg2lzdtywm9",
    "name": "Royalties",
    "description": "Här bokför du kostnader för royalties.",
    "direction": "In",
    "categories": [
      "Inköp tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 56.6,
        "credit": 0
      },
      {
        "account": 6910,
        "accountName": "Licensavgifter och royalties",
        "debit": 943.4,
        "credit": 0
      }
    ]
  },
  {
    "id": "evj9pi3zas2yly4xo27xdgvx",
    "name": "Royalty",
    "description": "Här bokför du intäkter från royalties",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2630,
        "accountName": "Utgående moms, 6 %",
        "debit": 0,
        "credit": 56.6
      },
      {
        "account": 3920,
        "accountName": "Provisionsintäkter, licensintäkter och royalties",
        "debit": 0,
        "credit": 943.4
      }
    ]
  },
  {
    "id": "g26or3hj87dxwvsuvta67hbo",
    "name": "Royalty",
    "description": "Här bokför du intäkter för royalties",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2610,
        "accountName": "Utgående moms, 25 %",
        "debit": 0,
        "credit": 200
      },
      {
        "account": 3920,
        "accountName": "Provisionsintäkter, licensintäkter och royalties",
        "debit": 0,
        "credit": 800
      }
    ]
  },
  {
    "id": "kztggno37rsg43bn0an2otl5",
    "name": "Sjukvårdsförsäkring",
    "description": "Här bokför du sjukvårdsförsäkring till de anställda, som är avdragsgillt. Tänk på att 60% procent av beloppet ska förmånsbeskattas för den anställde. Detta får du lägga till i annan förmån under lönefunktionen.",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 7621,
        "accountName": "Sjuk- och hälsovård, avdragsgill",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "l3cpouljnncfc5nsq2asy3q6",
    "name": "Skattefritt traktamenten i Sverige",
    "description": "Här bokför du skattefritt traktamente i Sverige. (För alla utom ägare av enskild firma)",
    "direction": "In",
    "categories": [
      "Resa och Boende"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 7321,
        "accountName": "Skattefria traktamenten, Sverige",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "lmx242jmntt5g1h43agsww26",
    "name": "Skattefritt traktamenten utomlands",
    "description": "Här bokför du skattefritt traktamente för en resa utomlands. (För alla utom ägare av enskild firma)",
    "direction": "In",
    "categories": [
      "Resa och Boende"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 7323,
        "accountName": "Skattefria traktamenten, utlandet",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "wkndy0orp6x41tyyqolk5aj9",
    "name": "Tjänstegrupplivsförsäkring TGL",
    "description": "Premien till tjänstegrupplivsförsäkringen är en skattefri förmån av arbetsmarknadsförsäkringar.",
    "direction": "In",
    "categories": [
      "Finans och Försäkring"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 7570,
        "accountName": "Premier för arbetsmarknadsförsäkringar",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "dfjfyk5hsafo8h06xzjpuj23",
    "name": "Trängselskatt avdragsgill",
    "description": "Här bokför du avdragsgill trängselskatt",
    "direction": "In",
    "categories": [
      "Bil och Transport"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 5616,
        "accountName": "Trängselskatt, avdragsgill",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "pvh9x578s57bajj32xwr6b91",
    "name": "Tvätt eller underhåll av arbetskläder",
    "description": "Här bokför du kostnader relaterade till tvätt eller underhåll av arbetskläder",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 200,
        "credit": 0
      },
      {
        "account": 5580,
        "accountName": "Underhåll och tvätt av arbetskläder",
        "debit": 800,
        "credit": 0
      }
    ]
  },
  {
    "id": "l3sj5rtrmxlwpy3otiixguva",
    "name": "Uber avgift",
    "description": "Här bokförd du den avgift Uber tar ut",
    "direction": "In",
    "categories": [
      "Resa och Boende"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2614,
        "accountName": "Utgående moms omvänd skattskyldighet, 25 %",
        "debit": 0,
        "credit": 250
      },
      {
        "account": 2645,
        "accountName": "Beräknad ingående moms på förvärv från utlandet",
        "debit": 250,
        "credit": 0
      },
      {
        "account": 4535,
        "accountName": "Inköp av tjänster från annat EU-land, 25 %",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "udmcwnseku73jhjbija4e4wv",
    "name": "Uber utbetalning",
    "description": "Här bokför du körningar du gjort för UBER",
    "direction": "Out",
    "categories": [
      "Försäljning tjänster"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 2630,
        "accountName": "Utgående moms, 6 %",
        "debit": 0,
        "credit": 56.6
      },
      {
        "account": 3013,
        "accountName": "Försäljning tjänster inom Sverige, 6 % moms",
        "debit": 0,
        "credit": 943.4
      }
    ]
  },
  {
    "id": "hxosul0ncrcsxtaafci5h77x",
    "name": "Utbetalning av utdelning",
    "description": "Här bokför du utbetalning av utdelning från det egna bolaget, efter beslut på bolagstämman.",
    "direction": "In",
    "categories": [
      "Övriga mallar"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2898,
        "accountName": "Outtagen vinstutdelning",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "swat3ky5rkttbapop51n11tj",
    "name": "Utbetalningar för Swish",
    "description": "Den här mallen använder du för att flytta över pengar från Swish till banken, om du har bokfört en dagskassa på konto 1680 sedan tidigare, till exempel med vår Zettleintegration.",
    "direction": "Out",
    "categories": [
      "Övriga intäkter"
    ],
    "transactions": [
      {
        "account": 1680,
        "accountName": "Andra kortfristiga fordringar",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      }
    ]
  },
  {
    "id": "g7ob1d9f83751l3xea68pwvu",
    "name": "Utbildning (Idrott)",
    "description": "Utbildning av personer som ska utöva en idrott. För övriga utbildningar välj mall utbildning.",
    "direction": "In",
    "categories": [
      "Personal"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 2640,
        "accountName": "Ingående moms",
        "debit": 56.6,
        "credit": 0
      },
      {
        "account": 7610,
        "accountName": "Utbildning",
        "debit": 943.4,
        "credit": 0
      }
    ]
  },
  {
    "id": "zge4zjb66u3jyi5ek3o8uer5",
    "name": "Utdelning på andelar i andra företag",
    "description": "Här bokförs utdelning på andelar som företaget äger i ett annat bolag, dock inte om det är från ett koncern bolag eller intressebolag, då ska du istället använda mallarna för just det.",
    "direction": "Out",
    "categories": [
      "Andelar i andra bolag"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 8210,
        "accountName": "Utdelningar på andelar i andra företag",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "hg01svndlmlsf0h4vq7v8lfv",
    "name": "Utdelning på andelar i intresseföretag",
    "description": "Här bokförs utdelning på andelar som företaget äger i ett annat intresseföretag",
    "direction": "Out",
    "categories": [
      "Andelar i andra bolag"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 8110,
        "accountName": "Utdelning på andelar i intresseföretag",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "u9x8w5p84d05zqum7p9arvou",
    "name": "Utdelning på andelar i koncernbolag",
    "description": "Här bokförs utdelning på andelar som företaget äger i ett annat koncernbolag",
    "direction": "Out",
    "categories": [
      "Andelar i andra bolag"
    ],
    "transactions": [
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      },
      {
        "account": 8010,
        "accountName": "Utdelning på andelar i koncernföretag",
        "debit": 0,
        "credit": 1000
      }
    ]
  },
  {
    "id": "b582rfxw0y6rrpop053otfz8",
    "name": "Uttag från skattekonto",
    "description": "Här bokför du överföringar från ditt skattekonto till bankkonto",
    "direction": "Out",
    "categories": [
      "Skatter och avgifter"
    ],
    "transactions": [
      {
        "account": 1630,
        "accountName": "Avräkning för skatter och avgifter (skattekonto)",
        "debit": 0,
        "credit": 1000
      },
      {
        "account": 1930,
        "accountName": "Företagskonto / affärskonto",
        "debit": 1000,
        "credit": 0
      }
    ]
  }
];

export const TEMPLATE_BASE_AMOUNT = 1000;
