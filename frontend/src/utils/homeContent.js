import { orderedDestaques } from "./destaques.js";
import { intersectEgressos } from "./egressoFilters.js";
import { directoryPage, readDirectory } from "./egressoDirectory.js";
import { orderedDepoimentos } from "./depoimentos.js";

export function homeContent({ destaques = [], egressos = [], depoimentos = [] }) {
  return {
    stories: orderedDestaques(destaques).slice(0, 6),
    people: directoryPage(intersectEgressos([egressos]), readDirectory("")).items,
    testimonials: orderedDepoimentos(depoimentos).slice(0, 3),
  };
}
