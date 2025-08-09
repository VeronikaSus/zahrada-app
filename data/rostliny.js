// Data rostlin pro zahradní aplikaci
// Obrázky jsou nyní skutečné PNG soubory z components/vegetable_icons/
// Pole 'obrazek' obsahuje název souboru bez přípony (např. "rajcata", "mrkev")

export const rostliny = [
  {
    id: 1,
    nazev: "Rajče jedlé",
    obrazek: "rajcata",
    kategorie: "Zelenina",
    trat: "Náročná",
    dobriSousedi: ["Bazalka", "Česnek", "Cibule", "Petržel", "Měsíček"],
    spatniSousedi: ["Brambory", "Fenykl", "Kukuřice"]
  },
  {
    id: 2,
    nazev: "Paprika setá",
    obrazek: "paprika",
    kategorie: "Zelenina",
    trat: "Náročná",
    dobriSousedi: ["Bazalka", "Rajče", "Cibule", "Měsíček", "Kopr"],
    spatniSousedi: ["Fenykl", "Brambory", "Kukuřice"]
  },
  {
    id: 3,
    nazev: "Okurka setá",
    obrazek: "okurka",
    kategorie: "Zelenina",
    trat: "Náročná",
    dobriSousedi: ["Kopr", "Fazole", "Hrách", "Salát", "Ředkvička"],
    spatniSousedi: ["Rajče", "Brambory", "Bazalka"]
  },
  {
    id: 4,
    nazev: "Mrkev obecná",
    obrazek: "mrkev",
    kategorie: "Zelenina",
    trat: "Středně náročná",
    dobriSousedi: ["Cibule", "Česnek", "Rozmarýn", "Šalvěj", "Salát"],
    spatniSousedi: ["Kopr", "Fenykl", "Ředkev"]
  },
  {
    id: 5,
    nazev: "Cibule kuchyňská",
    obrazek: "cibule",
    kategorie: "Zelenina",
    trat: "Nenáročná",
    dobriSousedi: ["Mrkev", "Rajče", "Salát", "Jahody", "Měsíček"],
    spatniSousedi: ["Hrách", "Fazole", "Šalvěj"]
  },
  {
    id: 6,
    nazev: "Česnek kuchyňský",
    obrazek: "cesnek",
    kategorie: "Zelenina",
    trat: "Nenáročná",
    dobriSousedi: ["Rajče", "Mrkev", "Salát", "Jahody", "Měsíček"],
    spatniSousedi: ["Hrách", "Fazole", "Šalvěj"]
  },
  {
    id: 7,
    nazev: "Fazole obecná",
    obrazek: "fazole",
    kategorie: "Zelenina",
    trat: "Středně náročná",
    dobriSousedi: ["Okurka", "Salát", "Ředkvička", "Špenát", "Měsíček"],
    spatniSousedi: ["Cibule", "Česnek", "Rajče"]
  },
  {
    id: 8,
    nazev: "Hrách setý",
    obrazek: "hrach",
    kategorie: "Zelenina",
    trat: "Středně náročná",
    dobriSousedi: ["Okurka", "Salát", "Ředkvička", "Špenát", "Měsíček"],
    spatniSousedi: ["Cibule", "Česnek", "Rajče"]
  },
  {
    id: 9,
    nazev: "Brambory",
    obrazek: "brambory",
    kategorie: "Zelenina",
    trat: "Středně náročná",
    dobriSousedi: ["Fazole", "Kukuřice", "Hrách", "Kapusta", "Měsíček"],
    spatniSousedi: ["Rajče", "Okurka", "Dýně"]
  },
  {
    id: 10,
    nazev: "Cuketa",
    obrazek: "cuketa",
    kategorie: "Zelenina",
    trat: "Nenáročná",
    dobriSousedi: ["Fazole", "Hrách", "Kukuřice", "Měsíček", "Nasturtium"],
    spatniSousedi: ["Brambory", "Dýně"]
  },
  {
    id: 11,
    nazev: "Dýně",
    obrazek: "dyne",
    kategorie: "Zelenina",
    trat: "Nenáročná",
    dobriSousedi: ["Kukuřice", "Fazole", "Hrách", "Měsíček", "Nasturtium"],
    spatniSousedi: ["Brambory", "Cuketa"]
  },
  {
    id: 12,
    nazev: "Meloun",
    obrazek: "meloun",
    kategorie: "Ovoce",
    trat: "Náročná",
    dobriSousedi: ["Kukuřice", "Fazole", "Hrách", "Měsíček", "Nasturtium"],
    spatniSousedi: ["Brambory", "Okurka"]
  },
  {
    id: 13,
    nazev: "Jahody",
    obrazek: "jahody",
    kategorie: "Ovoce",
    trat: "Středně náročná",
    dobriSousedi: ["Salát", "Špenát", "Cibule", "Česnek", "Měsíček"],
    spatniSousedi: ["Kapusta", "Brokolice"]
  },
  {
    id: 14,
    nazev: "Růžičková kapusta",
    obrazek: "kapusta",
    kategorie: "Zelenina",
    trat: "Středně náročná",
    dobriSousedi: ["Brambory", "Fazole", "Hrách", "Měsíček", "Šalvěj"],
    spatniSousedi: ["Jahody", "Rajče"]
  }
];

// Kategorie rostlin pro filtrování
export const kategorie = [
  "Všechny",
  "Zelenina", 
  "Bylinka",
  "Ovoce",
  "Květina"
];

// Tratě pro filtrování
export const traty = [
  "Všechny",
  "Nenáročná",
  "Středně náročná", 
  "Náročná"
];
