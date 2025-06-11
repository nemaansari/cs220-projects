import { FluentBusinesses } from "./FluentBusinesses.js";
import { fetchAndCacheYelpData } from "../include/data.js";


const city = "Framingham";
const state = "MA";
const category = "martialarts";
const minStars = 1.0;

(async () => {
  try {
    
    const businesses = await fetchAndCacheYelpData(city, category);
   console.log(`📦 Fetched ${businesses.length} businesses:\n`);
businesses.forEach((b, i) => {
  console.log(`${i + 1}. ${b.name} (${b.stars}⭐, ${b.review_count} reviews) — ${b.city}, ${b.state}`);
  console.log(`   Categories: ${b.categories?.join(", ")}`);
});
   

    const filtered = new FluentBusinesses(businesses)
      .fromCityInState(city, state)
      .inCategory(category)
      .hasStarsGeq(minStars)
      .mostReviews();
  

    if (filtered) {
      console.log(`Best ${category} in ${city}, ${state}:`, filtered.name, `(${filtered.stars}⭐, ${filtered.review_count} reviews)`);
    } else {
      console.log(`No ${category} matched the filter in ${city}, ${state}.`);
    }
  } catch (err) {
    console.error("Failed to fetch or filter businesses:", err);
  }
})();
