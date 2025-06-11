import type { Business } from "../include/data.js";

export class FluentBusinesses {
  private data: Business[];

  constructor(data: Business[]) {
    this.data = data;
  }

  getData(): Business[] {
    return this.data;
  }

  private applyFilter(filterFunction: (business: Business) => boolean): FluentBusinesses {
    const filteredData = this.data.filter(filterFunction);
    return new FluentBusinesses(filteredData);
  }

  fromCityInState(city: string, state: string): FluentBusinesses {
    return this.applyFilter(business => business.city?.toUpperCase() === city.toUpperCase() && business.state?.toUpperCase() === state.toUpperCase());
  }

  fromState(state: string): FluentBusinesses {
    return this.applyFilter(business => business.state?.toUpperCase() === state.toUpperCase());
  }

  hasStarsGeq(stars: number): FluentBusinesses {
    return this.applyFilter(business => business.stars != undefined && business.stars >= stars);
  }

  inCategory(category: string): FluentBusinesses {
    return this.applyFilter(business => business.categories !== undefined && business.categories.includes(category));
  }

  hasHoursOnDays(days: string[]): FluentBusinesses {
    return this.applyFilter(business => days.every(day => business.hours !== undefined && day in business.hours));
  }

  hasAmbience(ambience: string): FluentBusinesses {
    return this.applyFilter(
      business =>
        business.attributes !== undefined &&
        business.attributes.Ambience !== undefined &&
        business.attributes.Ambience[ambience]
    );
  }

  bestPlace(): Business | undefined {
    if (this.data.length === 0) {
      return undefined;
    }

    return this.data.reduce((best, current) => {
      if ((current.stars || 0) > (best.stars || 0)) {
        return current;
      }

      if ((current.stars || 0) === (best.stars || 0) && (current.review_count || 0) > (best.review_count || 0)) {
        return current;
      }

      return best;
    });
  }

  mostReviews(): Business | undefined {
    if (this.data.length === 0) {
      return undefined;
    }

    return this.data.reduce((highest, current) => {
      if ((current.review_count || 0) > (highest.review_count || 0)) {
        return current;
      }

      return highest;
    });
  }
}
