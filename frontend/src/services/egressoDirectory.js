import { getCollection } from "./collections.js";
import { egressoQueries, intersectEgressos } from "../utils/egressoFilters.js";

export async function loadDirectory(get, filters) {
  return intersectEgressos(await Promise.all(egressoQueries(filters).map(path => getCollection(get, path))));
}

// Cache belongs to one mounted directory. Failed sections remain retryable.
export function createDirectoryDetailsCache() {
  const cache = new Map();
  let generation = 0;
  return {
    clear: () => { generation += 1; cache.clear(); },
    async load(get, ids) {
      const currentGeneration = generation;
      const entries = await Promise.all([...new Set(ids.map(String))].map(async id => {
        const details = { cursos: [], cargos: [], errors: {} };
        await Promise.all([["cursos", "cursos_egresso"], ["cargos", "cargos"]].map(async ([section, endpoint]) => {
          const key = `${id}:${section}`;
          try {
            let data = cache.get(key);
            if (!cache.has(key)) {
              data = await getCollection(get, `/api/egressos/egresso/${encodeURIComponent(id)}/${endpoint}`);
              if (generation === currentGeneration) {
                cache.set(key, data);
                if (cache.size > 200) cache.delete(cache.keys().next().value);
              }
            }
            details[section] = data;
          } catch (error) {
            details.errors[section] = error;
          }
        }));
        return [id, details];
      }));
      return Object.fromEntries(entries);
    },
  };
}
