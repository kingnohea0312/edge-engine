/* eslint-disable @typescript-eslint/no-explicit-any */
import { cached, TTL } from "@/lib/cache";

export interface Division {
  categoryName: string;
  champion: { championName: string } | null;
  fighters: string[];
  live?: boolean;
}

/** Dated snapshot of ufc.com/rankings — used as a fallback if the live fetch fails. */
export const RANKS_ASOF = "July 21, 2026";
export const EMBEDDED_RANKS: Division[] = [
  { categoryName: "P4P", champion: null, fighters: ["Islam Makhachev", "Alexander Volkanovski", "Petr Yan", "Justin Gaethje", "Ilia Topuria", "Tom Aspinall", "Sean Strickland", "Merab Dvalishvili", "Alex Pereira", "Ciryl Gane", "Joshua Van", "Khamzat Chimaev", "Alexandre Pantoja", "Arman Tsarukyan", "Charles Oliveira"] },
  { categoryName: "Flyweight", champion: { championName: "Joshua Van" }, fighters: ["Alexandre Pantoja", "Manel Kape", "Brandon Royval", "Tatsuro Taira", "Asu Almabayev", "Lone'er Kavanagh", "Kyoji Horiguchi", "Amir Albazi", "Brandon Moreno", "Kevin Borjas", "Mitch Raposo", "Sumudaerji", "Steve Erceg", "Alex Perez", "Alessandro Costa"] },
  { categoryName: "Bantamweight", champion: { championName: "Petr Yan" }, fighters: ["Merab Dvalishvili", "Umar Nurmagomedov", "Sean O'Malley", "Mario Bautista", "Cory Sandhagen", "Song Yadong", "David Martinez", "Raoni Barcelos", "Farid Basharat", "Marcus McGhee", "Deiveson Figueiredo", "Aiemann Zahabi", "Charles Jourdain", "Bryce Mitchell", "Montel Jackson"] },
  { categoryName: "Featherweight", champion: { championName: "Alexander Volkanovski" }, fighters: ["Movsar Evloev", "Diego Lopes", "Lerone Murphy", "Aljamain Sterling", "Arnold Allen", "Jean Silva", "Pat Sabatini", "Youssef Zalal", "Nathaniel Wood", "Kevin Vallejos", "Melquizael Costa", "Steve Garcia", "Aaron Pico", "Jose Miguel Delgado", "Joanderson Brito"] },
  { categoryName: "Lightweight", champion: { championName: "Justin Gaethje" }, fighters: ["Ilia Topuria", "Arman Tsarukyan", "Charles Oliveira", "Max Holloway", "Paddy Pimblett", "Mateusz Gamrot", "Renato Moicano", "Benoît Saint Denis", "Quillan Salkilld", "Mauricio Ruffy", "Tom Nolan", "Dan Hooker", "Rafael Fiziev", "Grant Dawson", "Rafa Garcia"] },
  { categoryName: "Welterweight", champion: { championName: "Islam Makhachev" }, fighters: ["Carlos Prates", "Ian Machado Garry", "Michael Morales", "Jack Della Maddalena", "Sean Brady", "Gabriel Bonfim", "Belal Muhammad", "Leon Edwards", "Joaquin Buckley", "Kamaru Usman", "Mike Malott", "Michael Venom Page", "Daniel Rodriguez", "Uroš Medić", "Yaroslav Amosov"] },
  { categoryName: "Middleweight", champion: { championName: "Sean Strickland" }, fighters: ["Khamzat Chimaev", "Dricus Du Plessis", "Nassourdine Imavov", "Joe Pyfer", "Brendan Allen", "Caio Borralho", "Anthony Hernandez", "Israel Adesanya", "Gregory Rodrigues", "Christian Leroy Duncan", "Kamaru Usman", "Ikram Aliskerov", "Bo Nickal", "Abus Magomedov", "Nursulton Ruziboev"] },
  { categoryName: "Light Heavyweight", champion: { championName: "Carlos Ulberg" }, fighters: ["Alex Pereira", "Magomed Ankalaev", "Jiří Procházka", "Paulo Costa", "Jamahal Hill", "Khalil Rountree Jr.", "Dominick Reyes", "Azamat Murzakanov", "Bogdan Guskov", "Dustin Jacoby", "Navajo Stirling", "Robert Whittaker", "Alonzo Menifield", "Johnny Walker", "Jan Błachowicz"] },
  { categoryName: "Heavyweight", champion: { championName: "Tom Aspinall" }, fighters: ["Ciryl Gane", "Alexander Volkov", "Sergei Pavlovich", "Alex Pereira", "Josh Hokit", "Waldo Cortes Acosta", "Rizvan Kuniev", "Curtis Blaydes", "Serghei Spivac", "Vitor Petrino", "Valter Walker", "Brando Peričić", "Mario Pinto", "Mick Parkin", "Ryan Spann"] },
  { categoryName: "Women's P4P", champion: null, fighters: ["Valentina Shevchenko", "Kayla Harrison", "Zhang Weili", "Natalia Silva", "Manon Fiorot", "Mackenzie Dern", "Alexa Grasso", "Erin Blanchfield", "Julianna Peña", "Tatiana Suarez", "Virna Jandiroba", "Yan Xiaonan", "Raquel Pennington", "Rose Namajunas", "Maycee Barber"] },
  { categoryName: "Women's Strawweight", champion: { championName: "Mackenzie Dern" }, fighters: ["Zhang Weili", "Virna Jandiroba", "Tatiana Suarez", "Gillian Robertson", "Yan Xiaonan", "Fatima Kline", "Piera Rodriguez", "Denise Gomes", "Mizuki", "Alexia Thainara", "Amanda Lemos", "Loopy Godinez", "Tabatha Ricci", "Jaqueline Amorim", "Talita Alencar"] },
  { categoryName: "Women's Flyweight", champion: { championName: "Valentina Shevchenko" }, fighters: ["Natalia Silva", "Manon Fiorot", "Alexa Grasso", "Erin Blanchfield", "Zhang Weili", "Wang Cong", "Jasmine Jasudavicius", "Rose Namajunas", "Maycee Barber", "Tracy Cortez", "Miranda Maverick", "JJ Aldrich", "Karine Silva", "Eduarda Moura", "Casey O'Neill"] },
  { categoryName: "Women's Bantamweight", champion: { championName: "Kayla Harrison" }, fighters: ["Joselyne Edwards", "Norma Dumont", "Luana Santos", "Ailin Perez", "Julianna Peña", "Yana Santos", "Jacqueline Cavalcanti", "Michelle Montague", "Melissa Croden", "Karol Rosa", "Bia Mesquita", "Macy Chiasson", "Daria Zhelezniakova", "Raquel Pennington", "Klaudia Sygula"] },
];

const decode = (s: string) =>
  s
    .replace(/&#0?39;|&#x27;|&rsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();

const shortDiv = (n: string) =>
  n
    .replace("Men's Pound-for-Pound Top Rank", "P4P")
    .replace("Women's Pound-for-Pound Top Rank", "Women's P4P")
    .replace(" Division", "")
    .replace(" Top Rank", "")
    .trim();

/** Parse the ufc.com/rankings HTML (server-side — no browser CORS wall). */
function parseRankings(html: string): Division[] {
  const out: Division[] = [];
  const groups = html.split('<div class="view-grouping">').slice(1);
  for (const seg of groups) {
    const titleM = seg.match(/<div class="view-grouping-header">([\s\S]*?)<\/div>/);
    if (!titleM) continue;
    const categoryName = shortDiv(decode(titleM[1]));
    const champM = seg.match(/rankings--athlete--champion[\s\S]*?<h5><a[^>]*>([\s\S]*?)<\/a>/);
    const champion = champM ? { championName: decode(champM[1]) } : null;
    const fighters: string[] = [];
    const re = /<td class="views-field views-field-title"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(seg)) !== null) fighters.push(decode(m[1]));
    if (fighters.length >= 5) out.push({ categoryName, champion, fighters, live: true });
  }
  return out;
}

/** Live rankings from ufc.com, cached; falls back to the dated embedded snapshot. */
export async function getRankings(): Promise<{ divisions: Division[]; live: boolean; asOf: string }> {
  return cached("rankings", TTL.rankings, async () => {
    try {
      const r = await fetch("https://www.ufc.com/rankings", {
        headers: { "user-agent": "Mozilla/5.0 (compatible; EdgeEngine/1.0)" },
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const html = await r.text();
      const divisions = parseRankings(html);
      if (divisions.length >= 8) return { divisions, live: true, asOf: "live" };
      throw new Error("parse yielded too few divisions");
    } catch {
      return { divisions: EMBEDDED_RANKS, live: false, asOf: RANKS_ASOF };
    }
  });
}
